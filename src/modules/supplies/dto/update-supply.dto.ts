import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateSupplyBodyDTO } from './create-supply.dto';

export class UpdateSupplyBodyDTO extends PartialType(
  OmitType(CreateSupplyBodyDTO, ['supplierId']),
) {}