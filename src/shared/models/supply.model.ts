import { Exclude } from 'class-transformer';
import { SupplyStatus } from 'src/generated/prisma/client';
import { SupplierModel } from 'src/shared/models/supplier.model';
import { SupplyDetailModel } from 'src/shared/models/supply-detail.model';

export class SupplyModel {
  supply_id: number;
  imported_at: Date;
  updated_at: Date;
  total_amount: number;
  status: SupplyStatus;
  @Exclude()
  supplier_id: number;
  supplier: SupplierModel;
  details?: SupplyDetailModel[];
  _count?: {
    details: number;
  };

  constructor(partial: Partial<SupplyModel>) {
    Object.assign(this, partial);

    // Convert Decimal sang number
    if (this.total_amount) {
      this.total_amount = Number(this.total_amount);
    }

    // Convert nested details
    if (this.details && Array.isArray(this.details)) {
      this.details = this.details.map((detail) => new SupplyDetailModel(detail));
    }
  }
}
