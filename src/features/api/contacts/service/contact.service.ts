import { TransformDto } from '@/shared/utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IContactRepository } from '../repository/contact.interface.repository';
import { Contact, ContactDocument } from '../schema/contact.schema';
import { SendContactResponseDto } from '../dto/response/send-contact.response.dto';
import { ContactError, ContactOk } from '../messages/contact.messages';
import { SendContactDto } from '../dto/send-contact.dto';
import { configApp } from '@/config/app/config.app';
import { MailQeueService } from '@/core/mail/service/mail-qeue.service';
import { PaginationService } from '@/core/services/pagination.service';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { DefaultPageSize } from '@/shared/utils/constants/querying';
import { PaginationMeta } from '@/core/interfaces/pagination-meta.interface';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name, {
    timestamp: true,
  });
  constructor(
    private readonly contactRepo: IContactRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<
      ContactDocument,
      SendContactResponseDto
    >,
    private readonly mailQeueService: MailQeueService,
    private readonly paginationService: PaginationService,
  ) {}

  transformArray(data: ContactDocument[]) {
    return this.transform.transformDtoArray(data, SendContactResponseDto);
  }

  transformObject(data: ContactDocument) {
    return this.transform.transformDtoObject(data, SendContactResponseDto);
  }

  async getAllContacts(
    param: PaginationDto,
  ): Promise<{ contacts: SendContactResponseDto[]; meta: PaginationMeta }> {
    const { page, limit } = param;

    const take = limit ?? DefaultPageSize.CONTACTS;
    const skip = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.contactRepo.getAllContacts(skip, take);

    const contacts: SendContactResponseDto[] = this.transformArray(data);

    const meta = this.paginationService.createMeta(limit, page, count);

    const response = { contacts, meta };
    return response;
  }

  async findOneId(id: string): Promise<SendContactResponseDto> {
    const contact = await this.contactRepo.findOneContactById(id);

    if (!contact) {
      throw new NotFoundException(ContactError.CONTACT_NOT_FOUND);
    }

    return this.transformObject(contact);
  }

  async findOneEmail(email: string): Promise<SendContactResponseDto> {
    const contact = await this.contactRepo.findOneContactByEmail(email);

    if (!contact) {
      throw new NotFoundException(ContactError.CONTACT_NOT_FOUND);
    }

    return this.transformObject(contact);
  }

  async getAllContactsEmail(email: string): Promise<SendContactResponseDto[]> {
    const contacts: ContactDocument[] =
      await this.contactRepo.findAllContactsByEmail(email);
    return this.transformArray(contacts);
  }

  async findOneSubject(subject: string): Promise<SendContactResponseDto> {
    const contact = await this.contactRepo.findOneContactBySubject(subject);

    if (!contact) {
      throw new NotFoundException(ContactError.CONTACT_NOT_FOUND);
    }

    return this.transformObject(contact);
  }

  async getAllContactsSubject(
    subject: string,
  ): Promise<SendContactResponseDto[]> {
    const contacts: ContactDocument[] =
      await this.contactRepo.findAllContactsBySubject(subject);
    return this.transformArray(contacts);
  }

  async createContact(dto: SendContactDto): Promise<string> {
    const newContact = {};

    for (const key in dto) {
      if (dto[key] ?? false) newContact[key] = dto[key];
    }

    if (configApp().env !== 'test') {
      const sendContact = await this.sendMailOrder(dto);
      if (!sendContact) {
        throw new BadRequestException(ContactError.CONTACT_ERROR);
      }
    }

    const result: Contact = await this.contactRepo.createContact(
      newContact as Contact,
    );

    if (!result) {
      throw new BadRequestException(ContactError.CONTACT_ERROR);
    }

    return ContactOk.CONTACT_SEND;
  }

  private async sendMailOrder(dto: SendContactDto) {
    this.logger.log('Enviando correo de contacto en tu portfolio...');

    const message = {
      email: dto.email.toLocaleLowerCase(),
      subject:
        'Te han contactado desde tu portfolio. A continuación, se detallan los datos enviados por el visitante',
      exchange: configApp().exchange,
      urlApp: configApp().frontHost.toString(),
      mailInfo: configApp().mailInfo.toString(),
      emailFrom: `${configApp().emailFrom}`,
      appImg: `${configApp().appImg}`,
      nombre: dto.name,
      nameClient: dto.name,
      emailClient: dto.email,
      subjectClient: dto.subject,
      messageClient: dto.message,
    };

    const queue = 'send_contact';
    const result = await this.mailQeueService.sendEmailQueue({
      message,
      queue: queue,
      action: queue,
      key: configApp().exchange,
    });

    this.logger.log('Correo enviado correctamente');
    return result;
  }
}
