import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { IUserRepository } from './user.interface.repository';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { CreateUserDto } from '../dto/create.dto';
import { ObjectId } from 'bson';
import { plainToInstance } from 'class-transformer';
import { UserError } from '../messages/general.messages';

@Injectable()
export class UserRepository
  extends MongoDBRepository<UserDocument>
  implements IUserRepository
{
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }
  async getAllUsers(): Promise<UserDocument[]> {
    const allUsers = await this.findAll();
    const plainUsers: UserDocument[] = allUsers.map((user: UserDocument) =>
      user.toObject(),
    );
    return plainUsers;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });
    return user ? user.toJSON() : null;
  }

  async findOneUserById(id: string | ObjectId): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);
    return user ? user.toJSON() : null;
  }

  async userAlredyExist(email: string, id?: string): Promise<boolean> {
    let result: User;

    if (!id) {
      result = await this.userModel.findOne({ email: String(email) });
    } else {
      result = await this.userModel.findOne({
        email: email,
        _id: { $ne: new ObjectId(id) },
      });
    }

    return !!result;
  }

  async createUser(data: User): Promise<User> {
    const user = plainToInstance(User, data);
    const userCreated = await this.save(user);

    if (!userCreated._id) {
      throw new InternalServerErrorException(UserError.INTERNAL_SERVER_ERROR);
    }

    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<boolean> {
    const query = { $set: data };

    const userUpdated = await this.update(id, query);

    if (!userUpdated.acknowledged || userUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(UserError.INTERNAL_SERVER_ERROR);
    }

    return true;
  }

  async removeUser(id: string): Promise<boolean> {
    const userDeleted = await this.remove(id);

    if (userDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(UserError.INTERNAL_SERVER_ERROR);
    }

    return true;
  }
}
