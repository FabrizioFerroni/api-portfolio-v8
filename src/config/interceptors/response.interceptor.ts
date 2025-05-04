import { SKIP_RESPONSE_KEY } from '@/shared/decorators/skip-response.decorator';
import { ModelResponse } from '@/shared/types/model.response';
import { getHttpStatusMessage } from '@/shared/utils/functions/getHttpStatusCode';
import { MessagesCommon } from '@/shared/utils/messages/common/common.messages';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) return next.handle();

    return next.handle().pipe(
      map((data) => {
        const httpContext = context.switchToHttp();
        const response = httpContext.getResponse();
        const status_code = response.statusCode || HttpStatus.OK;

        const rsp: ModelResponse<Record<string, unknown>> = {
          message: getHttpStatusMessage(status_code),
          data,
          statusCode: status_code,
        };

        return rsp;
      }),
    );
  }
}
