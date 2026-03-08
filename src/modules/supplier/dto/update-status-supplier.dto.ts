import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommonStatus } from 'src/generated/prisma/enums';

export class UpdateSupplierStatusDto {

  @ApiProperty({
    enum: CommonStatus,
    example: 'ACTIVE',
  })
  @IsEnum(CommonStatus)
  status: CommonStatus;
}