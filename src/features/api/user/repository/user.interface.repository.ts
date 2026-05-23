import { MongoDBInterfaceRepository } from '@/config/database/mongodb/mongo.base.interface';
import { User, UserDocument } from '../schema/user.schema';
import { Injectable } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { CreateUserDto } from '../dto/create.dto';

@Injectable()
export abstract class IUserRepository extends MongoDBRepository<UserDocument> {
  abstract findByEmail(email: string): Promise<UserDocument | null>;
  abstract getAllUsers(): Promise<UserDocument[]>;
  abstract findOneUserById(id: string): Promise<UserDocument | null>;
  abstract userAlredyExist(email: string, id?: string): Promise<boolean>;
  abstract createUser(data: User): Promise<User>;
  abstract updateUser(id: string, user: Partial<User>): Promise<boolean>;
  abstract removeUser(id: string): Promise<boolean>;
}
