import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({
    description: 'Customer email for payment',
    example: 'customer@example.com',
  })
  @IsEmail()
  email: string;
}
