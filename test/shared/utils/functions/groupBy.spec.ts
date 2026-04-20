import { groupBy } from '@/shared/utils/functions/groupBy';

interface Product {
  name: string;
  category: string;
}

describe('groupBy', () => {
  describe('happy path', () => {
    it('agrupa correctamente por una propiedad string', () => {
      const items: Product[] = [
        { name: 'Apple', category: 'fruit' },
        { name: 'Banana', category: 'fruit' },
        { name: 'Carrot', category: 'vegetable' },
      ];

      const result = groupBy(items, (i) => i.category);

      expect(result).toEqual({
        fruit: [
          { name: 'Apple', category: 'fruit' },
          { name: 'Banana', category: 'fruit' },
        ],
        vegetable: [{ name: 'Carrot', category: 'vegetable' }],
      });
    });

    it('preserva el orden de inserción dentro de cada grupo', () => {
      const items = [
        { id: 3, type: 'a' },
        { id: 1, type: 'a' },
        { id: 2, type: 'a' },
      ];

      const result = groupBy(items, (i) => i.type);

      expect(result['a'].map((i) => i.id)).toEqual([3, 1, 2]);
    });

    it('un solo elemento → un grupo con un item', () => {
      const items = [{ name: 'Solo', category: 'x' }];
      const result = groupBy(items, (i) => i.category);
      expect(result).toEqual({ x: [{ name: 'Solo', category: 'x' }] });
    });

    it('todos los elementos en el mismo grupo', () => {
      const items = [
        { v: 1, g: 'same' },
        { v: 2, g: 'same' },
        { v: 3, g: 'same' },
      ];
      const result = groupBy(items, (i) => i.g);
      expect(Object.keys(result)).toHaveLength(1);
      expect(result['same']).toHaveLength(3);
    });

    it('cada elemento en su propio grupo', () => {
      const items = [
        { id: 1, label: 'a' },
        { id: 2, label: 'b' },
        { id: 3, label: 'c' },
      ];
      const result = groupBy(items, (i) => i.label);
      expect(Object.keys(result)).toHaveLength(3);
      expect(result['a']).toEqual([{ id: 1, label: 'a' }]);
    });
  });

  describe('key function', () => {
    it('acepta una key function arbitraria (no solo propiedades directas)', () => {
      const items = [
        { score: 85 },
        { score: 42 },
        { score: 91 },
        { score: 55 },
      ];

      const result = groupBy(items, (i) => (i.score >= 60 ? 'pass' : 'fail'));

      expect(result['pass'].map((i) => i.score)).toEqual([85, 91]);
      expect(result['fail'].map((i) => i.score)).toEqual([42, 55]);
    });

    it('llama a la key function exactamente una vez por elemento', () => {
      const items = [{ v: 1 }, { v: 2 }, { v: 3 }];
      const keyFn = jest.fn((i: { v: number }) => String(i.v));

      groupBy(items, keyFn);

      expect(keyFn).toHaveBeenCalledTimes(3);
    });

    it('funciona con keys numéricas convertidas a string', () => {
      const items = [{ n: 1 }, { n: 2 }, { n: 1 }];
      const result = groupBy(items, (i) => String(i.n));
      expect(result['1']).toHaveLength(2);
      expect(result['2']).toHaveLength(1);
    });
  });

  describe('array vacío', () => {
    it('retorna un objeto vacío', () => {
      expect(groupBy([], () => 'x')).toEqual({});
    });

    it('no llama a la key function', () => {
      const keyFn = jest.fn();
      groupBy([], keyFn);
      expect(keyFn).not.toHaveBeenCalled();
    });
  });

  describe('referencias', () => {
    it('los objetos en el resultado son los mismos (por referencia) que los del input', () => {
      const a = { name: 'A', cat: 'x' };
      const b = { name: 'B', cat: 'x' };
      const result = groupBy([a, b], (i) => i.cat);
      expect(result['x'][0]).toBe(a);
      expect(result['x'][1]).toBe(b);
    });

    it('mutar un item del resultado muta el original (no hay copia profunda)', () => {
      const item = { name: 'Original', cat: 'g' };
      const result = groupBy([item], (i) => i.cat);
      result['g'][0].name = 'Mutated';
      expect(item.name).toBe('Mutated');
    });
  });
});
