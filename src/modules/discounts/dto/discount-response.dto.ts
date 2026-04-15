import type { DiscountModel } from 'src/generated/prisma/models';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscountResDTO {
  @ApiProperty({ example: 'Discount created successfully' })
  message: string;

  @ApiProperty({ type: Object })
  discount: DiscountModel;

  constructor(partial: Partial<CreateDiscountResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateDiscountResDTO extends CreateDiscountResDTO {}

export class GetDiscountResDTO extends CreateDiscountResDTO {}

export class GetDiscountsResDTO {
  @ApiProperty({ example: 'Discounts retrieved successfully' })
  message: string;

  @ApiProperty({ type: [Object] })
  discounts: DiscountModel[];

  constructor(partial: Partial<GetDiscountsResDTO>) {
    Object.assign(this, partial);
  }
}

export class DeleteDiscountResDTO {
  @ApiProperty({ example: 'Discount deleted successfully' })
  message: string;

  @ApiProperty({ type: Object, required: false })
  discount?: DiscountModel;

  constructor(partial: Partial<DeleteDiscountResDTO>) {
    Object.assign(this, partial);
  }
}

export class ApplyDiscountResDTO {
  @ApiProperty({ example: 'Discount applied successfully' })
  message: string;

  @ApiProperty({ example: 15.00 })
  discount_amount: number;

  @ApiProperty({ example: 135.00 })
  final_total: number;

  constructor(partial: Partial<ApplyDiscountResDTO>) {
    Object.assign(this, partial);
  }
}