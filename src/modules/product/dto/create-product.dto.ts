import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Wireless Headphones' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Price in kobo/cents',
    example: 15000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Available stock quantity', example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
