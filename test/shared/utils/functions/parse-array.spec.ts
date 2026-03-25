import { parseSafeArray } from '@/shared/utils/functions/parseArray';

describe('parseSafeArray', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach((): void => {
    consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((): void => {});
  });

  afterEach((): void => {
    consoleSpy.mockRestore();
  });

  it('debe devolver un array vacío si el valor es undefined', () => {
    expect(parseSafeArray(undefined)).toEqual([]);
  });

  it('debe parsear correctamente un array en formato JSON válido', () => {
    const input = '["cola1", "cola2", "cola3"]';
    expect(parseSafeArray(input)).toEqual(['cola1', 'cola2', 'cola3']);
  });

  it('debe manejar correctamente comillas externas', () => {
    const input = '"[\\"cola1\\", \\"cola2\\"]"';
    expect(parseSafeArray(input)).toEqual(['cola1', 'cola2']);
  });

  it('debe manejar correctamente comillas simples externas', () => {
    const input = '\'["cola1", "cola2"]\'';
    expect(parseSafeArray(input)).toEqual(['cola1', 'cola2']);
  });

  it('debe lanzar un error si el contenido no es JSON válido', () => {
    const input = 'no_es_un_json';
    expect((): string[] => parseSafeArray(input)).toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error parsing RABBITMQ_COLAS:',
      input,
    );
  });
});
