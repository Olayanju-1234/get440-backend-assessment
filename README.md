# E-Commerce Backend API

A backend service for e-commerce operations built with NestJS and MongoDB.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Models](#models)
- [API Endpoints](#api-endpoints)
- [Business Rules](#business-rules)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Usage Examples](#api-usage-examples)

---

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client                                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NestJS Application                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Product   │  │    Cart     │  │    Order    │              │
│  │   Module    │  │   Module    │  │   Module    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                          ▼                                       │
│              ┌───────────────────────┐                          │
│              │    Mongoose ODM       │                          │
│              └───────────┬───────────┘                          │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  products   │  │  cartitems  │  │   orders    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Design Decisions

**1. Modular Architecture**

The application follows NestJS modular architecture with clear separation of concerns:
- Each feature (Product, Cart, Order) is encapsulated in its own module
- Modules contain their own controllers, services, DTOs, and schemas
- Dependencies between modules are explicitly declared

**2. Data Model Design**

- **Product**: Standalone document with stock tracking
- **CartItem**: Separate collection with compound index on (userId, productId) for uniqueness
- **Order**: Contains embedded OrderItem array for atomic order data
- **OrderItem**: Embedded within Order (not a separate collection) to ensure order history integrity

**3. Embedded vs Referenced Documents**

OrderItem is embedded within Order rather than referenced because:
- Order items do not exist independently of orders
- Embedding ensures order history is immutable (price at time of purchase is preserved)
- Reduces database queries when fetching order details

**4. Stock Validation Strategy**

Stock is validated at two points:
- When adding/updating cart items (prevents adding more than available)
- At checkout (double-check before order creation)

**5. Cart Aggregation**

Cart retrieval uses MongoDB aggregation pipeline with `$lookup` to fetch product details in a single query, avoiding N+1 query issues.

**6. API Versioning**

All endpoints are versioned (`/v1/`) to support future API evolution without breaking existing clients.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | NestJS |
| Database | MongoDB with Mongoose |
| Language | TypeScript |
| Validation | class-validator, class-transformer |
| Documentation | Swagger/OpenAPI |

---

## Models

The application implements four data models:

### Product
| Field | Type | Description |
|-------|------|-------------|
| name | string | Product name |
| description | string | Product description |
| price | number | Price in kobo |
| stock | number | Available quantity |
| imageUrl | string | Product image URL (optional) |

### Cart Item
| Field | Type | Description |
|-------|------|-------------|
| userId | string | User identifier |
| productId | ObjectId | Reference to Product |
| quantity | number | Quantity in cart |

### Order
| Field | Type | Description |
|-------|------|-------------|
| userId | string | User identifier |
| items | OrderItem[] | Array of order items |
| totalAmount | number | Total price in kobo |
| status | enum | pending, completed, cancelled |
| paymentReference | string | Unique order reference |

### Order Item
| Field | Type | Description |
|-------|------|-------------|
| productId | ObjectId | Reference to Product |
| productName | string | Product name at time of purchase |
| productPrice | number | Price at time of purchase |
| quantity | number | Quantity ordered |

---

## API Endpoints

All endpoints are prefixed with `/v1`. Cart and Order endpoints require the `x-user-id` header.

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/products` | Get all products |

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/cart` | Get cart items for user |
| POST | `/v1/cart` | Add item to cart |
| PATCH | `/v1/cart/:productId` | Update cart item quantity |
| DELETE | `/v1/cart/:productId` | Remove item from cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/orders/checkout` | Process checkout |
| GET | `/v1/orders` | Get user's order history |

---

## Business Rules

1. **Stock Validation**: Users cannot add more items to cart than available stock. The system validates stock on both add and update operations.

2. **Stock Reduction**: When checkout is processed, product stock is reduced by the ordered quantity.

3. **Cart Clearing**: After successful checkout, the user's cart is automatically cleared.

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:Olayanju-1234/get440-backend-assessment.git
cd get440-backend-assessment
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

### Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

The server starts at `http://localhost:3000`.

### API Documentation

Interactive Swagger documentation is available at:
```
http://localhost:3000/api/docs
```

---

## Project Structure

```
src/
├── common/
│   ├── exceptions/          # Custom exception classes
│   └── filters/             # Global exception filter
├── config/                  # Environment configuration
├── modules/
│   ├── product/
│   │   ├── dto/             # Data transfer objects
│   │   ├── schemas/         # Mongoose schemas
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   └── product.module.ts
│   ├── cart/
│   │   ├── dto/
│   │   ├── schemas/
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   └── cart.module.ts
│   └── order/
│       ├── dto/
│       ├── schemas/
│       ├── order.controller.ts
│       ├── order.service.ts
│       └── order.module.ts
├── app.module.ts
└── main.ts
```

---

## API Usage Examples

### Get All Products

```bash
curl http://localhost:3000/v1/products
```

### Add Item to Cart

```bash
curl -X POST http://localhost:3000/v1/cart \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{"productId": "PRODUCT_ID", "quantity": 2}'
```

### Update Cart Item Quantity

```bash
curl -X PATCH http://localhost:3000/v1/cart/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{"quantity": 3}'
```

### Remove Item from Cart

```bash
curl -X DELETE http://localhost:3000/v1/cart/PRODUCT_ID \
  -H "x-user-id: user123"
```

### Checkout

```bash
curl -X POST http://localhost:3000/v1/orders/checkout \
  -H "x-user-id: user123"
```

### Get Orders

```bash
curl http://localhost:3000/v1/orders \
  -H "x-user-id: user123"
```

---

## Bonus Features

The following additional features are available:

### Payment Integration (Paystack)

If Paystack credentials are configured, payment processing is available:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/orders/checkout/paystack` | Initialize Paystack payment |
| GET | `/v1/orders/verify/:reference` | Verify payment and complete order |

### Product Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/products/:id` | Get product by ID |
| POST | `/v1/products` | Create new product |
| PATCH | `/v1/products/:id` | Update product |
