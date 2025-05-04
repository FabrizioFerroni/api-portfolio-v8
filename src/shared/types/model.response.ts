import { HttpStatus } from '@nestjs/common';

export class ModelResponse<T> {
  message: string;
  data: T;
  statusCode: HttpStatus;
}

export class ModelResponseError {
  statusCode: string | number;
  message: string | object;
  messageServer?: string | object | null;
  timestamp: string;
  path: string;
}
