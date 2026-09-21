import { Injectable } from '@nestjs/common';
import { TokenDocument } from '../schema/token.schema';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';

@Injectable()
export abstract class ITokenRepository extends MongoDBRepository<TokenDocument> {
  abstract deleteExpiredOrUsed(expirationLimit: Date): Promise<number>;
  abstract findById(id: string): Promise<TokenDocument>;
  abstract findByTokenId(tokenId: string): Promise<TokenDocument>;
  abstract saveToken(token: TokenDocument): Promise<TokenDocument>;
  abstract updateToken(id: string, token: TokenDocument): Promise<boolean>;
}
