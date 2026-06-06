import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { IUserRepository } from './repository/user.interface.repository';
import { UserRepository } from './repository/user.repository';
import { TransformDto } from '@/shared/utils';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    TransformDto,
  ],
  exports: [UserService, UserRepository, IUserRepository],
})
export class UserModule {}
