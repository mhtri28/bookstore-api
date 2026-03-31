import { IsEnum } from 'class-validator';
import { CommonStatus } from 'src/generated/prisma/enums';

export class UpdateSupplierStatusDto {
  @IsEnum(CommonStatus)
  status: CommonStatus;
}