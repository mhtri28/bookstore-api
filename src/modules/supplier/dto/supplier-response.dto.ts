import type { SupplierModel } from 'src/generated/prisma/models';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierResDTO {
  @ApiProperty({ example: 'Supplier created successfully' })
  message: string;

  @ApiProperty({ type: Object })
  supplier: SupplierModel;

  constructor(partial: Partial<CreateSupplierResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateSupplierResDTO extends CreateSupplierResDTO {}

export class GetSupplierResDTO extends CreateSupplierResDTO {}

export class GetSuppliersResDTO {
  @ApiProperty({ example: 'Suppliers retrieved successfully' })
  message: string;

  @ApiProperty({ type: [Object] })
  suppliers: SupplierModel[];

  constructor(partial: Partial<GetSuppliersResDTO>) {
    Object.assign(this, partial);
  }
}

export class DeleteSupplierResDTO {
  @ApiProperty({ example: 'Supplier deleted successfully' })
  message: string;

  @ApiProperty({ type: Object, required: false })
  supplier?: SupplierModel;

  constructor(partial: Partial<DeleteSupplierResDTO>) {
    Object.assign(this, partial);
  }
}