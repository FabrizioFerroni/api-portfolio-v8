import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { User, UserDocument } from '@/features/api/user/schema/user.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as Forge from 'node-forge';
import { DecryptCredentialsService } from '@/features/auth/services/decryptcredentials.service';
import { LoginDto } from '@/features/auth/dtos/login.dto';
import * as fs from 'fs';

let e2eTestRsaPublicKeyPem: string;
let e2eTestRsaPrivateKeyPemEncrypted: string;
const E2E_TEST_RSA_PASSPHRASE = 'e2e-super-secret-passphrase-auth'; // Un poco diferente para evitar colisiones si se corre con otros
const E2E_DUMMY_PRIVATE_KEY_PATH = 'dummy/path/for/e2e/auth_private.key.pem';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const encryptCredentialsForLogin = (
  loginDto: LoginDto,
  publicKeyPemToUse: string,
): string => {
  const randomAesKey = Forge.random.getBytesSync(32);
  const originalCredentialsString = JSON.stringify(loginDto);
  const cipherAes = Forge.cipher.createCipher(
    'AES-ECB',
    Forge.util.createBuffer(randomAesKey),
  );
  cipherAes.start();
  cipherAes.update(Forge.util.createBuffer(originalCredentialsString, 'utf8'));
  cipherAes.finish();
  const encryptedCredentialsUserPart = Forge.util.encode64(
    cipherAes.output.getBytes(),
  );
  const publicKey = Forge.pki.publicKeyFromPem(publicKeyPemToUse);
  const encryptedRandomKeyPart = Forge.util.encode64(
    publicKey.encrypt(randomAesKey, 'RSA-OAEP'),
  );
  return `${encryptedRandomKeyPart}.${encryptedCredentialsUserPart}`;
};

@Injectable()
class E2EAuthDecryptMiddleware implements NestMiddleware {
  constructor(private readonly decryptService: DecryptCredentialsService) {}
  use(req: any, res: any, next: (error?: any) => void) {
    const basicHeader = req.headers['basic'];
    if (req.path === '/auth/login' && req.method === 'POST' && basicHeader) {
      try {
        const decryptedJsonString = this.decryptService.main(
          basicHeader as string,
        );
        req.body = JSON.parse(decryptedJsonString);
      } catch (error) {}
    }
    next();
  }
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<UserDocument>;
  let createdUser: UserDocument | null = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  const testUserEmail = `e2e-auth-ctrl-${Date.now()}@example.com`;
  const testUserPassword = 'PasswordE2EAuth123!';
  let hashedPassword = '';

  const originalFsReadFileSync = fs.readFileSync;

  beforeAll(async () => {
    console.log('E2E Auth: Iniciando beforeAll...');
    const keypair = Forge.pki.rsa.generateKeyPair({ bits: 2048 });
    e2eTestRsaPublicKeyPem = Forge.pki.publicKeyToPem(keypair.publicKey);
    e2eTestRsaPrivateKeyPemEncrypted = Forge.pki.encryptRsaPrivateKey(
      keypair.privateKey,
      E2E_TEST_RSA_PASSPHRASE,
      { algorithm: 'aes256' },
    );

    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((pathOrDescriptor: any, options?: any) => {
        if (pathOrDescriptor === E2E_DUMMY_PRIVATE_KEY_PATH) {
          return e2eTestRsaPrivateKeyPemEncrypted;
        }

        return originalFsReadFileSync(pathOrDescriptor, options);
      });

    /*if (!process.env.MONGODB_URI) {
      console.warn(
        'E2E Auth Warning: Variables de entorno para DB no completamente seteadas en process.env. Usando defaults si es posible.',
      );
    }*/

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [E2EAuthDecryptMiddleware, DecryptCredentialsService],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest
          .fn()
          .mockImplementation(
            (keyPath: string, defaultValue?: any): string | undefined => {
              if (keyPath === 'PATH_PRIVATE_KEY')
                return E2E_DUMMY_PRIVATE_KEY_PATH;
              if (keyPath === 'PASSWORD_PRIVATE_KEY')
                return E2E_TEST_RSA_PASSPHRASE;

              const envValue = process.env[keyPath];
              if (envValue !== undefined) return envValue;

              return defaultValue;
            },
          ),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    const e2eDecryptMiddleware = app.get(E2EAuthDecryptMiddleware);
    app.use(e2eDecryptMiddleware.use.bind(e2eDecryptMiddleware));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    try {
      await app.init();
    } catch (initError) {
      console.error(
        'E2E Auth: Error inicializando la aplicación NestJS:',
        initError,
      );
      throw initError;
    }

    try {
      userModel = moduleFixture.get<Model<UserDocument>>(
        getModelToken(User.name),
      );
      await userModel.deleteMany({});
    } catch (modelError) {
      console.error(
        'E2E Auth: Error obteniendo UserModel o limpiando DB:',
        modelError,
      );
      throw modelError;
    }
  });

