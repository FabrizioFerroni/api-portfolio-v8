import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type UrlMode = 'full' | 'base';

export const RequestUrl = createParamDecorator(
  (mode: UrlMode = 'base', ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const base = `${request.protocol}://${request.get('host')}`;
    return mode === 'full' ? `${base}${request.url}` : base;
  },
);
