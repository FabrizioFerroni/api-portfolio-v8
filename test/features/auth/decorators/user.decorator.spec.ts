import { ExecutionContext } from '@nestjs/common';
// No importamos User directamente aquí todavía, lo haremos después del mock

// Mock de ExecutionContext (el mismo de antes)
const mockExecutionContext = (userPayload: any): ExecutionContext => {
  const mockHttpArgumentsHost = {
    getRequest: jest.fn().mockReturnValue({ user: userPayload }),
    getResponse: jest.fn(),
    getNext: jest.fn(),
  };
  return {
    switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    // ... (resto de los mocks de ExecutionContext como antes) ...
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
    // Mockear createParamDecorator ANTES de importar el decorador User
    // para capturar la función de fábrica que se le pasa.
    const mockCreateParamDecorator = jest.fn(
      (factory: (data: unknown, ctx: ExecutionContext) => any) => {
        factoryFunction = factory; // Capturamos la función de fábrica
        return () => {
          /* El decorador en sí puede ser un no-op para este test */
        };
      },
    );

    // jest.doMock es necesario para mockear módulos que ya han sido cacheados por Jest
    jest.doMock('@nestjs/common', () => ({
      ...jest.requireActual('@nestjs/common'), // Importar el resto de @nestjs/common
      createParamDecorator: mockCreateParamDecorator,
    }));

    // Importar el decorador User DESPUÉS de que createParamDecorator ha sido mockeado.
    // Esto asegura que nuestro `User` usa el `createParamDecorator` mockeado.
    require('@/features/auth/decorators/user.decorator'); // Esto ejecutará createParamDecorator con la factory
  });

  afterAll(() => {
    // Limpiar mocks para evitar interferencias con otros tests
    jest.unmock('@nestjs/common');
    jest.resetModules(); // Muy importante para que la próxima vez que se importe user.decorator sea el original
  });

  it('should return the user object from the request context', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };
    const context = mockExecutionContext(mockUser);

    // Ahora llamamos a la factoryFunction capturada
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
