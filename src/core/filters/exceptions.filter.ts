import { ModelResponseError } from '@/shared/types/model.response';
import { ApiRoutes } from '@/shared/utils';
import { getHttpStatusMessage } from '@/shared/utils/functions/getHttpStatusCode';
import { MessagesError } from '@/shared/utils/messages/error/messages.error';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse();

      if (
        request.url === ApiRoutes.BASE_PATH &&
        status === HttpStatus.NOT_FOUND
      ) {
        return response.redirect('/api');
      }

      if (
        request.url.includes('estado') &&
        status === HttpStatus.SERVICE_UNAVAILABLE
      ) {
        return response.status(status).json(resp);
      }

      const message =
        status === HttpStatus.TOO_MANY_REQUESTS
          ? MessagesError.TOO_MANY_REQUESTS
          : getHttpStatusMessage(status);

      const body = {
        messageException: message,
        message: resp,
        path: request.url,
        status_code: status,
        timestamp: new Date().toISOString(),
      };

      return response.status(status).json(body);
    } else {
      this.logger.error(exception);

      let rsp: ModelResponseError = {
        statusCode: 0,
        message: '',
        messageServer: null,
        timestamp: '',
        path: '',
      };

      if (process.env.NODE_ENV === 'development') {
        rsp = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: getHttpStatusMessage(HttpStatus.INTERNAL_SERVER_ERROR),
          messageServer: exception,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      } else {
        rsp = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: MessagesError.INTERNAL_EXCEPTION,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(rsp);
    }
  }
}
