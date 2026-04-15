import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSupplyBodyDTO } from './create-supply.dto';

export class UpdateSupplyBodyDTO extends PartialType(
  OmitType(CreateSupplyBodyDTO, ['supplierId'] as const),
) {}