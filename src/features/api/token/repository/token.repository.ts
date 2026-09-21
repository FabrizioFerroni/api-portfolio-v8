import { InjectModel } from '@nestjs/mongoose';
import { Token, TokenDocument } from '../schema/token.schema';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ITokenRepository } from './token.interface.repository';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { TokenMessagesError } from '../error/error-messages';

@Injectable()
export class TokenRepository
  extends MongoDBRepository<TokenDocument>
  implements ITokenRepository
{
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<TokenDocument>,
  ) {
    super(tokenModel);
  }

  async deleteExpiredOrUsed(expirationLimit: Date): Promise<number> {
    const { deletedCount } = await this.tokenModel.deleteMany({
      $or: [{ isUsed: true }, { createdAt: { $lt: expirationLimit } }],
    });

    return deletedCount;
  }

  async findById(id: string): Promise<TokenDocument> {
    const token = await this.tokenModel.findById(id);
    return token ? token.toJSON() : null;
  }

  async findByTokenId(tokenId: string): Promise<TokenDocument> {
    const token = await this.tokenModel.findOne({ tokenId });
    return token ? token.toJSON() : null;
  }

  async saveToken(token: TokenDocument): Promise<TokenDocument> {
    const tokenDta: Token = plainToInstance(Token, token);
    const tokenDtaCreated: TokenDocument = await this.save(tokenDta);

    if (!tokenDtaCreated._id) {
      throw new InternalServerErrorException(
        TokenMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    return tokenDtaCreated;
  }

  async updateToken(id: string, token: TokenDocument): Promise<boolean> {
    const tokenDta: Token = plainToInstance(Token, token);

    const query = {
      $set: tokenDta,
    };

    const expUpdated = await this.update(id, query);

    if (!expUpdated.acknowledged) {
      return null;
    }

    if (expUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(
        TokenMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }
}