  afterAll(async () => {
    if (userModel) {
      try {
        await userModel.deleteMany({});
      } catch (e) {
        console.error('Error limpiando DB en afterAll', e);
      }
    }
    if (app) {
      await app.close();
    }
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    accessToken = null;
    refreshToken = null;

    await userModel.deleteOne({ email: testUserEmail });
    hashedPassword = await hashPassword(testUserPassword);

    const userDataToCreate: Partial<User> = {
      name: 'E2EAuth',
      lastname: 'User',
      email: testUserEmail,
      password: hashedPassword,
      active: true,
      avatar: 'default-e2e-avatar.png',
    };

    try {
      createdUser = await userModel.create(userDataToCreate);
      if (!createdUser || !createdUser._id) {
        throw new Error('userModel.create no devolvió un usuario con _id');
      }
    } catch (error) {
      console.error(
        'E2E Auth beforeEach: Error creando usuario:',
        error.message,
        error.stack,
      );
      throw error;
    }
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid ENCRYPTED credentials and return tokens', async () => {
      const loginDto: LoginDto = {
        email: testUserEmail,
        password: testUserPassword,
      };
      const encryptedHeaderValue = encryptCredentialsForLogin(
        loginDto,
        e2eTestRsaPublicKeyPem,
      );

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('basic', encryptedHeaderValue)
        .send({})
        .expect(HttpStatus.OK);

      const { data } = response.body;
      expect(data).toHaveProperty('access_token');
      expect(data).toHaveProperty('refresh_token');
      expect(data.user).toBeDefined();
      expect(data.user.email).toEqual(testUserEmail.toLowerCase());

      if (createdUser?._id) {
        expect(data.user.id).toEqual(createdUser._id.toString());
      } else {
        fail(
          'createdUser o createdUser._id no está definido para la comparación',
        );
      }

      accessToken = data.access_token;
      refreshToken = data.refresh_token;
    });

    it('should return 400 if decrypted DTO is invalid (e.g., missing password)', async () => {
      const invalidLoginDto = { email: testUserEmail } as LoginDto;
      const encryptedHeaderValue = encryptCredentialsForLogin(
        invalidLoginDto,
        e2eTestRsaPublicKeyPem,
      );

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .set('basic', encryptedHeaderValue)
        .send({});

      expect(HttpStatus.BAD_REQUEST).toBe(res.status);
      expect(res.body.message.message).toBeInstanceOf(Array);
      expect(res.body.message.message.join(',')).toContain('password');
    });

    it('should return 400 for incorrect password (with encrypted header)', async () => {
      const loginDto: LoginDto = {
        email: testUserEmail,
        password: 'WrongPassword1234!',
      };
      const encryptedHeaderValue = encryptCredentialsForLogin(
        loginDto,
        e2eTestRsaPublicKeyPem,
      );

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .set('basic', encryptedHeaderValue)
        .send({});

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.message.message).toEqual(
        'Invalid email or password. Please try again',
      );
    });
  });

  describe('/auth/refresh (POST)', () => {
    beforeEach(async () => {
      if (!createdUser || !createdUser._id) {
        // Verificar que createdUser está definido
        throw new Error(
          'createdUser no está definido en beforeEach de /auth/refresh',
        );
      }
      const loginDto: LoginDto = {
        email: testUserEmail,
        password: testUserPassword,
      };
      const encryptedHeaderValue = encryptCredentialsForLogin(
        loginDto,
        e2eTestRsaPublicKeyPem,
      );
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .set('basic', encryptedHeaderValue)
        .send({});
      if (loginResponse.status !== HttpStatus.OK) {
        console.error(
          'Login fallido en beforeEach de refresh:',
          loginResponse.body,
        );
        throw new Error(
          `Login fallido en beforeEach de refresh: ${loginResponse.status}`,
        );
      }
      accessToken = loginResponse.body.data.access_token;
      refreshToken = loginResponse.body.data.refresh_token;
      if (!accessToken || !refreshToken) {
        throw new Error(
          'Fallo al obtener tokens en beforeEach de /auth/refresh',
        );
      }
    });

    it('should refresh tokens with valid tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ token: refreshToken })
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('refresh_token');
      expect(response.body.data.access_token).toEqual(accessToken);
    });
  });

  describe('/auth/profile (GET)', () => {
    beforeEach(async () => {
      if (!createdUser || !createdUser._id) {
        throw new Error(
          'createdUser no está definido en beforeEach de /auth/profile',
        );
      }
      if (!accessToken) {
        const loginDto: LoginDto = {
          email: testUserEmail,
          password: testUserPassword,
        };
        const encryptedHeaderValue = encryptCredentialsForLogin(
          loginDto,
          e2eTestRsaPublicKeyPem,
        );
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .set('basic', encryptedHeaderValue)
          .send({});
        if (loginResponse.status !== HttpStatus.OK) {
          console.error(
            'Login fallido en beforeEach de profile:',
            loginResponse.body,
          );
          throw new Error(
            `Login fallido en beforeEach de profile: ${loginResponse.status}`,
          );
        }
        accessToken = loginResponse.body.data.access_token;
      }
      if (!accessToken) {
        throw new Error(
          'Fallo al obtener accessToken en beforeEach de /auth/profile',
        );
      }
    });

    it('should return user profile with a valid access token', async () => {
      // console.log('E2E Auth Test: Profile - inicio');
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(createdUser!._id.toString());
      expect(response.body.data.email).toEqual(testUserEmail.toLowerCase());
      expect(response.body.data).not.toHaveProperty('password');
    });
  });
});
