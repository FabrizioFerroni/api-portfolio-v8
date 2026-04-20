import {
  remapInternationalCharToAscii,
  generateSlug,
} from '@/shared/utils/functions/generateSlug';

describe('remapInternationalCharToAscii', () => {
  describe('grupos de vocales', () => {
    it.each([
      // grupo 'a'
      ['à', 'a'],
      ['å', 'a'],
      ['á', 'a'],
      ['â', 'a'],
      ['ä', 'a'],
      ['ã', 'a'],
      ['ą', 'a'],
      // grupo 'e'
      ['è', 'e'],
      ['é', 'e'],
      ['ê', 'e'],
      ['ë', 'e'],
      ['ę', 'e'],
      // grupo 'i'
      ['ì', 'i'],
      ['í', 'i'],
      ['î', 'i'],
      ['ï', 'i'],
      ['ı', 'i'],
      // grupo 'o'
      ['ò', 'o'],
      ['ó', 'o'],
      ['ô', 'o'],
      ['õ', 'o'],
      ['ö', 'o'],
      ['ø', 'o'],
      ['ő', 'o'],
      ['ð', 'o'],
      // grupo 'u'
      ['ù', 'u'],
      ['ú', 'u'],
      ['û', 'u'],
      ['ü', 'u'],
      ['ŭ', 'u'],
      ['ů', 'u'],
    ])('"%s" → "%s"', (input, expected) => {
      expect(remapInternationalCharToAscii(input)).toBe(expected);
    });
  });

  describe('grupos de consonantes', () => {
    it.each([
      ['ç', 'c'],
      ['ć', 'c'],
      ['č', 'c'],
      ['ĉ', 'c'],
      ['ż', 'z'],
      ['ź', 'z'],
      ['ž', 'z'],
      ['ś', 's'],
      ['ş', 's'],
      ['š', 's'],
      ['ŝ', 's'],
      ['ñ', 'n'],
      ['ń', 'n'],
      ['ý', 'y'],
      ['ÿ', 'y'],
      ['ğ', 'g'],
      ['ĝ', 'g'],
    ])('"%s" → "%s"', (input, expected) => {
      expect(remapInternationalCharToAscii(input)).toBe(expected);
    });
  });

  describe('chars únicos con mapeo directo', () => {
    it.each([
      ['ř', 'r'],
      ['ł', 'l'],
      ['đ', 'd'],
      ['ĥ', 'h'],
      ['ĵ', 'j'],
    ])('"%s" → "%s"', (input, expected) => {
      expect(remapInternationalCharToAscii(input)).toBe(expected);
    });
  });

  describe('mapeos multi-char', () => {
    it('ß → ss', () => {
      expect(remapInternationalCharToAscii('ß')).toBe('ss');
    });

    it('Þ → th (case-sensitive: solo la mayúscula tiene mapeo)', () => {
      expect(remapInternationalCharToAscii('Þ')).toBe('th');
    });

    it('þ (minúscula) → "" (sin mapeo)', () => {
      // La función hace lowercase internamente, pero Þ.toLowerCase() = þ que no está en ningún grupo
      expect(remapInternationalCharToAscii('þ')).toBe('');
    });
  });

  describe('case insensitivity (grupos uses toLowerCase)', () => {
    it.each([
      ['À', 'a'],
      ['Á', 'a'],
      ['É', 'e'],
      ['Ü', 'u'],
      ['Ñ', 'n'],
      ['Ç', 'c'],
    ])('"%s" (mayúscula) → "%s"', (input, expected) => {
      expect(remapInternationalCharToAscii(input)).toBe(expected);
    });
  });

  describe('sin mapeo → string vacío', () => {
    it.each([['a'], ['z'], ['0'], ['9'], ['!'], [' '], ['-'], ['@']])(
      '"%s" → ""',
      (input) => {
        expect(remapInternationalCharToAscii(input)).toBe('');
      },
    );
  });
});

