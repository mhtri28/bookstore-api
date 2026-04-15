import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { SupplyStatus } from 'src/generated/prisma/enums';
import { IsMinLessThanMax, IsStartDateBeforeEndDate } from 'src/shared/decorators/custom-validator.decorator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetSuppliesQueryDTO extends PaginationDto {
  @ApiPropertyOptional({ enum: SupplyStatus })
  @IsOptional()
  @IsEnum(SupplyStatus)
  status?: SupplyStatus;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsMinLessThanMax('maxPrice', {
    message: 'Giá trị tối thiểu phải nhỏ hơn giá trị tối đa',
  })
  minPrice?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsStartDateBeforeEndDate('endDate', {
    message: 'Ngày bắt đầu phải trước ngày kết thúc',
  })
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ example: 'keyword' })
  @IsOptional()
  search?: string;
}