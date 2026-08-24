import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable } from '@nestjs/common';
import { Session, SessionDocument } from '../schema/session.schema';
import { Types } from 'mongoose';

@Injectable()
export abstract class ISessionRepository extends MongoDBRepository<SessionDocument> {
  abstract findActiveById(sessionId: string): Promise<SessionDocument | null>;
  abstract createSession(data: Session): Promise<SessionDocument>;
  abstract updateSession(id: string, data: Partial<Session>): Promise<boolean>;
  abstract touch(sessionId: string): Promise<boolean>;
  abstract revoke(sessionId: string): Promise<boolean>;
  abstract revokeAllExcept(
    userId: Types.ObjectId,
    keepSessionId: string,
  ): Promise<boolean>;
  abstract findActiveByUser(userId: Types.ObjectId): Promise<SessionDocument[]>;
  abstract findByIdWithHash(sessionId: string): Promise<SessionDocument | null>;
  abstract updateRefreshTokenHash(
    sessionId: string,
    refreshTokenHash: string,
  ): Promise<void>;
  abstract rotate(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<boolean>;
}
