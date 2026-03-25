import { PaginationService } from '@/core/services/pagination.service';
import { TransformDto } from '@/shared/utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriberService } from '@/features/api/subscribers/service/subscriber.service';
import { ISubscriberRepository } from '@/features/api/subscribers/repository/subscriber.interface.repository';
import { SubscriberDocument } from '@/features/api/subscribers/schema/subscriber.schema';
import { SubscriberResponseDto } from '@/features/api/subscribers/dto/response/subscriber.response.dto';
import { CreateSubcriberDto } from '@/features/api/subscribers/dto/create-subcriber.dto';
import { PaginationMeta } from '@/core/interfaces/pagination-meta.interface';
import { ObjectId } from 'bson';
import {
  SubscriberError,
  SubscriberOk,
} from '@/features/api/subscribers/messages/subscriber.messages';
import { UpdateSubscriberDto } from '@/features/api/subscribers/dto/update-subcriber.dto';

jest.mock('@/features/api/subscribers/repository/subscriber.repository');
jest.mock('@/shared/utils');

const mockSubscriberRepo = {
  findAllSubscribers: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findBySource: jest.fn(),
  findByEmailAndSource: jest.fn(),
  findByStatus: jest.fn(),
  createSubscriber: jest.fn(),
  updateSubscriber: jest.fn(),
  deleteSubscriber: jest.fn(),
  countSubscribers: jest.fn(),
  subscriptionAlredyExist: jest.fn(),
  findByEmailAndStatus: jest.fn(),
};

const mockPaginationService = {
  calculateOffset: jest.fn(),
  createMeta: jest.fn(),
};

const mockTransform = {
  transformDtoArray: jest.fn(),
  transformDtoObject: jest.fn(),
};

