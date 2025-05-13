import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@/features/api/user/repository/user.repository';
import { TransformDto } from '@/shared/utils';
import { UserService } from '@/features/api/user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { configApp } from '@/config/app/config.app';
import { User, UserDocument } from '@/features/api/user/schema/user.schema';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { validatePassword } from '@/shared/utils/functions/validate-passwords';
import { UpdateUserDto } from '@/features/api/user/dto/update-user.dto';
import { Types, Document as MongooseDocument } from 'mongoose';
import { AuthService } from '@/features/auth/services/auth.service';
import { AuthResponseDto } from '@/features/auth/dtos/response-auth.dto';
import { AuthMessagesError } from '@/features/auth/errors/error-messages';
import { LoginDto } from '@/features/auth/dtos/login.dto';
import { TokenService } from '@/shared/services/token.service';
import { PayloadDto } from '@/features/auth/dtos/payload.dto';
import { RefreshtokenDto } from '@/features/auth/dtos/refresh-token.dto';
import { LoginResponseAuth } from '@/features/auth/interface/login-response.interface';

jest.mock('@/config/app/config.app');
jest.mock('@/shared/utils/functions/validate-passwords');

export type UserPartForLoginResponse = Pick<
  AuthResponseDto,
  '_id' | 'name' | 'lastname' | 'email' | 'avatar'
>;

type ExpectedUserInResponse = {
  id: string;
  name: string;
  lastname: string;
  email: string;
  avatar: string;
};

/* const mockUserDocument = (
  id: string,
  email: string,
  passwordHash: string,
  active: boolean,
  otherProps: Partial<User> = {},
): UserDocument => {
  const defaultUser: Partial<User> = {
    _id: new Types.ObjectId(id),
    name: otherProps.name || 'Test',
    lastname: otherProps.lastname || 'User',
    email: email,
    password: passwordHash,
    avatar:
      otherProps.avatar ||
      'https://res.cloudinary.com/fabrizio-dev/image/upload/v1671107994/fabrizio-dev/default_user_acmdr1.webp',
    active: active,
    createdAt: otherProps.createdAt || new Date(),
    updatedAt: otherProps.updatedAt || null,
  };

  const userWithOverrides = { ...defaultUser, ...otherProps };

  return {
    ...userWithOverrides,
    _id: userWithOverrides._id,
    save: jest.fn().mockResolvedValue(this),
    toJSON: jest.fn().mockReturnValue(userWithOverrides),
  } as unknown as UserDocument; 
};*/

