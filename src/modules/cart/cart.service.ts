import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { CartItem, CartItemDocument } from './schemas/cart-item.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { ProductService } from '../product/product.service';
import { ICartItemWithProduct } from './interfaces/cart-item.interface';
import {
  CartItemNotFoundException,
  InsufficientStockException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItemDocument>,
    @InjectConnection() private connection: Connection,
    private productService: ProductService,
  ) {}

  async getCartItems(userId: string): Promise<ICartItemWithProduct[]> {
    const cartItems = await this.cartItemModel.aggregate<ICartItemWithProduct>([
      { $match: { userId } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $project: {
          _id: 1,
          userId: 1,
          productId: 1,
          quantity: 1,
          createdAt: 1,
          updatedAt: 1,
          product: '$productData',
        },
      },
    ]);

    return cartItems;
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartItemDocument> {
    const product = await this.productService.findById(addToCartDto.productId);

    const existingItem = await this.cartItemModel.findOne({
      userId,
      productId: new Types.ObjectId(addToCartDto.productId),
    });

    const totalQuantity = existingItem
      ? existingItem.quantity + addToCartDto.quantity
      : addToCartDto.quantity;

    if (totalQuantity > product.stock) {
      throw new InsufficientStockException(product.name, product.stock);
    }

    if (existingItem) {
      existingItem.quantity = totalQuantity;
      return existingItem.save();
    }

    const cartItem = new this.cartItemModel({
      userId,
      productId: new Types.ObjectId(addToCartDto.productId),
      quantity: addToCartDto.quantity,
    });

    return cartItem.save();
  }

  async updateQuantity(
    userId: string,
    productId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItemDocument> {
    const product = await this.productService.findById(productId);

    if (updateCartItemDto.quantity > product.stock) {
      throw new InsufficientStockException(product.name, product.stock);
    }

    const cartItem = await this.cartItemModel.findOneAndUpdate(
      { userId, productId: new Types.ObjectId(productId) },
      { quantity: updateCartItemDto.quantity },
      { new: true },
    );

    if (!cartItem) {
      throw new CartItemNotFoundException(productId);
    }

    return cartItem;
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    const result = await this.cartItemModel.deleteOne({
      userId,
      productId: new Types.ObjectId(productId),
    });

    if (result.deletedCount === 0) {
      throw new CartItemNotFoundException(productId);
    }
  }

  async clearCart(userId: string, session?: ClientSession): Promise<void> {
    await this.cartItemModel.deleteMany({ userId }, { session });
  }

  async getCartItemsForCheckout(
    userId: string,
  ): Promise<ICartItemWithProduct[]> {
    return this.getCartItems(userId);
  }
}
