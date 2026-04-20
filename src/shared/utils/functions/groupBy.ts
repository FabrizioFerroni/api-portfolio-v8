export function groupBy<T>(
  arr: T[],
  key: (item: T) => string,
): Record<string, T[]> {
  return arr.reduce(
    (acc: Record<string, T[]>, item: T) => {
      const k: string = key(item);
      (acc[k] ??= []).push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}
