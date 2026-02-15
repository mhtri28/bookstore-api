import { SupplyStatus } from 'src/generated/prisma/client';
import { SupplyDetailModel } from 'src/shared/models/supply-detail.model';

export class SupplyModel {
  supply_id: number;
  imported_at: Date;
  updated_at: Date;
  total_amount: number;
  status: SupplyStatus;
  details: SupplyDetailModel[];

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
