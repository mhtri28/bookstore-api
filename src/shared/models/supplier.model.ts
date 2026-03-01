import { CommonStatus } from 'src/generated/prisma/client';

export class SupplierModel {
  supplier_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: CommonStatus;
  created_at: Date;
  updated_at: Date;
  _count?: {
    supplies: number;
  };

  constructor(partial: Partial<SupplierModel>) {
    Object.assign(this, partial);
  }
}
