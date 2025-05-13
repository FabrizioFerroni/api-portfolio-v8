import { ExecutionContext } from '@nestjs/common';

const mockExecutionContext = (userPayload: any): ExecutionContext => {
  const mockHttpArgumentsHost = {
    getRequest: jest.fn().mockReturnValue({ user: userPayload }),
    getResponse: jest.fn(),
    getNext: jest.fn(),
  };
  return {
    switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getType: jest.fn(),
  } as unknown as ExecutionContext;
};

describe('User Decorator (testing factory logic)', () => {
  let factoryFunction: (data: unknown, ctx: ExecutionContext) => any;

  beforeAll(() => {
    const mockCreateParamDecorator = jest.fn(
      (factory: (data: unknown, ctx: ExecutionContext) => any) => {
        factoryFunction = factory; // Capturamos la función de fábrica
        return () => {
          /* El decorador en sí puede ser un no-op para este test */
        };
      },
    );

    jest.doMock('@nestjs/common', () => ({
      ...jest.requireActual('@nestjs/common'),
      createParamDecorator: mockCreateParamDecorator,
    }));

    require('@/features/auth/decorators/user.decorator');
  });

  afterAll(() => {
    jest.unmock('@nestjs/common');
    jest.resetModules();
  });

  it('should return the user object from the request context', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };
    const context = mockExecutionContext(mockUser);

    const result = factoryFunction(undefined, context);

    expect(result).toEqual(mockUser);
    expect(context.switchToHttp).toHaveBeenCalled();
    const httpArgs = context.switchToHttp();
    expect(httpArgs.getRequest).toHaveBeenCalled();
  });

  it('should return undefined if no user is on the request context', () => {
    const context = mockExecutionContext(undefined);

    const result = factoryFunction(undefined, context);

    expect(result).toBeUndefined();
    expect(context.switchToHttp).toHaveBeenCalled();
    const httpArgs = context.switchToHttp();
    expect(httpArgs.getRequest).toHaveBeenCalled();
  });
});
