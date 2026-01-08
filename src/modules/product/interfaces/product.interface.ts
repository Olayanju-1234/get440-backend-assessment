import { Types } from 'mongoose';

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
