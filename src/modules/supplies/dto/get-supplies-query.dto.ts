import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { SupplyStatus } from 'src/generated/prisma/enums';
import { IsMinLessThanMax, IsStartDateBeforeEndDate } from 'src/shared/decorators/custom-validator.decorator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

export class GetSuppliesQueryDTO extends PaginationDto {
  @IsOptional()
  @IsEnum(SupplyStatus)
  status?: SupplyStatus;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsMinLessThanMax('maxPrice', {
    message: 'Giá trị tối thiểu phải nhỏ hơn giá trị tối đa',
  })
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsStartDateBeforeEndDate('endDate', {
    message: 'Ngày bắt đầu phải trước ngày kết thúc',
  })
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  search?: string;
}