const mockUserDocument = (
  idString: string,
  email: string,
  passwordHash: string,
  active: boolean,
  otherPropsToMerge: Partial<User> = {}, // User (clase POJO) NO debe tener _id
): UserDocument => {
  const objectId = new Types.ObjectId(idString);

  const userClassProperties: User = {
    name: otherPropsToMerge.name || 'Test',
    lastname: otherPropsToMerge.lastname || 'User',
    email: email,
    password: passwordHash,
    avatar:
      otherPropsToMerge.avatar ||
      'https://res.cloudinary.com/fabrizio-dev/image/upload/v1671107994/fabrizio-dev/default_user_acmdr1.webp',
    active: active,
    createdAt: otherPropsToMerge.createdAt || new Date(),
    updatedAt: otherPropsToMerge.updatedAt || null,
    // ... cualquier otra propiedad de la clase User
  };

  // 1. Combinar las propiedades de la clase User y otherPropsToMerge
  // El orden aquí significa que otherPropsToMerge puede sobrescribir userClassProperties
  // si tienen claves en común (lo cual está bien para name, lastname, etc. si se pasan).
  const combinedProps = {
    ...userClassProperties,
    ...otherPropsToMerge,
  };

  // 2. Construir el objeto final que simula UserDocument, añadiendo _id al final
  // para asegurar que es el nuestro y no uno de otherPropsToMerge (si tuviera _id).
  const finalDocumentObject = {
    ...combinedProps,
    _id: objectId, // Añadir/Sobrescribir _id aquí para que sea el ObjectId correcto
  };

  // console.log('mockUserDocument - finalDocumentObject:', JSON.stringify(finalDocumentObject, null, 2));

  const doc = {
    ...finalDocumentObject,
    save: jest.fn(),
    toJSON: jest.fn().mockReturnValue(finalDocumentObject),
  } as unknown as UserDocument;
  (doc.save as jest.Mock).mockResolvedValue(doc);

  return doc;
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let transformDtoMock: jest.Mocked<
    TransformDto<UserDocument, AuthResponseDto>
  >;
  let userServiceMock: jest.Mocked<UserService>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let mockConfigApp: jest.MockedFunction<typeof configApp>;
  let mockValidatePassword: jest.MockedFunction<typeof validatePassword>;
  let tokenServiceMock: jest.Mocked<TokenService>;

  const mockApiKey = 'test-api-key';
  const mockMaxPassFailures = 3;
  const mockJwtRefreshSecret = 'test-refresh-secret';

  beforeEach(async () => {
    mockConfigApp = configApp as jest.MockedFunction<typeof configApp>;
    mockConfigApp.mockReturnValue({
      apiKey: mockApiKey,
      max_pass_failures: mockMaxPassFailures,
      secret_jwt_refresh: mockJwtRefreshSecret,
    } as unknown as ReturnType<typeof configApp>);

    mockValidatePassword = validatePassword as jest.MockedFunction<
      typeof validatePassword
    >;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: UserRepository,
          useValue: { findByEmail: jest.fn(), updateUser: jest.fn() },
        },
        {
          provide: TransformDto,
          useValue: {
            transformDtoArray: jest.fn(),
            transformDtoObject: jest.fn(),
          },
        },
        { provide: UserService, useValue: {} },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        {
          provide: TokenService,
          useValue: {
            verifyTokenCatch: jest.fn(),
            refreshJWTToken: jest.fn(),
            generateJWTToken: jest.fn() as jest.Mock<
              LoginResponseAuth | string,
              [PayloadDto, UserDocument?]
            >,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepositoryMock = module.get(UserRepository);
    transformDtoMock = module.get(TransformDto);
    transformDtoMock = module.get(TransformDto);
    userServiceMock = module.get(UserService);
    jwtServiceMock = module.get(JwtService);
    tokenServiceMock = module.get(TokenService);

    (service as any).failedLoginAttempts.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformArray', () => {
    it('should call transform.transformDtoArray and return its result', () => {
      const users = [
        mockUserDocument(
          new Types.ObjectId().toString(),
          'test1@example.com',
          'hash1',
          true,
          {
            name: 'User One',
            lastname: 'Test',
            avatar: 'avatar1.png',
          },
        ),
      ] as UserDocument[];
      // Lo que esperamos que transformDtoArray devuelva (simulando class-transformer)
      const expectedDtoArray: Partial<AuthResponseDto>[] = [
        {
          /* _id: new Types.ObjectId().toString(), */
          name: 'User One',
          lastname: 'Test',
          email: 'test1@example.com',
          avatar: 'avatar1.png',
        },
      ];
      transformDtoMock.transformDtoArray.mockReturnValue(
        expectedDtoArray as AuthResponseDto[],
      );

      const result = service.transformArray(users);

      expect(transformDtoMock.transformDtoArray).toHaveBeenCalledWith(
        users,
        AuthResponseDto, // Se pasa la clase DTO real
      );
      expect(result).toEqual(expectedDtoArray);
    });
  });

  describe('transformObject', () => {
    it('should call transform.transformDtoObject and return its result', () => {
      const user = mockUserDocument(
        new Types.ObjectId().toString(),
        'test1@example.com',
        'hash1',
        true,
        {
          name: 'User One',
          lastname: 'Test',
          avatar: 'avatar1.png',
        },
      );
      // Lo que esperamos que transformDtoObject devuelva (simulando class-transformer)
      const expectedDto: Partial<AuthResponseDto> = {
        _id: new Types.ObjectId().toString(),
        name: 'User One',
        lastname: 'Test',
        email: 'test1@example.com',
        avatar: 'avatar1.png',
      };
      transformDtoMock.transformDtoObject.mockReturnValue(
        expectedDto as AuthResponseDto,
      );

      const result = service.transformObject(user);

      expect(transformDtoMock.transformDtoObject).toHaveBeenCalledWith(
        user,
        AuthResponseDto, // Se pasa la clase DTO real
      );
      expect(result).toEqual(expectedDto);
    });
  });

  describe('validateApiKey', () => {
    it('should return true if apiKey matches env apiKey', () => {
      expect(service.validateApiKey(mockApiKey)).toBe(true);
    });
    it('should return false if apiKey does not match env apiKey', () => {
      expect(service.validateApiKey('wrong-key')).toBe(false);
    });
  });

  describe('handleFailedLogin', () => {
    const email = 'test@example.com';
    const userId = new Types.ObjectId().toString();
    it('should increment failed attempts and not throw if below threshold', async () => {
      await service.handleFailedLogin(email, userId);
      expect((service as any).failedLoginAttempts.get(email)).toBe(1);
      await service.handleFailedLogin(email, userId);
      expect((service as any).failedLoginAttempts.get(email)).toBe(2);
      expect(userRepositoryMock.updateUser).not.toHaveBeenCalled();
    });
    it('should block user and throw BadRequestException if attempts reach threshold', async () => {
      for (let i = 0; i < mockMaxPassFailures - 1; i++) {
        (service as any).failedLoginAttempts.set(email, i + 1);
      }
      await expect(service.handleFailedLogin(email, userId)).rejects.toThrow(
        new BadRequestException(AuthMessagesError.USER_BLOCKED),
      );
      expect((service as any).failedLoginAttempts.has(email)).toBe(false);
      expect(userRepositoryMock.updateUser).toHaveBeenCalledWith(userId, {
        active: false,
      });
    });
  });

  describe('handleSuccessfulLogin', () => {
    it('should delete email from failedLoginAttempts', () => {
      const email = 'test@example.com';
      (service as any).failedLoginAttempts.set(email, 2);
      service.handleSuccessfulLogin(email);
      expect((service as any).failedLoginAttempts.has(email)).toBe(false);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const userDoc = mockUserDocument(
      new Types.ObjectId().toString(),
      loginDto.email,
      'hashedPassword',
      true,
      { name: 'Pedro', lastname: 'Perez', avatar: 'pedro.png' },
    );

    const expectedUserTransformed: Partial<
      Omit<AuthResponseDto, 'access_token' | 'refresh_token'>
    > = {
      _id: new Types.ObjectId().toString(),
      name: userDoc.name,
      lastname: userDoc.lastname,
      email: userDoc.email,
      avatar: userDoc.avatar,
      // Campos excluidos no deben estar aquí: active, password, createdAt, updatedAt
    };

    it('should successfully login a user and return transformed user data (no tokens)', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(userDoc);
      mockValidatePassword.mockResolvedValue(true);
      // El servicio de transformación devuelve el objeto de usuario como lo haría class-transformer
      transformDtoMock.transformDtoObject.mockReturnValue(
        expectedUserTransformed as AuthResponseDto,
      );
      jest.spyOn(service, 'handleSuccessfulLogin').mockResolvedValue(undefined); // Asegurar que es mockeado si es async

      const result = await service.login(loginDto);

      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
        loginDto.email.toLowerCase(),
      );
      expect(mockValidatePassword).toHaveBeenCalledWith(
        loginDto.password,
        userDoc.password,
      );
      expect(service.handleSuccessfulLogin).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(transformDtoMock.transformDtoObject).toHaveBeenCalledWith(
        userDoc,
        AuthResponseDto,
      );
      expect(result).toEqual(expectedUserTransformed);
    });

    it('should convert email to lowercase before searching', async () => {
      const loginDtoUpper: LoginDto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };
      userRepositoryMock.findByEmail.mockResolvedValue(userDoc);
      mockValidatePassword.mockResolvedValue(true);
      transformDtoMock.transformDtoObject.mockReturnValue(
        expectedUserTransformed as AuthResponseDto,
      );

      await service.login(loginDtoUpper);
      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
        loginDtoUpper.email.toLowerCase(),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(
        new NotFoundException(AuthMessagesError.USER_NOT_FOUND),
      );
    });

    it('should throw BadRequestException if user is not active', async () => {
      const inactiveUser = mockUserDocument(
        new Types.ObjectId().toString(),
        loginDto.email,
        'hashedPassword',
        false,
      );
      userRepositoryMock.findByEmail.mockResolvedValue(inactiveUser);
      await expect(service.login(loginDto)).rejects.toThrow(
        new BadRequestException(AuthMessagesError.USER_IS_NOT_ACTIVE),
      );
    });

    it('should throw BadRequestException and call handleFailedLogin for invalid password (not blocking)', async () => {
      // Crear una instancia de userDoc fresca y específica para este test
      const currentTestUserId = new Types.ObjectId();
      const specificUserDoc = mockUserDocument(
        currentTestUserId.toString(),
        loginDto.email, // Usa el loginDto del scope del describe
        'passwordForThisTest',
        true,
      );

      userRepositoryMock.findByEmail.mockResolvedValue(specificUserDoc); // Usa la instancia específica
      mockValidatePassword.mockResolvedValue(false);

      const handleFailedLoginSpy = jest
        .spyOn(service, 'handleFailedLogin')
        .mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow(
        new BadRequestException(AuthMessagesError.PASSWORD_OR_EMAIL_INVALID),
      );

      expect(handleFailedLoginSpy).toHaveBeenCalledWith(
        loginDto.email,
        specificUserDoc._id.toString(),
      );
    });

    it('should throw USER_BLOCKED if handleFailedLogin (called internally) blocks the user', async () => {
      const currentTestUserIdBlocked = new Types.ObjectId();
      const specificUserDocForBlock = mockUserDocument(
        currentTestUserIdBlocked.toString(),
        loginDto.email,
        'passwordForBlockTest',
        true,
      );

      userRepositoryMock.findByEmail.mockResolvedValue(specificUserDocForBlock);
      mockValidatePassword.mockResolvedValue(false);

      jest
        .spyOn(service, 'handleFailedLogin')
        .mockRejectedValueOnce(
          new BadRequestException(AuthMessagesError.USER_BLOCKED),
        );

      await expect(service.login(loginDto)).rejects.toThrow(
        new BadRequestException(AuthMessagesError.USER_BLOCKED),
      );

      expect(service.handleFailedLogin).toHaveBeenCalledWith(
        loginDto.email,
        specificUserDocForBlock._id.toString(),
      );
    });
  });

  describe('generateJWTTokenAuth', () => {
    let activeUserDocForThisTest: UserDocument;
    let mockFullTokenResponse: LoginResponseAuth;
    let expectedPayloadForTokenService: PayloadDto;
    const testUserId = new Types.ObjectId(); // Un ObjectId para este test

    beforeEach(() => {
      // Un beforeEach específico para este describe
      // Crear el activeUserDoc manualmente para este conjunto de tests
      // Esto bypassa mockUserDocument temporalmente para este bloque problemático
      const rawUserObject = {
        _id: testUserId, // Usar el ObjectId directamente
        email: 'active-specific@example.com',
        password: 'hashedPasswordSpecific',
        active: true,
        name: 'Active Specific',
        lastname: 'User Specific',
        avatar: 'specific_avatar.png',
        createdAt: new Date(),
        updatedAt: null,
        // Asegúrate de incluir todas las propiedades que tu tipo User/UserDocument podría tener,
        // incluso si son opcionales, para que coincida lo más posible con un UserDocument real.
      };

      activeUserDocForThisTest = {
        ...rawUserObject,
        _id: rawUserObject._id, // Asegurar que _id (ObjectId) está aquí
        // Mockear los métodos de Mongoose Document que podrían ser llamados o esperados
        save: jest.fn().mockResolvedValue(this), // 'this' aquí es problemático, mejor mockResolvedValue(activeUserDocForThisTest) cuando esté definido
        toJSON: jest.fn().mockReturnValue(rawUserObject), // toJSON devuelve el objeto plano
        // Añade otros métodos si son necesarios (lean, populate, etc.)
      } as unknown as UserDocument;

      // Para que save devuelva la instancia mockeada (comportamiento común)
      (activeUserDocForThisTest.save as jest.Mock).mockResolvedValue(
        activeUserDocForThisTest,
      );

      // --- DEBUG CRÍTICO ---
      if (!activeUserDocForThisTest || !activeUserDocForThisTest._id) {
        console.error(
          '!!! generateJWTTokenAuth beforeEach: activeUserDocForThisTest o su _id es undefined !!!',
        );
        console.log(
          'activeUserDocForThisTest:',
          JSON.stringify(activeUserDocForThisTest, null, 2),
        );
        throw new Error(
          'Fallo crítico en la creación de activeUserDocForThisTest',
        );
      }
      // --- FIN DEBUG ---

      mockFullTokenResponse = {
        user: {
          _id: activeUserDocForThisTest._id.toString(), // Ahora debería funcionar
          name: activeUserDocForThisTest.name,
          lastname: activeUserDocForThisTest.lastname,
          email: activeUserDocForThisTest.email,
          avatar: activeUserDocForThisTest.avatar,
        } as any,
        access_token: 'mockAccessTokenFromTokenService',
        refresh_token: 'mockRefreshTokenFromTokenService',
      };

      expectedPayloadForTokenService = {
        email: activeUserDocForThisTest.email,
        id: activeUserDocForThisTest._id.toString(),
      };
    });

    it('should call tokenService.generateJWTToken and return its result for an active user', () => {
      tokenServiceMock.generateJWTToken.mockReturnValue(mockFullTokenResponse); // Asumiendo síncrono

      const result = service.generateJWTTokenAuth(activeUserDocForThisTest); // Usar la versión local

      expect(tokenServiceMock.generateJWTToken).toHaveBeenCalledWith(
        expectedPayloadForTokenService,
        activeUserDocForThisTest,
      );
      expect(result).toEqual(mockFullTokenResponse);
    });

    it('should throw BadRequestException if the user is not active', () => {
      // Crear un usuario inactivo manualmente para este test
      const inactiveUserDocForThisTest = {
        _id: new Types.ObjectId(),
        email: 'inactive-specific@example.com',
        password: 'hashedPasswordInactive',
        active: false, // Inactivo
        name: 'Inactive Specific',
        lastname: 'User Specific',
        avatar: 'inactive_specific_avatar.png',
        createdAt: new Date(),
        updatedAt: null,
        save: jest.fn().mockResolvedValue(this),
        toJSON: jest.fn().mockReturnValue({
          /* ...el objeto plano... */
        }),
      } as unknown as UserDocument;
      // ... (ajustar el mock de save y toJSON para inactiveUserDocForThisTest)

      expect(() =>
        service.generateJWTTokenAuth(inactiveUserDocForThisTest),
      ).toThrow(new BadRequestException(AuthMessagesError.USER_IS_NOT_ACTIVE));
      expect(tokenServiceMock.generateJWTToken).not.toHaveBeenCalled();
    });
  });

  describe('saveUser', () => {
    it('should call userRepository.updateUser with correct parameters', async () => {
      const userId = new Types.ObjectId().toString();
      const activeStatus = false;
      // Simulamos el usuario que sería devuelto por updateUser
      const mockUpdatedUser = mockUserDocument(
        userId,
        'email@test.com',
        'hash',
        activeStatus,
      );
      userRepositoryMock.updateUser.mockResolvedValue(mockUpdatedUser as any); // Cast si updateUser devuelve User y no UserDocument

      const result = await service.saveUser(userId, activeStatus);

      const expectedUpdatePayload: Partial<UpdateUserDto> = {
        active: activeStatus,
      };
      expect(userRepositoryMock.updateUser).toHaveBeenCalledWith(
        userId,
        expectedUpdatePayload as User,
      );
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  /* refresh */
  describe('refresh', () => {
    const refreshTokenDto: RefreshtokenDto = { token: 'valid-refresh-token' };
    const decodedPayloadFromTokenService: PayloadDto & Record<string, any> = {
      email: 'test@example.com',
      id: 'user-id-123',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const newTokensResponse = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token-from-service',
    };

    it('should successfully refresh tokens if refresh token is valid', () => {
      // Síncrono
      tokenServiceMock.verifyTokenCatch.mockReturnValue(
        decodedPayloadFromTokenService,
      );
      tokenServiceMock.refreshJWTToken.mockReturnValue(newTokensResponse);

      const result = service.refresh(refreshTokenDto);

      expect(tokenServiceMock.verifyTokenCatch).toHaveBeenCalledWith(
        refreshTokenDto.token,
        mockJwtRefreshSecret,
      );

      const expectedPayloadForRefresh: PayloadDto = {
        email: decodedPayloadFromTokenService.email,
        id: decodedPayloadFromTokenService.id,
      };
      expect(tokenServiceMock.refreshJWTToken).toHaveBeenCalledWith(
        expectedPayloadForRefresh,
      );
      expect(result).toEqual(newTokensResponse);
    });

    it('should throw BadRequestException (from TokenService) if refresh token has expired', () => {
      const expectedError = new BadRequestException('El token ha expirado.');
      tokenServiceMock.verifyTokenCatch.mockImplementation(() => {
        throw expectedError;
      });

      expect(() => {
        service.refresh(refreshTokenDto);
      }).toThrow(expectedError);

      expect(tokenServiceMock.verifyTokenCatch).toHaveBeenCalledWith(
        refreshTokenDto.token,
        mockJwtRefreshSecret,
      );
      expect(tokenServiceMock.refreshJWTToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException (from TokenService) if refresh token is invalid (JsonWebTokenError)', () => {
      const expectedError = new BadRequestException('Token inválido.');
      tokenServiceMock.verifyTokenCatch.mockImplementation(() => {
        throw expectedError;
      });

      expect(() => {
        service.refresh(refreshTokenDto);
      }).toThrow(expectedError);

      expect(tokenServiceMock.verifyTokenCatch).toHaveBeenCalledWith(
        refreshTokenDto.token,
        mockJwtRefreshSecret,
      );
      expect(tokenServiceMock.refreshJWTToken).not.toHaveBeenCalled();
    });
  });
  /* fin refresh */
});
