# E-Commerce Backend API

A simple e-commerce backend service built with NestJS and MongoDB, demonstrating clean architecture, proper business logic implementation, and best practices.

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Validation**: class-validator, class-transformer
- **Payment**: Paystack
- **Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Paystack account (for payment processing)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The server starts at `http://localhost:3000`.

## API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api/docs
```

## API Endpoints

All endpoints are prefixed with `/v1`.

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/products` | Get all products |

### Cart

All cart endpoints require the `x-user-id` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/cart` | Get cart items |
| POST | `/v1/cart` | Add item to cart |
| PATCH | `/v1/cart/:productId` | Update item quantity |
| DELETE | `/v1/cart/:productId` | Remove item from cart |

### Orders

All order endpoints require the `x-user-id` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/orders/checkout` | Initialize checkout (returns payment URL) |
| GET | `/v1/orders/verify/:reference` | Verify payment and complete order |
| GET | `/v1/orders` | Get order history |

## Business Rules

1. **Stock Validation**: Users cannot add more items than available stock
2. **Stock Reduction**: Product stock is reduced upon successful checkout
3. **Cart Clearing**: Cart is automatically cleared after successful checkout

## Project Structure

```
src/
├── common/
│   ├── exceptions/     # Custom exception classes
│   └── filters/        # Global exception filter
├── config/             # Configuration
├── modules/
│   ├── product/        # Product module
│   ├── cart/           # Cart module
│   └── order/          # Order module
├── app.module.ts
└── main.ts
```

## Sample Request

### Add to Cart

```bash
curl -X POST http://localhost:3000/v1/cart \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{"productId": "PRODUCT_ID", "quantity": 2}'
```

### Checkout

```bash
curl -X POST http://localhost:3000/v1/orders/checkout \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{"email": "customer@example.com"}'
```
