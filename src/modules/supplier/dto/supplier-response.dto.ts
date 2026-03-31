import { SupplierModel } from 'src/generated/prisma/models';

export class CreateSupplierResDTO {
  message: string;
  supplier: SupplierModel;

  constructor(partial: Partial<CreateSupplierResDTO>) {
    Object.assign(this, partial);
  }
}

export class UpdateSupplierResDTO extends CreateSupplierResDTO {}

export class GetSupplierResDTO extends CreateSupplierResDTO {}

export class GetSuppliersResDTO {
  message: string;
  suppliers: SupplierModel[];

  constructor(partial: Partial<GetSuppliersResDTO>) {
    Object.assign(this, partial);
  }
}

export class DeleteSupplierResDTO {
  message: string;
  supplier?: SupplierModel;

  constructor(partial: Partial<DeleteSupplierResDTO>) {
    Object.assign(this, partial);
  }
}