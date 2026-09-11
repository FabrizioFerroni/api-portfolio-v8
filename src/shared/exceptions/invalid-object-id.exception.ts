import { BadRequestException } from '@nestjs/common';

export class InvalidObjectIdException extends BadRequestException {
  constructor(id: string, context?: string) {
    super(
      context ? `ID inválido para ${context}: "${id}"` : `ID inválido: "${id}"`,
    );
  }
}
