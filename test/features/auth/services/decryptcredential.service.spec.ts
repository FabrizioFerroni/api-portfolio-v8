import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as Forge from 'node-forge';
import { DecryptCredentialsService } from '@/features/auth/services/decryptcredentials.service';

jest.mock('fs');

describe('DecryptCredentialsService', () => {
  let service: DecryptCredentialsService;
  let mockConfigService: jest.Mocked<ConfigService>;

  // --- Variables para generar datos de prueba ---
  let testPrivateKeyPem: string;
  let testPublicKeyPem: string;
  const testPassphrase = 'test_super_secret_passphrase';
  const originalCredentials = {
    user: 'testUser',
    password: 'testPassword123',
  };
  let encryptedInput: string;
  let encryptedRandomKeyPart: string;
  let encryptedCredentialsUserPart: string;

  beforeAll(() => {
    const keys = Forge.pki.rsa.generateKeyPair({ bits: 2048 });
    testPublicKeyPem = Forge.pki.publicKeyToPem(keys.publicKey);

    testPrivateKeyPem = Forge.pki.encryptRsaPrivateKey(
      keys.privateKey,
      testPassphrase,
      {
        algorithm: 'aes256',
      },
    );

    const randomAesKey = Forge.random.getBytesSync(32); // 256-bit AES key

    const originalCredentialsString = JSON.stringify(originalCredentials);
    const cipherAes = Forge.cipher.createCipher(
      'AES-ECB',
      Forge.util.createBuffer(randomAesKey),
    );
    cipherAes.start();
    cipherAes.update(
      Forge.util.createBuffer(originalCredentialsString, 'utf8'),
    );
    cipherAes.finish();
    encryptedCredentialsUserPart = Forge.util.encode64(
      cipherAes.output.getBytes(),
    );

    // 4. Encriptar la clave AES aleatoria con la clave pública RSA (RSA-OAEP)
    const publicKey = Forge.pki.publicKeyFromPem(testPublicKeyPem);
    encryptedRandomKeyPart = Forge.util.encode64(
      publicKey.encrypt(randomAesKey, 'RSA-OAEP'),
    );

    encryptedInput = `${encryptedRandomKeyPart}.${encryptedCredentialsUserPart}`;
  });

  beforeEach(async () => {
    const mockFs = fs as jest.Mocked<typeof fs>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecryptCredentialsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PATH_PRIVATE_KEY') {
                return 'dummy/path/to/private.key';
              }
              if (key === 'PASSWORD_PRIVATE_KEY') {
                return testPassphrase;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DecryptCredentialsService>(DecryptCredentialsService);
    mockConfigService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    // Mockear fs.readFileSync para que devuelva nuestra clave privada de prueba
    mockFs.readFileSync.mockReturnValue(testPrivateKeyPem);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('main', () => {
    it('should correctly decrypt the credentials string', () => {
      const decryptedCredentials = service.main(encryptedInput);
      expect(decryptedCredentials).toEqual(originalCredentials);
    });

    it('should throw an error if input string is malformed (e.g., no dot)', () => {
      const malformedInput = 'somerandomstringwithoutadot';
      expect(() => service.main(malformedInput)).toThrow();
    });

    it('should throw an error if randomKey decryption fails (e.g., wrong private key or passphrase)', async () => {
      const originalConfigGet = mockConfigService.get;
      mockConfigService.get = jest.fn((key: string) => {
        if (key === 'PATH_PRIVATE_KEY') return 'dummy/path/to/private.key';
        if (key === 'PASSWORD_PRIVATE_KEY') return 'wrong_passphrase'; // Passphrase incorrecta
        return null;
      }) as any;

      expect(() => service.main(encryptedInput)).toThrow();
      mockConfigService.get = originalConfigGet;
    });
  });

  describe('private methods (indirect testing)', () => {
    it('splitStringCipher should correctly split the input', () => {
      service.main(encryptedInput);

      expect(service['randomKey']).toBeDefined();

      expect(service['credentialsUser']).toBeDefined();
    });

    it('decodeBase64RandomKey should decode the random key', () => {
      service.main(encryptedInput);
      const decodedRandomKeyFromSplit = Forge.util.decode64(
        encryptedRandomKeyPart,
      );
      const serviceRandomKeyAfterDecode = service['randomKey'];

      const tempService = new DecryptCredentialsService(mockConfigService);
      tempService['cipher'] = encryptedInput;
      tempService['splitStringCipher']();
      tempService['decodeBase64RandomKey']();

      expect(tempService['randomKey']).toEqual(decodedRandomKeyFromSplit);
    });
  });

  describe('get splitCipher', () => {
    it('should call splitStringCipher and (ideally) return split parts or ensure state is set', () => {
      service['cipher'] = encryptedInput;

      // Llamar al getter
      const result = service.splitCipher;

      expect(service['randomKey']).toEqual(encryptedRandomKeyPart);

      expect(service['credentialsUser']).toEqual(encryptedCredentialsUserPart);

      expect(result).toBeUndefined();
    });
  });
});
