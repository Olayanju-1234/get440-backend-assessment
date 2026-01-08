import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { CartItemDocument } from './schemas/cart-item.schema';
import { ICartItemWithProduct } from './interfaces/cart-item.interface';

@ApiTags('Cart')
@Controller('cart')
@ApiHeader({
  name: 'x-user-id',
  description: 'User identifier',
  required: true,
})
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart items for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of cart items with product details',
  })
  async getCartItems(
    @Headers('x-user-id') userId: string,
  ): Promise<ICartItemWithProduct[]> {
    return this.cartService.getCartItems(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addToCart(
    @Headers('x-user-id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartItemDocument> {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateQuantity(
    @Headers('x-user-id') userId: string,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItemDocument> {
    return this.cartService.updateQuantity(
      userId,
      productId,
      updateCartItemDto,
    );
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeFromCart(
    @Headers('x-user-id') userId: string,
    @Param('productId') productId: string,
  ): Promise<{ message: string }> {
    await this.cartService.removeFromCart(userId, productId);
    return { message: 'Item removed from cart' };
  }
}
