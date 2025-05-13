import {
  IS_PUBLIC_KEY,
  Public,
} from '@/features/auth/decorators/public.decorator';
import { SetMetadata } from '@nestjs/common';

// Mockear SetMetadata para espiarlo
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'), // Importar todo lo demás
  SetMetadata: jest.fn(), // Mockear solo SetMetadata
}));

describe('Public Decorator', () => {
  it('should call SetMetadata with IS_PUBLIC_KEY and true', () => {
    // Llamar al decorador (esto no decora nada realmente, solo ejecuta la función)
    Public();

    // Verificar que SetMetadata fue llamado con los argumentos correctos
    expect(SetMetadata).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);
  });

  afterEach(() => {
    // Limpiar mocks después de cada test
    (SetMetadata as jest.Mock).mockClear();
  });
});
