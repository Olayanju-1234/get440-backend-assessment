import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import axios from 'axios';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CheckoutDto } from './dto';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import {
  CheckoutResponse,
  PaystackInitResponse,
  PaystackVerifyResponse,
} from './interfaces/order.interface';
import {
  EmptyCartException,
  InsufficientStockException,
  PaymentVerificationException,
  OrderNotFoundException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class OrderService {
  private readonly paystackSecretKey: string;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectConnection() private connection: Connection,
    private cartService: CartService,
    private productService: ProductService,
    private configService: ConfigService,
  ) {
    this.paystackSecretKey = this.configService.get<string>(
      'PAYSTACK_SECRET_KEY',
      '',
    );
  }

  async initiateCheckout(
    userId: string,
    checkoutDto: CheckoutDto,
  ): Promise<CheckoutResponse> {
    const cartItems = await this.cartService.getCartItemsForCheckout(userId);

    if (cartItems.length === 0) {
      throw new EmptyCartException();
    }

    if (!this.paystackSecretKey) {
      throw new PaymentVerificationException(
        'Paystack secret key is not configured. Please set PAYSTACK_SECRET_KEY in your environment variables.',
      );
    }

    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        throw new InsufficientStockException(
          item.product.name,
          item.product.stock,
        );
      }
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const reference = `order_${Date.now()}_${userId.slice(-6)}`;

    const response = await axios.post<PaystackInitResponse>(
      `${this.paystackBaseUrl}/transaction/initialize`,
      {
        email: checkoutDto.email,
        amount: totalAmount,
        reference,
        metadata: {
          userId,
          cartItemCount: cartItems.length,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
      accessCode: response.data.data.access_code,
    };
  }

  async verifyAndCompleteOrder(
    userId: string,
    reference: string,
  ): Promise<OrderDocument> {
    const existingOrder = await this.orderModel.findOne({
      paymentReference: reference,
    });

    if (existingOrder) {
      if (existingOrder.userId !== userId) {
        throw new OrderNotFoundException(reference);
      }
      return existingOrder;
    }

    const response = await axios.get<PaystackVerifyResponse>(
      `${this.paystackBaseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      },
    );

    if (response.data.data.status !== 'success') {
      throw new PaymentVerificationException(
        `Payment verification failed: ${response.data.data.status}`,
      );
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const cartItems = await this.cartService.getCartItemsForCheckout(userId);

      if (cartItems.length === 0) {
        throw new EmptyCartException();
      }

      for (const item of cartItems) {
        if (item.quantity > item.product.stock) {
          throw new InsufficientStockException(
            item.product.name,
            item.product.stock,
          );
        }
      }

      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        productPrice: item.product.price,
        quantity: item.quantity,
      }));

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      const order = new this.orderModel({
        userId,
        items: orderItems,
        totalAmount,
        status: OrderStatus.COMPLETED,
        paymentReference: reference,
      });

      await order.save({ session });

      for (const item of cartItems) {
        await this.productService.reduceStock(
          item.productId,
          item.quantity,
          session,
        );
      }

      await this.cartService.clearCart(userId, session);

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      void session.endSession();
    }
  }

  async getOrders(userId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getOrderById(userId: string, orderId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId).lean().exec();

    if (!order || order.userId !== userId) {
      throw new OrderNotFoundException(orderId);
    }

    return order;
  }
}
