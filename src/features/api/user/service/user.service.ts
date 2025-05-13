import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create.dto';
import { UserRepository } from '../repository/user.repository';
import { User, UserDocument } from '../schema/user.schema';
import { TransformDto } from '@/shared/utils';
import { UserResponseDto } from '../dto/response/response.dto';
import { plainToInstance } from 'class-transformer';
import { UserError, UserMessages } from '../messages/general.messages';
import { hashPassword } from '@/shared/utils/functions/validate-passwords';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUserRepository } from '../repository/user.interface.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: IUserRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<UserDocument, UserResponseDto>,
  ) {}

  transformArray(data: UserDocument[]) {
    return this.transform.transformDtoArray(data, UserResponseDto);
  }

  transformObject(data: UserDocument) {
    return this.transform.transformDtoObject(data, UserResponseDto);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users: UserDocument[] = await this.userRepo.getAllUsers();
    return this.transformArray(users);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOneUserById(id);

    if (!user) {
      throw new NotFoundException(UserError.USER_NOT_FOUND);
    }

    return this.transformObject(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException(UserError.USER_NOT_FOUND);
    }
    return this.transformObject(user);
  }

  async create(data: CreateUserDto): Promise<string> {
    delete data.password_verify;
    const userAlredyExist = await this.userRepo.userAlredyExist(data.email);

    if (userAlredyExist) {
      throw new BadRequestException(UserError.USER_ALREADY_EXIST);
    }

    const newUser = {};

    if (data.password) data.password = await hashPassword(data.password);

    for (const key in data) {
      if (data[key] ?? false) newUser[key] = data[key];
    }

    const result: User = await this.userRepo.createUser(newUser as User);

    if (!result) {
      throw new BadRequestException(UserError.USER_ERROR);
    }

    return UserMessages.USER_CREATED;
  }

  async updateUser(id: string, data: UpdateUserDto) {
    delete data.password_verify;
    const userAlredyExist = await this.userRepo.userAlredyExist(data.email, id);

    if (userAlredyExist) {
      throw new BadRequestException(UserError.USER_ALREADY_EXIST);
    }

    const user = await this.userRepo.findOneUserById(id);

    if (!user) {
      throw new NotFoundException(UserError.USER_NOT_FOUND);
    }

    if (data.password) data.password = await hashPassword(data.password);

    const userToUpdate: Partial<User> = {};

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        userToUpdate[key] = data[key];
      }
    }

    userToUpdate.updatedAt = new Date();

    const userUpdated = await this.userRepo.updateUser(
      id,
      userToUpdate as User,
    );

    if (!userUpdated) {
      return UserError.USER_ERROR;
    }

    return UserMessages.USER_UPDATED;
  }

  async delete(id: string): Promise<string> {
    const user = await this.userRepo.findOneUserById(id);

    if (!user) {
      throw new NotFoundException(UserError.USER_NOT_FOUND);
    }

    const userDeleted = await this.userRepo.removeUser(id);

    if (!userDeleted) {
      return UserError.USER_ERROR;
    }

    return UserMessages.USER_REMOVED;
  }
}
