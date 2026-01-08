import { Types } from 'mongoose';
import { OrderStatus } from '../schemas/order.schema';

export interface IOrderItem {
  productId: Types.ObjectId;
  productName: string;
  productPrice: number;
  quantity: number;
}

export interface IOrder {
  _id: Types.ObjectId;
  userId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutResponse {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
  };
}
