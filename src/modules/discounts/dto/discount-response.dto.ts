import { DiscountModel } from 'src/generated/prisma/models';

export class CreateDiscountResDTO {
  message: string;
  discount: DiscountModel;

  constructor(partial: Partial<CreateDiscountResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateDiscountResDTO extends CreateDiscountResDTO {}

export class GetDiscountResDTO extends CreateDiscountResDTO {}

export class GetDiscountsResDTO {
  message: string;
  discounts: DiscountModel[];

  constructor(partial: Partial<GetDiscountsResDTO>) {
    Object.assign(this, partial);
  }
}

export class DeleteDiscountResDTO {
  message: string;
  discount?: DiscountModel;

  constructor(partial: Partial<DeleteDiscountResDTO>) {
    Object.assign(this, partial);
  }
}

export class ApplyDiscountResDTO {
  message: string;
  discount_amount: number;
  final_total: number;

  constructor(partial: Partial<ApplyDiscountResDTO>) {
    Object.assign(this, partial);
  }
}