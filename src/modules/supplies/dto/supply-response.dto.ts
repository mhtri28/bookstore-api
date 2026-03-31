import { SupplyStatus } from 'src/generated/prisma/enums';

export class MappedSupplyDetail {
  supply_detail_id?: number;
  book_id: number;
  title?: string;
  quantity: number;
  imported_price: number;
}

export class MappedSupplySupplier {
  supplier_id: number;
  name: string;
}

export class MappedSupply {
  supply_id: number;
  supplier_id: number;
  total_amount: number;
  imported_at: Date;
  status: SupplyStatus;
  supplier?: MappedSupplySupplier;
  details?: MappedSupplyDetail[];
}

export class CreateSupplyResDTO {
  message: string;
  supply: MappedSupply;

  constructor(partial: Partial<CreateSupplyResDTO>) {
    Object.assign(this, partial);
  }
}

export class GetSupplyResDTO extends CreateSupplyResDTO {}

export class UpdateSupplyResDTO extends CreateSupplyResDTO {}

export class GetSuppliesResDTO {
  message: string;
  data: MappedSupply[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(partial: Partial<GetSuppliesResDTO>) {
    Object.assign(this, partial);
  }
}

export class ActionSupplyResDTO {
  message: string;

  constructor(partial: Partial<ActionSupplyResDTO>) {
    Object.assign(this, partial);
  }
}