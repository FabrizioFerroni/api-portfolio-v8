export class MapperHelper {
  static ToList<T extends { toObject(): R }, R>(data: T[]): R[] {
    return data.map((d: T) => d.toObject());
  }

  static ToOne<T extends { toObject(): R }, R>(data: T): R {
    return data.toObject();
  }
}