describe('generateSlug', () => {
  describe('inputs vacíos o falsy', () => {
    it('string vacío → ""', () => {
      expect(generateSlug('')).toBe('');
    });

    // Si el tipo lo permite en runtime:
    it('null → ""', () => {
      expect(generateSlug(null as unknown as string)).toBe('');
    });

    it('undefined → ""', () => {
      expect(generateSlug(undefined as unknown as string)).toBe('');
    });
  });

  describe('texto básico ASCII', () => {
    it('solo minúsculas y números quedan igual', () => {
      expect(generateSlug('hello world 123')).toBe('hello-world-123');
    });

    it('mayúsculas se convierten a minúsculas', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('todo mayúsculas', () => {
      expect(generateSlug('HELLO')).toBe('hello');
    });

    it('mezcla de mayúsculas y minúsculas', () => {
      expect(generateSlug('camelCaseTitle')).toBe('camelcasetitle');
    });
  });

  describe('separadores y guiones', () => {
    it('múltiples espacios consecutivos → un solo guión', () => {
      expect(generateSlug('a   b')).toBe('a-b');
    });

    it('coma y punto también generan guión', () => {
      expect(generateSlug('a,b.c')).toBe('a-b-c');
    });

    it('todos los separadores soportados', () => {
      expect(generateSlug('a , . / \\ - _ = b')).toBe('a-b');
    });

    it('no empieza con guión (separador al inicio)', () => {
      expect(generateSlug(' hello')).toBe('hello');
    });

    it('no termina con guión (separador al final)', () => {
      expect(generateSlug('hello ')).toBe('hello');
    });

    it('separadores al inicio y al final', () => {
      expect(generateSlug('  hello world  ')).toBe('hello-world');
    });

    it('solo separadores → ""', () => {
      expect(generateSlug('   ,,,   ')).toBe('');
    });
  });

  describe('caracteres internacionales', () => {
    it('ñ → n', () => {
      expect(generateSlug('ñoño')).toBe('nono');
    });

    it('título en español con tildes', () => {
      expect(generateSlug('Canción de cuna')).toBe('cancion-de-cuna');
    });

    it('título con ü', () => {
      expect(generateSlug('Über cool')).toBe('uber-cool');
    });

    it('ß → ss en slug', () => {
      expect(generateSlug('straße')).toBe('strasse');
    });

    it('Þ → th en slug', () => {
      expect(generateSlug('Þór')).toBe('thor');
    });

    it('char internacional sin mapeo se descarta', () => {
      // þ (minúscula de Þ) no tiene mapeo → se omite del resultado
      expect(generateSlug('aþb')).toBe('ab');
    });
  });

  describe('límite de longitud (80 chars)', () => {
    it('string de exactamente 80 chars no se recorta', () => {
      const input = 'a'.repeat(80);
      expect(generateSlug(input)).toBe('a'.repeat(80));
    });

    it('string de 90 chars se trunca cerca de 80', () => {
      const input = 'a'.repeat(90);
      const result = generateSlug(input);
      // El loop va hasta i <= maxLen (80), procesa índice 80 inclusive → 81 chars
      expect(result.length).toBeLessThanOrEqual(81);
    });

    it('no termina con guión tras truncar', () => {
      // separador justo en la posición 80 no debe dejar trailing dash
      const input = 'a'.repeat(79) + ' ' + 'b'.repeat(10);
      const result = generateSlug(input);
      expect(result.endsWith('-')).toBe(false);
    });
  });

  describe('casos borde varios', () => {
    it('solo números', () => {
      expect(generateSlug('12345')).toBe('12345');
    });

    it('emojis y chars sin mapeo se descartan', () => {
      expect(generateSlug('hello 🌍 world')).toBe('hello-world');
    });

    it('un solo carácter válido', () => {
      expect(generateSlug('a')).toBe('a');
    });

    it('un solo separador', () => {
      expect(generateSlug('-')).toBe('');
    });
  });
});
