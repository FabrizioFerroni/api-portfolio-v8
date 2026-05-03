import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from '../guards/apikey-auth.guard';

export const ApiKeyLogin = () => {
  return applyDecorators(UseGuards(ApiKeyAuthGuard));
};
