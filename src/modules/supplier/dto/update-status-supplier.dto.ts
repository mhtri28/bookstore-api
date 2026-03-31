import { IsEnum } from 'class-validator';
import { CommonStatus } from 'src/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupplierStatusDto {
  @ApiProperty({ enum: CommonStatus, example: 'ACTIVE' })
  @IsEnum(CommonStatus)
  status: CommonStatus;
}