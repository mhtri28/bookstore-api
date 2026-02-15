import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplyBodyDTO, CreateSupplyResDTO } from './create-supply.dto';

export class UpdateSupplyBodyDTO extends PartialType(CreateSupplyBodyDTO) {}

export class UpdateSupplyResDTO extends CreateSupplyResDTO {}
