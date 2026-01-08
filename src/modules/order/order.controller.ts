import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CheckoutDto } from './dto';
import { OrderDocument } from './schemas/order.schema';
import { CheckoutResponse } from './interfaces/order.interface';

@ApiTags('Orders')
@Controller('orders')
@ApiHeader({
  name: 'x-user-id',
  description: 'User identifier',
  required: true,
})
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Initialize checkout and get payment URL' })
  @ApiResponse({
    status: 201,
    description: 'Checkout initiated, payment URL returned',
  })
  @ApiResponse({ status: 400, description: 'Empty cart or insufficient stock' })
  async checkout(
    @Headers('x-user-id') userId: string,
    @Body() checkoutDto: CheckoutDto,
  ): Promise<CheckoutResponse> {
    return this.orderService.initiateCheckout(userId, checkoutDto);
  }

  @Get('verify/:reference')
  @ApiOperation({ summary: 'Verify payment and complete order' })
  @ApiResponse({ status: 200, description: 'Order completed successfully' })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  async verifyPayment(
    @Headers('x-user-id') userId: string,
    @Param('reference') reference: string,
  ): Promise<OrderDocument> {
    return this.orderService.verifyAndCompleteOrder(userId, reference);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for current user' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  async getOrders(
    @Headers('x-user-id') userId: string,
  ): Promise<OrderDocument[]> {
    return this.orderService.getOrders(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(
    @Headers('x-user-id') userId: string,
    @Param('id') orderId: string,
  ): Promise<OrderDocument> {
    return this.orderService.getOrderById(userId, orderId);
  }
}
