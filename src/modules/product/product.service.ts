import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductNotFoundException } from '../../common/exceptions/business.exception';

@Injectable()
export class ProductService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedProducts();
  }

  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().lean().exec();
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }

  async findByIds(ids: Types.ObjectId[]): Promise<ProductDocument[]> {
    return this.productModel
      .find({ _id: { $in: ids } })
      .lean()
      .exec();
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .lean()
      .exec();

    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }

  async reduceStock(
    productId: Types.ObjectId,
    quantity: number,
    session?: ClientSession,
  ): Promise<void> {
    const result = await this.productModel.updateOne(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { session },
    );

    if (result.modifiedCount === 0) {
      throw new ProductNotFoundException(productId.toString());
    }
  }

  private async seedProducts(): Promise<void> {
    const count = await this.productModel.countDocuments();
    if (count > 0) {
      return;
    }

    const products: CreateProductDto[] = [
      {
        name: 'Wireless Bluetooth Headphones',
        description:
          'Premium noise-cancelling headphones with 30-hour battery life',
        price: 25000,
        stock: 50,
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      },
      {
        name: 'Smart Fitness Watch',
        description:
          'Track your health with heart rate monitoring and GPS tracking',
        price: 45000,
        stock: 30,
        imageUrl:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      },
      {
        name: 'Portable Power Bank',
        description: '20000mAh fast-charging power bank with dual USB ports',
        price: 8500,
        stock: 100,
        imageUrl:
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with blue switches',
        price: 18000,
        stock: 25,
        imageUrl:
          'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400',
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with adjustable DPI settings',
        price: 6500,
        stock: 75,
        imageUrl:
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      },
    ];

    await this.productModel.insertMany(products);
  }
}
