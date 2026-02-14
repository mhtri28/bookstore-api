import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from 'src/generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { AuthGuard } from 'src/shared/guards/access-token.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';

export function Auth(...roles: Role[]) {
  return applyDecorators(UseGuards(AuthGuard, RolesGuard), roles.length > 0 ? Roles(...roles) : () => {});
}
