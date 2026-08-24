import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { SessionService } from '../service/session.service';
import { User } from '@/features/auth/decorators/user.decorator';
import { UserDocument } from '../../user/schema/user.schema';
import { AuthenticatedUser } from '@/features/auth/interface/authenticated-user.interface';

@Controller('sessions')
@Authorize()
@ApiBearerAuth()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async findActive(@User() user: AuthenticatedUser) {
    const sessions = await this.sessionService.findActiveByUser(
      new Types.ObjectId(user.id),
    );

    return sessions.map((s) => ({
      ...s,
      current: s.id === user.sessionId,
    }));
  }

  @Delete(':id')
  async revoke(@Param('id') sessionId: string, @User() user: UserDocument) {
    await this.assertOwnership(sessionId, user.id);
    await this.sessionService.revoke(sessionId);
    return {
      success: true,
      message: `Se cerro la sesión con ${sessionId} correctamente`,
    };
  }

  @Delete()
  async revokeAllExceptCurrent(@User() user: AuthenticatedUser) {
    await this.sessionService.revokeAllExcept(
      new Types.ObjectId(user.id),
      user.sessionId,
    );
    return {
      success: true,
      message: `Se cerraron todas las sesiones correctamente`,
    };
  }

  private async assertOwnership(
    sessionId: string,
    userId: string,
  ): Promise<void> {
    const session = await this.sessionService.findActiveById(sessionId);
    if (!session || session.user.id !== userId) {
      throw new ForbiddenException(
        'No podés revocar una sesión que no es tuya',
      );
    }
  }
}
