import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../common/types/domain';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);
