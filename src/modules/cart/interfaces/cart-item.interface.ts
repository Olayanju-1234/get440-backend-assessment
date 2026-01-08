import { Types } from 'mongoose';
import { IProduct } from '../../product/interfaces/product.interface';

export interface ICartItem {
  _id: Types.ObjectId;
  userId: string;
  productId: Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItemWithProduct extends ICartItem {
  product: IProduct;
}
