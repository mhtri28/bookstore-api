import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from 'src/shared/constants/auth.contants';
import { TokenPayload } from 'src/shared/types/jwt.type';

export const ActiveUser = createParamDecorator((field: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user: TokenPayload | undefined = request[REQUEST_USER_KEY];
  return field ? user?.[field] : user;
});
