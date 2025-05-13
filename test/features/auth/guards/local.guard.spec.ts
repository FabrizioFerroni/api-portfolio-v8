import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { LocalGuard } from '@/features/auth/guards/local.guard';
import { LoginDto } from '@/features/auth/dtos/login.dto';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(), // Mockear solo la función validate
}));

const mockExecutionContext = (body: any): ExecutionContext => {
  const mockRequest = { body };
  const mockHttpArgumentsHost = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
    getResponse: jest.fn(),
    getNext: jest.fn(),
  };
  return {
    switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;
};

describe('LocalGuard', () => {
  let guard: LocalGuard;
  let mockValidate: jest.Mock;

  let superCanActivateSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockValidate = validate as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalGuard],
    }).compile();

    guard = module.get<LocalGuard>(LocalGuard);

    superCanActivateSpy = jest.spyOn(
      AuthGuard('local').prototype,
      'canActivate',
    );
  });

  afterEach(() => {
    mockValidate.mockClear();
    superCanActivateSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('DTO Validation', () => {
    it('should throw BadRequestException if LoginDto validation fails', async () => {
      const invalidBody = { email: 'test' };
      const context = mockExecutionContext(invalidBody);
      const validationErrors = [
        {
          property: 'password',
          constraints: { isNotEmpty: 'password should not be empty' },
        },
      ];
      mockValidate.mockResolvedValue(validationErrors);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new BadRequestException(['password should not be empty']),
      );
      expect(mockValidate).toHaveBeenCalledWith(expect.any(LoginDto));
      expect(superCanActivateSpy).not.toHaveBeenCalled();
    });

    it('should not throw if LoginDto validation passes', async () => {
      const validBody: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const context = mockExecutionContext(validBody);
      mockValidate.mockResolvedValue([]); // Sin errores de validación
      superCanActivateSpy.mockResolvedValue(true); // Simular que super.canActivate tiene éxito

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(mockValidate).toHaveBeenCalledWith(
        expect.objectContaining(validBody),
      );
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });
  });

  describe('Super Class Activation', () => {
    const validBody: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call super.canActivate and return true if DTO is valid and super allows', async () => {
      const context = mockExecutionContext(validBody);
      mockValidate.mockResolvedValue([]);
      superCanActivateSpy.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });

    it('should call super.canActivate and return false if DTO is valid but super denies', async () => {
      const context = mockExecutionContext(validBody);
      mockValidate.mockResolvedValue([]);
      superCanActivateSpy.mockResolvedValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });

    it('should propagate exceptions from super.canActivate', async () => {
      const context = mockExecutionContext(validBody);
      mockValidate.mockResolvedValue([]);
      const superError = new Error('Super activate failed');
      superCanActivateSpy.mockRejectedValue(superError);

      await expect(guard.canActivate(context)).rejects.toThrow(superError);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });
  });

  describe('Request Body Handling', () => {
    it('should correctly transform and validate the request body', async () => {
      const body = {
        email: 'test@example.com',
        password: 'password123',
        extraField: 'ignored',
      };
      const context = mockExecutionContext(body);
      mockValidate.mockResolvedValue([]);
      superCanActivateSpy.mockResolvedValue(true);

      await guard.canActivate(context);

      const expectedDtoInstance = plainToClass(LoginDto, body);
      expect(mockValidate).toHaveBeenCalledWith(expectedDtoInstance);
    });
  });
});
