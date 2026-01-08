import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends HttpException {
  constructor(productName: string, availableStock: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Insufficient stock for "${productName}". Available: ${availableStock}`,
        error: 'Insufficient Stock',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class EmptyCartException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cannot checkout with an empty cart',
        error: 'Empty Cart',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ProductNotFoundException extends HttpException {
  constructor(productId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Product with ID "${productId}" not found`,
        error: 'Product Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class CartItemNotFoundException extends HttpException {
  constructor(productId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Cart item for product "${productId}" not found`,
        error: 'Cart Item Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class PaymentVerificationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Payment Verification Failed',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OrderNotFoundException extends HttpException {
  constructor(orderId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Order with ID "${orderId}" not found`,
        error: 'Order Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