describe('SubscriberService', () => {
  let service: SubscriberService;
  let subscriberRepo: ISubscriberRepository;
  let transform: TransformDto<SubscriberDocument, SubscriberResponseDto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriberService,
        { provide: ISubscriberRepository, useValue: mockSubscriberRepo },
        { provide: PaginationService, useValue: mockPaginationService },
        { provide: TransformDto, useValue: mockTransform },
      ],
    }).compile();

    service = module.get<SubscriberService>(SubscriberService);
    subscriberRepo = module.get<ISubscriberRepository>(ISubscriberRepository);
    transform =
      module.get<TransformDto<SubscriberDocument, SubscriberResponseDto>>(
        TransformDto,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar todos los subscriptores paginados', async () => {
    const mockDocs: SubscriberDocument[] = [
      { name: 'Fabri', email: 'test@mail.com', source: 'Test' } as any,
    ];
    const mockDtos: CreateSubcriberDto[] = [
      { name: 'Fabri', email: 'test@mail.com', source: 'Test' } as any,
    ];
    const param = { page: 1, limit: 10 };

    mockPaginationService.calculateOffset.mockReturnValue(0);
    mockSubscriberRepo.findAllSubscribers.mockResolvedValue([mockDocs, 1]);
    mockTransform.transformDtoArray.mockReturnValue(mockDtos);
    mockPaginationService.createMeta.mockReturnValue({ totalItems: 1 } as any);

    const result: {
      subscribers: SubscriberResponseDto[];
      meta: PaginationMeta;
    } = await service.getAllSubscribers(param);

    expect(result.subscribers).toEqual(mockDtos);
    expect(result.meta.totalItems).toEqual(1);
    expect(mockSubscriberRepo.findAllSubscribers).toHaveBeenCalledWith(0, 10);
  });

  describe('findOneById', () => {
    it('deberia retornar un subscriptor por su id', async () => {
      const id: string = new ObjectId().toString();
      const mockSub = { _id: id } as SubscriberDocument;
      const mockDto = { id: id } as unknown as SubscriberResponseDto;

      mockSubscriberRepo.findById.mockResolvedValue(mockSub);
      mockTransform.transformDtoObject.mockReturnValue(mockDto);

      const response: SubscriberResponseDto =
        await service.getSubscriberById(id);

      expect(response).toEqual(mockDto);
    });
    it('deberia retornar un NotFound si se le pasa un id que no existe en la bd', async () => {
      const fakeid: string = new ObjectId().toString();
      mockSubscriberRepo.findById.mockResolvedValue(null);

      await expect(service.getSubscriberById(fakeid)).rejects.toThrow(
        new NotFoundException(`Subscriber with ID ${fakeid} not found`),
      );
    });
  });

  describe('createSubscriber', () => {
    it('deberia crear un subscriber', async (): Promise<void> => {
      const dto: CreateSubcriberDto = {
        name: 'Test',
        email: 'test@example.com',
        source: 'Test',
      };

      mockSubscriberRepo.createSubscriber.mockResolvedValue({ ...dto } as any);
      const result: string = await service.createSubscriber(dto);

      expect(result).toBe(SubscriberOk.SUBSCRIBER_CREATED);
      expect(mockSubscriberRepo.createSubscriber).toHaveBeenCalled();
    });
    it('deberia lanzar un error al no crear un subscriber', async (): Promise<void> => {
      const dto: CreateSubcriberDto = {
        name: 'Test',
        email: 'test@example.com',
        source: 'Test',
      };

      mockSubscriberRepo.createSubscriber.mockResolvedValue(null);

      await expect(service.createSubscriber(dto)).rejects.toThrow(
        new BadRequestException(SubscriberError.SUBSCRIBER_ERROR),
      );
    });
    it('deberia lanzar excepcion si el subscriber ya existe', async (): Promise<void> => {
      const dto: CreateSubcriberDto = {
        name: 'Test',
        email: 'test@example.com',
        source: 'Test',
      };

      mockSubscriberRepo.subscriptionAlredyExist.mockResolvedValue(true);

      await expect(service.createSubscriber(dto)).rejects.toThrow(
        new BadRequestException(SubscriberError.SUBSCRIBER_ALREADY_EXIST),
      );

      expect(mockSubscriberRepo.subscriptionAlredyExist).toHaveBeenCalledWith(
        dto.email,
      );
      expect(mockSubscriberRepo.createSubscriber).not.toHaveBeenCalled();
    });
  });
  describe('updateSubscriber', () => {
    const id: string = new ObjectId().toString();
    const dto: UpdateSubscriberDto = {
      name: 'Test Updated',
      email: 'updated@example.com',
    };

    it('deberia actualizar un subscriber exitosamente', async (): Promise<void> => {
      mockSubscriberRepo.subscriptionAlredyExist.mockResolvedValue(false);

      mockSubscriberRepo.findById.mockResolvedValue({
        _id: id,
      } as SubscriberDocument);
      mockSubscriberRepo.updateSubscriber.mockResolvedValue({
        id,
        ...dto,
      } as any);

      const result: string = await service.updateSubscriber(id, dto);

      expect(result).toBe(SubscriberOk.SUBSCRIBER_UPDATED);
      expect(mockSubscriberRepo.subscriptionAlredyExist).toHaveBeenCalledWith(
        dto.email,
        id,
      );
      expect(mockSubscriberRepo.findById).toHaveBeenCalledWith(id);
      expect(mockSubscriberRepo.updateSubscriber).toHaveBeenCalledWith(id, dto);
    });

    it('deberia lanzar excepcion si el email ya esta en uso', async (): Promise<void> => {
      mockSubscriberRepo.subscriptionAlredyExist.mockResolvedValue(true);

      await expect(service.updateSubscriber(id, dto)).rejects.toThrow(
        new BadRequestException(SubscriberError.SUBSCRIBER_ALREADY_EXIST),
      );

      expect(mockSubscriberRepo.findById).not.toHaveBeenCalled();
      expect(mockSubscriberRepo.updateSubscriber).not.toHaveBeenCalled();
    });

    it('deberia lanzar excepcion si el subscriber no existe', async (): Promise<void> => {
      mockSubscriberRepo.subscriptionAlredyExist.mockResolvedValue(false);
      mockSubscriberRepo.findById.mockResolvedValue(null);

      await expect(service.updateSubscriber(id, dto)).rejects.toThrow(
        new NotFoundException(`Subscriber with ID ${id} not found for update`),
      );

      expect(mockSubscriberRepo.updateSubscriber).not.toHaveBeenCalled();
    });

    it('deberia lanzar excepcion si el update falla', async (): Promise<void> => {
      mockSubscriberRepo.subscriptionAlredyExist.mockResolvedValue(false);
      mockSubscriberRepo.findById.mockResolvedValue({ id, ...dto } as any);
      mockSubscriberRepo.updateSubscriber.mockResolvedValue(null);

      await expect(service.updateSubscriber(id, dto)).rejects.toThrow(
        new BadRequestException(SubscriberError.SUBSCRIBER_ERROR),
      );
    });

    it('deberia ignorar campos undefined o null en el dto', async (): Promise<void> => {
      const dtoWithNulls: UpdateSubscriberDto = {
        name: 'Test Updated',
        email: undefined,
      };

      mockSubscriberRepo.subscriptionAlredyExist.mockResolvedValue(false);
      mockSubscriberRepo.findById.mockResolvedValue({ id } as any);
      mockSubscriberRepo.updateSubscriber.mockResolvedValue({
        id,
        name: 'Test Updated',
      } as any);

      const result: string = await service.updateSubscriber(id, dtoWithNulls);

      expect(result).toBe(SubscriberOk.SUBSCRIBER_UPDATED);

      expect(mockSubscriberRepo.updateSubscriber).toHaveBeenCalledWith(id, {
        name: 'Test Updated',
      });
    });
  });

  describe('unsubscribeSubscriber', (): void => {
    const id: string = new ObjectId().toString();
    const email = 'test@example.com';
    const mockSubscriber = {
      _id: { toString: (): string => id },
      email,
      status: true,
    };

    it('deberia desuscribir un subscriber exitosamente', async (): Promise<void> => {
      mockSubscriberRepo.findByEmail.mockResolvedValue(mockSubscriber as any);
      mockSubscriberRepo.updateSubscriber.mockResolvedValue({
        ...mockSubscriber,
        status: false,
      } as any);

      const result: string = await service.unsubscribeSubscriber(email);

      expect(result).toBe(SubscriberOk.SUBSCRIBER_UNSUBSCRIBED);
      expect(mockSubscriberRepo.findByEmail).toHaveBeenCalledWith(email);
      expect(mockSubscriberRepo.updateSubscriber).toHaveBeenCalledWith(id, {
        status: false,
      });
    });

    it('deberia lanzar excepcion si el subscriber no existe', async (): Promise<void> => {
      mockSubscriberRepo.findByEmail.mockResolvedValue(null);

      await expect(service.unsubscribeSubscriber(email)).rejects.toThrow(
        new NotFoundException(
          `Subscriber with email ${email} not found for unsubscribe`,
        ),
      );

      expect(mockSubscriberRepo.updateSubscriber).not.toHaveBeenCalled();
    });

    it('deberia lanzar excepcion si el subscriber ya esta desuscripto', async (): Promise<void> => {
      mockSubscriberRepo.findByEmail.mockResolvedValue({
        ...mockSubscriber,
        status: false,
      } as any);

      await expect(service.unsubscribeSubscriber(email)).rejects.toThrow(
        new BadRequestException(SubscriberError.SUBSCRIBER_ALREADY_UNSUB),
      );

      expect(mockSubscriberRepo.updateSubscriber).not.toHaveBeenCalled();
    });

    it('deberia lanzar excepcion si el update falla', async (): Promise<void> => {
      mockSubscriberRepo.findByEmail.mockResolvedValue(mockSubscriber as any);
      mockSubscriberRepo.updateSubscriber.mockResolvedValue(null);

      await expect(service.unsubscribeSubscriber(email)).rejects.toThrow(
        new BadRequestException(SubscriberError.SUBSCRIBER_ERROR),
      );
    });
  });

  describe('deleteSubscriber', (): void => {
    const id: string = new ObjectId().toString();
    const email = 'test@example.com';
    const mockSubscriber = {
      _id: { toString: () => id },
      email,
      status: true,
    };

    it('deberia eliminar un subscriber exitosamente', async (): Promise<void> => {
      mockSubscriberRepo.findByEmail.mockResolvedValue(mockSubscriber as any);
      mockSubscriberRepo.deleteSubscriber.mockResolvedValue(true);

      const result: string = await service.deleteSubscriber(email);

      expect(result).toBe(SubscriberOk.SUBSCRIBER_DELETED);
      expect(mockSubscriberRepo.findByEmail).toHaveBeenCalledWith(email);
      expect(mockSubscriberRepo.deleteSubscriber).toHaveBeenCalledWith(email);
    });

    it('deberia lanzar excepcion si el subscriber no existe', async (): Promise<void> => {
      mockSubscriberRepo.findByEmail.mockResolvedValue(null);

      await expect(service.deleteSubscriber(email)).rejects.toThrow(
        new NotFoundException(
          `Subscriber with email ${email} not found for delete`,
        ),
      );

      expect(mockSubscriberRepo.deleteSubscriber).not.toHaveBeenCalled();
    });

    it('deberia lanzar excepcion si el delete falla', async (): Promise<void> => {
      mockSubscriberRepo.findByEmail.mockResolvedValue(mockSubscriber as any);
      mockSubscriberRepo.deleteSubscriber.mockResolvedValue(false);

      await expect(service.deleteSubscriber(email)).rejects.toThrow(
        new BadRequestException(SubscriberError.SUBSCRIBER_ERROR),
      );
    });
  });
  describe('countSubscribers', (): void => {
    it('deberia retornar el conteo de subscribers', async (): Promise<void> => {
      mockSubscriberRepo.countSubscribers.mockResolvedValue(10);

      const result: number = await service.countSubscribers();

      expect(result).toBe(10);
      expect(mockSubscriberRepo.countSubscribers).toHaveBeenCalled();
    });

    it('deberia retornar 0 si no hay subscribers', async (): Promise<void> => {
      mockSubscriberRepo.countSubscribers.mockResolvedValue(0);

      const result: number = await service.countSubscribers();

      expect(result).toBe(0);
    });
  });
});
