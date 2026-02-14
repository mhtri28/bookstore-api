import { IsEnum, IsOptional } from 'class-validator';
import { Role, UserStatus } from 'src/generated/prisma/enums';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

export class GetUsersQueryDTO extends PaginationDto {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  search?: string;
}
