import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtTokenPayload } from '../types/token-payload';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtTokenPayload, ctx: ExecutionContext) => {
    if (ctx.getType() === 'http') {
      const request = ctx.switchToHttp().getRequest();
      return data ? request.user?.[data] : request.user;
    } else {
      const gqlContext = GqlExecutionContext.create(ctx).getContext();
      const user = gqlContext.user || gqlContext.req?.user;
      return data ? user?.[data] : user;
    }
  },
);
