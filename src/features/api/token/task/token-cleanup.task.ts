import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenForgotService } from '../service/token.service';

@Injectable()
export class TokenCleanupTask {
  private readonly logger = new Logger(TokenCleanupTask.name);

  constructor(private readonly tokenForgotService: TokenForgotService) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'token-cleanup' })
  async handleCleanup() {
    try {
      const deleted = await this.tokenForgotService.deleteExpiredOrUsed();
      this.logger.log(`Tokens de recuperación eliminados: ${deleted}`);
    } catch (error) {
      this.logger.error('Falló la limpieza de tokens', error);
    }
  }
}
