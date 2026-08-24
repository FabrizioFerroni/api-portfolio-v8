import { Injectable } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';

interface InstanceType<Z> {
  new (): Z;
}
@Injectable()
export class TransformDto<T, Z> {
  transformDtoArray(T: T[], ZClass: InstanceType<Z>): Z[] {
    return T.map((type) => {
      const DTO = new ZClass();
      Object.assign(DTO, type);
      return DTO;
    });
  }

  transformDtoObject(T: T, ZClass: InstanceType<Z>): Z {
    const DTO = new ZClass();
    Object.assign(DTO, T);
    return DTO;
  }

  transformDtoArrayNew<T, Z>(data: T[], ZClass: ClassConstructor<Z>): Z[] {
    return plainToInstance(ZClass, data, { excludeExtraneousValues: true });
  }

  transformDtoObjectNew<T, Z>(data: T, ZClass: ClassConstructor<Z>): Z {
    return plainToInstance(ZClass, data, { excludeExtraneousValues: true });
  }
}
