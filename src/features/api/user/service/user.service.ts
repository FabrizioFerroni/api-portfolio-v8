import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create.dto';
import { UserRepository } from '../repository/user.repository';
import { User, UserDocument } from '../schema/user.schema';
import { TransformDto } from '@/shared/utils';
import { UserResponseDto } from '../dto/response/response.dto';
import { plainToInstance } from 'class-transformer';
import { UserError, UserMessages } from '../messages/general.messages';
import {
  hashPassword,
  validatePassword,
} from '@/shared/utils/functions/validate-passwords';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUserRepository } from '../repository/user.interface.repository';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { dirname, extname, join } from 'path';
import { configApp } from '@/config/app/config.app';
import { generateSlug } from '@/shared/utils/functions/generateSlug';
import { UpdatePasswordDto } from '../dto/update-password.dto';

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

  async updateUserProfile(
    id: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    const userAlredyExist = await this.userRepo.userAlredyExist(dto.email, id);

    if (userAlredyExist) {
      throw new BadRequestException(UserError.USER_ALREADY_EXIST);
    }

    const user = await this.userRepo.findOneUserById(id);

    if (!user) {
      throw new NotFoundException(UserError.USER_NOT_FOUND);
    }

    if (file) {
      if (existsSync(user.imagePath)) {
        unlinkSync(user.imagePath);
        this.removeDirectoryIfEmpty(user.imagePath);
      }

      await this.uploadFile(user, file);
    }

    const userToUpdate: Partial<User> = {};

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        userToUpdate[key] = dto[key];
      }
    }

    userToUpdate.updatedAt = new Date();

    const userUpdated = await this.userRepo.updateUser(id, userToUpdate);

    if (!userUpdated) {
      return UserError.USER_ERROR;
    }

    return 'Se ha editado con éxito los datos del perfil';
  }

  async updateUserPassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.userRepo.findOneUserById(id);

    if (!user) {
      throw new NotFoundException(UserError.USER_NOT_FOUND);
    }

    if (!validatePassword(dto.currentPassword, user.password)) {
      throw new BadRequestException('La contraseña actual no coincide');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('La contraseña nueva no coinciden');
    }

    const userToUpdate: Partial<User> = {
      password: await hashPassword(dto.newPassword),
      updatedAt: new Date(),
    };

    const userUpdated = await this.userRepo.updateUser(id, userToUpdate);

    if (!userUpdated) {
      throw new InternalServerErrorException(UserError.USER_ERROR);
    }

    return 'Se ha editado con éxito la contraseña';
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

  private removeDirectoryIfEmpty(filePath: string): void {
    const dir: string = dirname(filePath);

    if (existsSync(dir)) {
      const remaining: string[] = readdirSync(dir);
      if (remaining.length === 0) {
        rmdirSync(dir);
      }
    }
  }

  private async uploadFile(data: UserDocument, file: Express.Multer.File) {
    const id = data._id;
    const folder = join(process.cwd(), 'uploads', 'users', id.toString());
    mkdirSync(folder, { recursive: true });

    const ext = extname(file.originalname);
    const uid =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const fullName = `${data.name} ${data.name}`;
    const filename = `${generateSlug(fullName)}-${uid}${ext}`;
    const filePath = join(folder, filename);

    writeFileSync(filePath, file.buffer);

    data.imageUrl = `/file/users/${id.toString()}/${filename}`;
    data.avatar = `${configApp().frontHost}/file/users/${id.toString()}/${filename}`;
    data.imagePath = filePath;
    data.updatedAt = new Date();

    const update = await this.userRepo.updateUser(id.toString(), data);

    if (!update) {
      throw new InternalServerErrorException(UserError.INTERNAL_SERVER_ERROR);
    }

    return true;
  }
}
