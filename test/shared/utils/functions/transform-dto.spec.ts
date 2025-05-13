import { TransformDto } from '@/shared/utils/functions/transform-dto';

class Source {
  name!: string;
  age!: number;
}

class Target {
  name!: string;
  age!: number;
  extra?: string;
}

describe('TransformDto', () => {
  const transformer = new TransformDto<Source, Target>();

  it('should transform a single object into an instance of target class', () => {
    const source: Source = { name: 'Fabrii', age: 29 };

    const result = transformer.transformDtoObject(source, Target);

    expect(result).toBeInstanceOf(Target);
    expect(result.name).toBe('Fabrii');
    expect(result.age).toBe(29);
  });

  it('should transform an array of objects into instances of target class', () => {
    const sources: Source[] = [
      { name: 'Fabrii', age: 29 },
      { name: 'Sofía', age: 25 },
    ];

    const result = transformer.transformDtoArray(sources, Target);

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(Target);
    expect(result[0].name).toBe('Fabrii');
    expect(result[1].name).toBe('Sofía');
  });
});
