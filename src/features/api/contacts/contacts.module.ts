import { Module } from '@nestjs/common';
import { ContactService } from './service/contact.service';
import { ContactController } from './controller/contact.controller';
import { Contact, ContactSchema } from './schema/contact.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactRepository } from './repository/contact.repository';
import { IContactRepository } from './repository/contact.interface.repository';
import { TransformDto } from '@/shared/utils';
import { CoreModule } from '@/core/core.module';

@Module({
  imports: [
    CoreModule,
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
  ],
  controllers: [ContactController],
  providers: [
    ContactService,
    ContactRepository,
    {
      provide: IContactRepository,
      useClass: ContactRepository,
    },
    TransformDto,
  ],
  exports: [ContactService, ContactRepository, IContactRepository],
})
export class ContactsModule {}
