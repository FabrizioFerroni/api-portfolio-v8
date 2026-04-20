// ─────────────────────────────────────────────
// Helpers de test

import { MapperHelper } from '@/shared/utils/functions/mapper-response';

// ─────────────────────────────────────────────
interface UserPlain {
  id: number;
  name: string;
}

class UserDocument {
  constructor(
    private id: number,
    private name: string,
  ) {}

  toObject(): UserPlain {
    return { id: this.id, name: this.name };
  }
}

// ─────────────────────────────────────────────
// MapperHelper
// ─────────────────────────────────────────────
describe('MapperHelper', () => {
  describe('ToOne', () => {
    it('llama a toObject() y retorna el resultado', () => {
      const doc = new UserDocument(1, 'Alice');
      const result = MapperHelper.ToOne(doc);
      expect(result).toEqual({ id: 1, name: 'Alice' });
    });

    it('llama a toObject() exactamente una vez', () => {
      const doc = new UserDocument(1, 'Alice');
      const spy = jest.spyOn(doc, 'toObject');
      MapperHelper.ToOne(doc);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('el resultado es el valor retornado por toObject(), no el documento original', () => {
      const doc = new UserDocument(2, 'Bob');
      const result = MapperHelper.ToOne(doc);
      expect(result).not.toBeInstanceOf(UserDocument);
    });
  });

  describe('ToList', () => {
    it('mapea un array de documentos a sus plain objects', () => {
      const docs = [
        new UserDocument(1, 'Alice'),
        new UserDocument(2, 'Bob'),
        new UserDocument(3, 'Carol'),
      ];

      const result = MapperHelper.ToList(docs);

      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Carol' },
      ]);
    });

    it('llama a toObject() una vez por elemento', () => {
      const docs = [new UserDocument(1, 'Alice'), new UserDocument(2, 'Bob')];
      const spies = docs.map((d) => jest.spyOn(d, 'toObject'));

      MapperHelper.ToList(docs);

      spies.forEach((spy) => expect(spy).toHaveBeenCalledTimes(1));
    });

    it('array vacío → array vacío', () => {
      expect(MapperHelper.ToList([])).toEqual([]);
    });

    it('array de un elemento', () => {
      const docs = [new UserDocument(42, 'Solo')];
      expect(MapperHelper.ToList(docs)).toEqual([{ id: 42, name: 'Solo' }]);
    });

    it('preserva el orden del array original', () => {
      const docs = [
        new UserDocument(3, 'C'),
        new UserDocument(1, 'A'),
        new UserDocument(2, 'B'),
      ];
      const result = MapperHelper.ToList<UserDocument, UserPlain>(docs);
      expect(result.map((r: UserPlain) => r.id)).toEqual([3, 1, 2]);
    });

    it('los elementos del resultado no son instancias del documento original', () => {
      const docs = [new UserDocument(1, 'Alice')];
      const result = MapperHelper.ToList(docs);
      result.forEach((r) => expect(r).not.toBeInstanceOf(UserDocument));
    });
  });

  describe('toObject() con side effects o lógica propia', () => {
    it('respeta la transformación custom que haga toObject()', () => {
      class UpperCaseDoc {
        constructor(private value: string) {}
        toObject() {
          return { value: this.value.toUpperCase() };
        }
      }

      const result = MapperHelper.ToOne(new UpperCaseDoc('hello'));
      expect(result).toEqual({ value: 'HELLO' });
    });

    it('ToList funciona con cualquier shape que implemente toObject()', () => {
      class PointDoc {
        constructor(
          private x: number,
          private y: number,
        ) {}
        toObject() {
          return { x: this.x, y: this.y };
        }
      }

      const result = MapperHelper.ToList([
        new PointDoc(1, 2),
        new PointDoc(3, 4),
      ]);
      expect(result).toEqual([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
    });
  });
});
