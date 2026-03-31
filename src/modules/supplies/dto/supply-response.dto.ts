import { SupplyStatus } from 'src/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MappedSupplyDetail {
  @ApiPropertyOptional({ example: 1 })
  supply_detail_id?: number;
  @ApiProperty({ example: 101 })
  book_id: number;
  @ApiPropertyOptional({ example: 'Harry Potter' })
  title?: string;
  @ApiProperty({ example: 50 })
  quantity: number;
  @ApiProperty({ example: 10.5 })
  imported_price: number;
}

export class MappedSupplySupplier {
  @ApiProperty({ example: 1 })
  supplier_id: number;
  @ApiProperty({ example: 'ABC Publishing House' })
  name: string;
}

export class MappedSupply {
  @ApiProperty({ example: 1 })
  supply_id: number;
  @ApiProperty({ example: 1 })
  supplier_id: number;
  @ApiProperty({ example: 525.0 })
  total_amount: number;
  @ApiProperty({ example: '2026-03-31T10:00:00Z' })
  imported_at: Date;
  @ApiProperty({ enum: SupplyStatus, example: 'PENDING' })
  status: SupplyStatus;
  @ApiPropertyOptional({ type: () => MappedSupplySupplier })
  supplier?: MappedSupplySupplier;
  @ApiPropertyOptional({ type: [MappedSupplyDetail] })
  details?: MappedSupplyDetail[];
}

export class CreateSupplyResDTO {
  @ApiProperty({ example: 'Supply created successfully' })
  message: string;
  @ApiProperty({ type: () => MappedSupply })
  supply: MappedSupply;

  constructor(partial: Partial<CreateSupplyResDTO>) {
    Object.assign(this, partial);
  }
}

export class GetSupplyResDTO extends CreateSupplyResDTO {}

export class UpdateSupplyResDTO extends CreateSupplyResDTO {}

export class GetSuppliesResDTO {
  @ApiProperty({ example: 'Supplies retrieved successfully' })
  message: string;
  @ApiProperty({ type: [MappedSupply] })
  data: MappedSupply[];
  @ApiProperty({ example: { total: 10, page: 1, limit: 10, totalPages: 1 } })
  meta: { total: number; page: number; limit: number; totalPages: number };

  constructor(partial: Partial<GetSuppliesResDTO>) {
    Object.assign(this, partial);
  }
}

export class ActionSupplyResDTO {
  @ApiProperty({ example: 'Action performed successfully' })
  message: string;

  constructor(partial: Partial<ActionSupplyResDTO>) {
    Object.assign(this, partial);
  }
}