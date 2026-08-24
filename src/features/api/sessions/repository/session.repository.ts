import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from '../schema/session.schema';
import { Model, Types } from 'mongoose';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ISessionRepository } from './session.interface.repository';
import { SessionsMsjError } from '../messages/session.message';

@Injectable()
export class SessionRepository
  extends MongoDBRepository<SessionDocument>
  implements ISessionRepository
{
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {
    super(sessionModel);
  }

  async findActiveById(sessionId: string): Promise<SessionDocument | null> {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    return session ? session.toJSON() : null;
  }

  async createSession(data: Session): Promise<SessionDocument> {
    const newSession: SessionDocument = await this.save(data);

    if (!newSession._id)
      throw new InternalServerErrorException(SessionsMsjError.SESSION_CREATE);

    return newSession;
  }

  async updateSession(id: string, data: Partial<Session>): Promise<boolean> {
    const query = {
      $set: data,
    };

    const sessionUpdated = await this.sessionModel.updateOne(
      {
        _id: id,
      },
      query,
    );

    if (!sessionUpdated.acknowledged) {
      return false;
    }

    if (sessionUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(SessionsMsjError.SESSION_UPDATE);
    }

    return true;
  }

  async touch(sessionId: string): Promise<boolean> {
    const sessionUpdated = await this.sessionModel.updateOne(
      { _id: sessionId },
      { lastUsedAt: new Date() },
    );

    if (!sessionUpdated.acknowledged) {
      return false;
    }

    if (sessionUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(SessionsMsjError.SESSION_TOUCH);
    }

    return true;
  }

  async revoke(sessionId: string): Promise<boolean> {
    const sessionUpdated = await this.sessionModel.updateOne(
      { _id: sessionId },
      { revokedAt: new Date() },
    );

    if (!sessionUpdated.acknowledged) {
      return false;
    }

    if (sessionUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(SessionsMsjError.SESSION_REMOVED);
    }

    return true;
  }

  async revokeAllExcept(
    userId: Types.ObjectId,
    keepSessionId: string,
  ): Promise<boolean> {
    const sessionsRemoveds = await this.sessionModel.updateMany(
      { userId, _id: { $ne: keepSessionId }, revokedAt: null },
      { revokedAt: new Date() },
    );

    return sessionsRemoveds.acknowledged;
  }

  async findActiveByUser(userId: Types.ObjectId): Promise<SessionDocument[]> {
    return this.sessionModel
      .find({ userId, revokedAt: null, expiresAt: { $gt: new Date() } })
      .populate('userId')
      .sort({ lastUsedAt: -1 })
      .lean();
  }

  async updateRefreshTokenHash(
    sessionId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.sessionModel.updateOne(
      { _id: sessionId },
      { refreshTokenHash, updatedAt: new Date() },
    );
  }

  async findByIdWithHash(sessionId: string): Promise<SessionDocument | null> {
    return this.sessionModel
      .findById(sessionId)
      .select('+refreshTokenHash')
      .exec();
  }

  async rotate(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const result = await this.sessionModel.updateOne(
      { _id: sessionId },
      {
        refreshTokenHash,
        lastUsedAt: new Date(),
        expiresAt,
      },
    );

    if (!result.acknowledged) return false;
    if (result.modifiedCount !== 1) {
      throw new InternalServerErrorException(SessionsMsjError.SESSION_TOUCH);
    }
    return true;
  }
}
