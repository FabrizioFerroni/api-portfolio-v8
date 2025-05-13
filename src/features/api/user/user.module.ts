import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { IUserRepository } from './repository/user.interface.repository';
import { UserRepository } from './repository/user.repository';
import { TransformDto } from '@/shared/utils';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
