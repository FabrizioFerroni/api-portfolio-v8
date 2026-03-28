import { MailQeueService } from '@/core/mail/service/mail-qeue.service';
import { PaginationService } from '@/core/services/pagination.service';
import { SendContactResponseDto } from '@/features/api/contacts/dto/response/send-contact.response.dto';
import { SendContactDto } from '@/features/api/contacts/dto/send-contact.dto';
import {
  ContactError,
  ContactOk,
} from '@/features/api/contacts/messages/contact.messages';
import { IContactRepository } from '@/features/api/contacts/repository/contact.interface.repository';
import {
  Contact,
  ContactDocument,
} from '@/features/api/contacts/schema/contact.schema';
import { ContactService } from '@/features/api/contacts/service/contact.service';
import { TransformDto } from '@/shared/utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@/features/api/contacts/repository/contact.repository');
jest.mock('@/shared/utils');

const mockContactRepo = {
  getAllContacts: jest.fn(),
  findOneContactById: jest.fn(),
  findOneContactByEmail: jest.fn(),
  findAllContactsByEmail: jest.fn(),
  findOneContactBySubject: jest.fn(),
  findAllContactsBySubject: jest.fn(),
  createContact: jest.fn(),
};

const mockMailQueueService = {
  sendEmailQueue: jest.fn(),
};

const mockPaginationService = {
  calculateOffset: jest.fn(),
  createMeta: jest.fn(),
};

const mockTransform = {
  transformDtoArray: jest.fn(),
  transformDtoObject: jest.fn(),
};

describe('ContactService', () => {
  let service: ContactService;
  let contactRepo: IContactRepository;
  let transform: TransformDto<ContactDocument, SendContactResponseDto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: IContactRepository, useValue: mockContactRepo },
        { provide: MailQeueService, useValue: mockMailQueueService },
        { provide: PaginationService, useValue: mockPaginationService },
        { provide: TransformDto, useValue: mockTransform },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    contactRepo = module.get<IContactRepository>(IContactRepository);
    transform =
      module.get<TransformDto<ContactDocument, SendContactResponseDto>>(
        TransformDto,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar contactos paginados', async () => {
    const mockDocs: ContactDocument[] = [
      { name: 'Fabri', email: 'test@mail.com' } as any,
    ];
    const mockDtos: SendContactResponseDto[] = [
      { name: 'Fabri', email: 'test@mail.com' } as any,
    ];
    const param = { page: 1, limit: 10 };

    mockPaginationService.calculateOffset.mockReturnValue(0);
    mockContactRepo.getAllContacts.mockResolvedValue([mockDocs, 1]);
    mockTransform.transformDtoArray.mockReturnValue(mockDtos);
    mockPaginationService.createMeta.mockReturnValue({ totalItems: 1 } as any);

    const result = await service.getAllContacts(param);

    expect(result.contacts).toEqual(mockDtos);
    expect(result.meta.totalItems).toEqual(1);
    expect(mockContactRepo.getAllContacts).toHaveBeenCalledWith(0, 10);
  });

  describe('findOneId', () => {
    it('debería retornar un contacto por ID', async () => {
      const mockContact = { _id: 'abc123' } as ContactDocument;
      const mockDto = { id: 'abc123' } as unknown as SendContactResponseDto;

      mockContactRepo.findOneContactById.mockResolvedValue(mockContact);
      mockTransform.transformDtoObject.mockReturnValue(mockDto);

      const result = await service.findOneId('abc123');

      expect(result).toEqual(mockDto);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockContactRepo.findOneContactById.mockResolvedValue(null);

      await expect(service.findOneId('abc123')).rejects.toThrow(
        new NotFoundException(ContactError.CONTACT_NOT_FOUND),
      );
    });
  });

  describe('createContact', () => {
    it('debería crear un nuevo contacto y enviar correo', async () => {
      const dto: SendContactDto = {
        name: 'Fabri',
        email: 'fabri@mail.com',
        subject: 'Hola',
        message: 'Mensaje de prueba',
      };

      mockMailQueueService.sendEmailQueue.mockResolvedValue(true);
      mockContactRepo.createContact.mockResolvedValue({ ...dto } as any);

      const result = await service.createContact(dto);

      expect(result).toBe(ContactOk.CONTACT_SEND);
      expect(mockContactRepo.createContact).toHaveBeenCalled();
      expect(mockMailQueueService.sendEmailQueue).toHaveBeenCalled();
    });

    it('debería lanzar error si falla envío de correo', async () => {
      const dto: SendContactDto = {
        name: 'Fabri',
        email: 'fabri@mail.com',
        subject: 'Hola',
        message: 'Mensaje de prueba',
      };

      mockMailQueueService.sendEmailQueue.mockResolvedValue(false);

      await expect(service.createContact(dto)).rejects.toThrow(
        new BadRequestException(ContactError.CONTACT_ERROR),
      );
    });

    it('debería lanzar error si no se guarda contacto', async () => {
      const dto: SendContactDto = {
        name: 'Fabri',
        email: 'fabri@mail.com',
        subject: 'Hola',
        message: 'Mensaje de prueba',
      };

      mockMailQueueService.sendEmailQueue.mockResolvedValue(true);
      mockContactRepo.createContact.mockResolvedValue(null);

      await expect(service.createContact(dto)).rejects.toThrow(
        new BadRequestException(ContactError.CONTACT_ERROR),
      );
    });
  });

  describe('getAllContactsEmail', () => {
    it('debería devolver una lista de contactos', async () => {
      const docs = [{ email: 'fabri@mail.com' }] as ContactDocument[];
      const dtos = [{ email: 'fabri@mail.com' }] as SendContactResponseDto[];

      mockContactRepo.findAllContactsByEmail.mockResolvedValue(docs);
      mockTransform.transformDtoArray.mockReturnValue(dtos);

      const result = await service.getAllContactsEmail('fabri@mail.com');
      expect(result).toEqual(dtos);
    });
  });
});
