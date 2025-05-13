import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import { JwtAuthGuard } from '@/features/auth/guards/jwt-auth.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';

jest.mock('@nestjs/common', () => {
  const originalModule = jest.requireActual('@nestjs/common');
  return {
    ...originalModule,
    applyDecorators: jest.fn((...decorators) => {
      return jest.fn();
    }),
    UseGuards: jest.fn((...guards) => {
      return `UseGuardsMockCalledWith_${guards.map((g) => g.name || g).join('_')}`;
    }),
  };
});

describe('Authorize Decorator', () => {
  const mockApplyDecorators = applyDecorators as jest.Mock;
  const mockUseGuards = UseGuards as jest.Mock;

  beforeEach(() => {
    mockApplyDecorators.mockClear();
    mockUseGuards.mockClear();
  });

  it('should be defined', () => {
    expect(Authorize).toBeDefined();
  });

  it('should call applyDecorators with the result of UseGuards(JwtAuthGuard)', () => {
    Authorize();

    expect(mockUseGuards).toHaveBeenCalledTimes(1);
    expect(mockUseGuards).toHaveBeenCalledWith(JwtAuthGuard);
    expect(mockApplyDecorators).toHaveBeenCalledTimes(1);
    const expectedUseGuardsResult = `UseGuardsMockCalledWith_${JwtAuthGuard.name}`;
    expect(mockApplyDecorators).toHaveBeenCalledWith(expectedUseGuardsResult);
  });

  it('should return a function (the result of applyDecorators)', () => {
    const decoratorFunction = Authorize();
    expect(typeof decoratorFunction).toBe('function');
  });
});
