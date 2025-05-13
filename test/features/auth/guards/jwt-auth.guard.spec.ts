import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport'; // Para espiar el método de la clase base
import { JwtAuthGuard } from '@/features/auth/guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '@/features/auth/decorators/public.decorator';

// Mock de ExecutionContext
const mockExecutionContext = (): ExecutionContext => {
  const mockHttpArgumentsHost = {
    getRequest: jest.fn(),
    getResponse: jest.fn(),
    getNext: jest.fn(),
  };
  return {
    switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    getHandler: jest.fn().mockReturnValue(() => {}),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflectorMock: jest.Mocked<Reflector>;
  let superCanActivateSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflectorMock = module.get(Reflector);

    superCanActivateSpy = jest.spyOn(AuthGuard('jwt').prototype, 'canActivate');
  });

  afterEach(() => {
    superCanActivateSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('Public Routes Handling', () => {
    it('should return true and not call super.canActivate if route is public', () => {
      const context = mockExecutionContext();
      reflectorMock.get.mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflectorMock.get).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        context.getHandler(),
      );
      expect(superCanActivateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Protected Routes Handling', () => {
    it('should call super.canActivate and return its result (true) if route is not public', async () => {
      const context = mockExecutionContext();
      reflectorMock.get.mockReturnValue(false);
      superCanActivateSpy.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflectorMock.get).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        context.getHandler(),
      );
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });

    it('should call super.canActivate and return its result (false) if route is not public', async () => {
      const context = mockExecutionContext();
      reflectorMock.get.mockReturnValue(false);
      superCanActivateSpy.mockResolvedValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });

    it('should propagate exceptions from super.canActivate if route is not public', async () => {
      const context = mockExecutionContext();
      reflectorMock.get.mockReturnValue(false);
      const superError = new Error('JWT validation failed in super');
      superCanActivateSpy.mockRejectedValue(superError);

      await expect(guard.canActivate(context)).rejects.toThrow(superError);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });
  });
});
