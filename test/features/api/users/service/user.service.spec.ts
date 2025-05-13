import { Test, TestingModule } from '@nestjs/testing';
import { TransformDto } from '@/shared/utils';
import { BadRequestException } from '@nestjs/common';
import { hashPassword } from '@/shared/utils/functions/validate-passwords';
import { UserService } from '@/features/api/user/service/user.service';
import { UserRepository } from '@/features/api/user/repository/user.repository';
import { CreateUserDto } from '@/features/api/user/dto/create.dto';
import { UserDocument } from '@/features/api/user/schema/user.schema';
import { UserResponseDto } from '@/features/api/user/dto/response/response.dto';
import {
  UserError,
  UserMessages,
} from '@/features/api/user/messages/general.messages';
import { IUserRepository } from '@/features/api/user/repository/user.interface.repository';

jest.mock('@/features/api/user/repository/user.repository');
jest.mock('@/shared/utils'); // Si es necesario mockear TransformDto
jest.mock('@/shared/utils/functions/validate-passwords');
jest.mock('@/shared/utils/functions/validate-passwords', () => ({
  hashPassword: jest.fn(),
}));

const userEmail = `user-${Date.now()}@example.com`;
describe('UserService', () => {
  let service: UserService;
  let userRepo: IUserRepository;
  let transform: TransformDto<UserDocument, UserResponseDto>;
  const createUserDto: CreateUserDto = {
    name: 'Test',
    lastname: 'User',
    email: userEmail,
    password: 'TestPassword123',
    password_verify: 'TestPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: IUserRepository,
          useValue: {
            userAlredyExist: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: TransformDto,
          useValue: {
            transformDtoObject: jest.fn(),
            transformDtoArray: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get<IUserRepository>(IUserRepository);
    transform =
      module.get<TransformDto<UserDocument, UserResponseDto>>(TransformDto);
    (hashPassword as jest.Mock).mockResolvedValue('TestPassword123');
  });

  it('should create a user successfully', async () => {
    const hashed = 'hashedPassword';
    (hashPassword as jest.Mock).mockResolvedValue(hashed);

    // userRepo.userAlredyExist = jest.fn().mockResolvedValue(false);
    userRepo.createUser = jest
      .fn()
      .mockResolvedValue({ ...createUserDto, password: hashed });

    const result = await service.create({ ...createUserDto });

    expect(userRepo.userAlredyExist).toHaveBeenCalledWith(createUserDto.email);
    expect(hashPassword).toHaveBeenCalledWith(createUserDto.password);
    expect(userRepo.createUser).toHaveBeenCalledWith({
      name: 'Test',
      lastname: 'User',
      email: userEmail,
      password: hashed,
    });
    expect(result).toBe(UserMessages.USER_CREATED);
  });

  it('should throw BadRequestException if user already exists', async () => {
    userRepo.userAlredyExist = jest.fn().mockResolvedValue(true);

    await expect(service.create(createUserDto)).rejects.toThrowError(
      new BadRequestException(UserError.USER_ALREADY_EXIST),
    );
  });

  it('should throw BadRequestException if user creation fails', async () => {
    userRepo.userAlredyExist = jest.fn().mockResolvedValue(false);
    userRepo.createUser = jest.fn().mockResolvedValue(null);

    await expect(service.create(createUserDto)).rejects.toThrowError(
      new BadRequestException(UserError.USER_ERROR),
    );
  });
});
