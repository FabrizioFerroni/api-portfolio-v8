import { Test, TestingModule } from '@nestjs/testing';
import {
  JwtService,
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from '@nestjs/jwt';
import { configApp } from '@/config/app/config.app';
import { User, UserDocument } from '@/features/api/user/schema/user.schema'; // Ajusta la ruta
import { AuthResponseDto } from '@/features/auth/dtos/response-auth.dto'; // Ajusta la ruta
import { LoginResponseAuth } from '@/features/auth/interface/login-response.interface'; // Ajusta la ruta
import { PayloadDto } from '@/features/auth/dtos/payload.dto'; // Ajusta la ruta
import { BadRequestException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { TokenService } from '@/shared/services/token.service';
import { TransformDto } from '@/shared/utils';

jest.mock('@/config/app/config.app');

const mockUserDocument = (
  idString: string,
  email: string,
  userProperties: Partial<User> = {},
): UserDocument => {
  const objectId = new Types.ObjectId(idString);

  const fullUserObject: User & { _id: Types.ObjectId } = {
    _id: objectId,
    name: userProperties.name || 'TestName',
    lastname: userProperties.lastname || 'TestLastname',
    email: email,
    password: userProperties.password || 'hashedMockPassword',
    avatar: userProperties.avatar || 'https://example.com/default-avatar.png',
    active: userProperties.active === undefined ? true : userProperties.active,
    createdAt: userProperties.createdAt || new Date(),
    updatedAt: userProperties.updatedAt || null,
  };

  const doc = {
    ...fullUserObject,
    save: jest.fn(),
    toJSON: jest.fn().mockReturnValue({
      ...fullUserObject,
    }),
  } as unknown as UserDocument;

  (doc.save as jest.Mock).mockResolvedValue(doc);

  return doc;
};

type UserPartForResponse = Pick<
  AuthResponseDto,
  '_id' | 'name' | 'lastname' | 'email' | 'avatar'
>;

describe('TokenService', () => {
  let service: TokenService;
  let transformDtoMock: jest.Mocked<
    TransformDto<UserDocument, AuthResponseDto>
  >;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let mockConfigApp: jest.MockedFunction<typeof configApp>;

  const mockJwtRefreshSecret = 'test-super-secret-refresh';
  const mockDefaultSecret = 'test-super-secret-default'; // Si jwtService.verify usa un secret por defecto

  beforeEach(async () => {
    mockConfigApp = configApp as jest.MockedFunction<typeof configApp>;
    mockConfigApp.mockReturnValue({
      secret_jwt_refresh: mockJwtRefreshSecret,
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: TransformDto,
          useValue: {
            transformDtoObject: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    transformDtoMock = module.get(TransformDto);
    jwtServiceMock = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateJWTToken', () => {
    const testUserIdString = new Types.ObjectId().toHexString();
    const payload: PayloadDto = {
      email: 'test@example.com',
      id: testUserIdString,
    };
    const userDoc = mockUserDocument(testUserIdString, 'test@example.com');
    const transformedUser: UserPartForResponse = {
      _id: testUserIdString,
      email: 'test@example.com',
      name: 'Test',
      lastname: 'User',
      avatar: 'avatar.png',
    };
    const accessToken = 'mockAccessToken';
    const refreshToken = 'mockRefreshToken';

    it('should generate access and refresh tokens and include transformed user', () => {
      transformDtoMock.transformDtoObject.mockReturnValue(
        transformedUser as AuthResponseDto,
      );
      jwtServiceMock.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = service.generateJWTToken(
        payload,
        userDoc,
      ) as LoginResponseAuth;

      expect(transformDtoMock.transformDtoObject).toHaveBeenCalledWith(
        userDoc,
        AuthResponseDto,
      );
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(payload);
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(payload, {
        secret: mockJwtRefreshSecret,
        expiresIn: '1h',
      });
      expect(result.user).toEqual(transformedUser);
      expect(result.access_token).toBe(accessToken);
      expect(result.refresh_token).toBe(refreshToken);
    });

    it('should handle undefined user by passing undefined to transformDtoObject', () => {
      const emptyTransformedUser = {} as AuthResponseDto;
      transformDtoMock.transformDtoObject.mockReturnValue(emptyTransformedUser);
      jwtServiceMock.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = service.generateJWTToken(
        payload,
        undefined,
      ) as LoginResponseAuth;

      expect(transformDtoMock.transformDtoObject).toHaveBeenCalledWith(
        undefined,
        AuthResponseDto,
      );
      expect(result.user).toEqual(emptyTransformedUser);
    });
  });

  describe('verifyJWTToken', () => {
    const token = 'some.jwt.token';
    const testUserIdString = new Types.ObjectId().toHexString();
    const decodedPayload = {
      userId: testUserIdString,
      email: 'test@example.com',
    };

    it('should call jwtService.verify with token and secret', () => {
      jwtServiceMock.verify.mockReturnValue(decodedPayload);
      const result = service.verifyJWTToken(token, mockDefaultSecret);
      expect(jwtServiceMock.verify).toHaveBeenCalledWith(token, {
        secret: mockDefaultSecret,
      });
      expect(result).toEqual(decodedPayload);
    });

    it('should call jwtService.verify with token and no secret if secret is not provided', () => {
      jwtServiceMock.verify.mockReturnValue(decodedPayload);
      const result = service.verifyJWTToken(token);
      expect(jwtServiceMock.verify).toHaveBeenCalledWith(token, {
        secret: undefined,
      });
      expect(result).toEqual(decodedPayload);
    });
  });

  describe('verifyTokenCatch', () => {
    const token = 'some.jwt.token';
    const secret = 'a-secret';
    const mockPayload = { data: 'somedata' } as Record<string, string>;

    it('should return payload if token is valid', () => {
      const verifySpy = jest
        .spyOn(service, 'verifyJWTToken')
        .mockReturnValue(mockPayload);
      const result = service.verifyTokenCatch(token, secret);
      expect(result).toEqual(mockPayload);
      expect(verifySpy).toHaveBeenCalledWith(token, secret);
      verifySpy.mockRestore();
    });

    it('should throw BadRequestException("El token ha expirado.") on TokenExpiredError', () => {
      const verifySpy = jest
        .spyOn(service, 'verifyJWTToken')
        .mockImplementation(() => {
          throw new TokenExpiredError('jwt expired', new Date());
        });
      expect(() => service.verifyTokenCatch(token, secret)).toThrow(
        new BadRequestException('El token ha expirado.'),
      );
      verifySpy.mockRestore();
    });

    it('should throw BadRequestException("Token inválido.") on JsonWebTokenError', () => {
      const verifySpy = jest
        .spyOn(service, 'verifyJWTToken')
        .mockImplementation(() => {
          throw new JsonWebTokenError('jwt malformed');
        });
      expect(() => service.verifyTokenCatch(token, secret)).toThrow(
        new BadRequestException('Token inválido.'),
      );
      verifySpy.mockRestore();
    });

    it('should throw BadRequestException("El token aún no es válido.") on NotBeforeError', () => {
      const token = 'some.jwt.token';
      const secret = 'a-secret';

      const verifySpy = jest
        .spyOn(service, 'verifyJWTToken')
        .mockImplementation(() => {
          throw new NotBeforeError('jwt not active', new Date());
        });

      expect(() => {
        service.verifyTokenCatch(token, secret);
      }).toThrow(new BadRequestException('El token aún no es válido.')); // <-- ESTO DEBERÍA FUNCIONAR AHORA

      expect(verifySpy).toHaveBeenCalledWith(token, secret);
      verifySpy.mockRestore();
    });

    it('should throw BadRequestException("Error al verificar el token.") on other errors', () => {
      const verifySpy = jest
        .spyOn(service, 'verifyJWTToken')
        .mockImplementation(() => {
          throw new Error('Some other generic error');
        });
      expect(() => service.verifyTokenCatch(token, secret)).toThrow(
        new BadRequestException('Error al verificar el token.'),
      );
      verifySpy.mockRestore();
    });
  });

  describe('refreshJWTToken', () => {
    const testUserIdString = new Types.ObjectId().toHexString();
    const payload: PayloadDto = {
      email: 'refresh@example.com',
      id: testUserIdString,
    };
    const newAccessToken = 'newMockAccessToken';
    const newRefreshToken = 'newMockRefreshToken';

    it('should generate new access and refresh tokens', () => {
      jwtServiceMock.sign
        .mockReturnValueOnce(newAccessToken) // Para access_token
        .mockReturnValueOnce(newRefreshToken); // Para refresh_token

      const result = service.refreshJWTToken(payload);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(payload); // Para access_token
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(payload, {
        // Para refresh_token
        secret: mockJwtRefreshSecret,
        expiresIn: '1h',
      });
      expect(result).toEqual({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      });
    });
  });
});
