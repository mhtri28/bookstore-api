import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateSupplyBodyDTO, CreateSupplyResDTO } from './create-supply.dto';

export class UpdateSupplyBodyDTO extends PartialType(OmitType(CreateSupplyBodyDTO, ['supplierId'])) {}

export class UpdateSupplyResDTO extends CreateSupplyResDTO {}
