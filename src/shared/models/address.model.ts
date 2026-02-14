export class AddressModel {
  address_id: number;
  name: string;
  phone: string;
  shipping_address: string;
  isDefault: boolean;
  created_at: Date;
  updated_at: Date;
  user_id: number;

  constructor(partial: Partial<AddressModel>) {
    Object.assign(this, partial);
  }
}
