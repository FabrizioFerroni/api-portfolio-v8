import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICVRepository } from '../repository/cv.interface.repository';
import { TransformDto } from '@/shared/utils';
import { CVDocument } from '../schema/cv.schema';
import { CVResponseAdminDto } from '../dtos/response/cv.response.dto';
import { CvStorage } from '../storage/cv.storage';
import { CVCUpDto } from '../dtos/create.dto';
import { CVError, CVMessages } from '../messages/general.messages';
import { extname } from 'path';

@Injectable()
export class CVService {
  constructor(
    private readonly cvRepository: ICVRepository,
    private readonly cvStorage: CvStorage,
    @Inject(TransformDto)
    private readonly transformDto: TransformDto<CVDocument, CVResponseAdminDto>,
  ) {}

  transformArray(data: CVDocument[]): CVResponseAdminDto[] {
    return this.transformDto.transformDtoArrayNew(data, CVResponseAdminDto);
  }

  transformObject(data: CVDocument): CVResponseAdminDto {
    return this.transformDto.transformDtoObjectNew(data, CVResponseAdminDto);
  }

  async uploadNewCv(file: Express.Multer.File, dto: CVCUpDto): Promise<string> {
    const previous = await this.cvRepository.findActive();
    const storedFileName = await this.cvStorage.saveFileToDisk(file, dto.name);

    try {
      await this.cvRepository.create({
        originalName: file.originalname,
        downloadName: `${dto.name}${extname(file.originalname)}`,
        storedFileName,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        isActive: true,
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (previous) {
        await this.cvRepository.deactivate(previous._id);
        await this.cvStorage.deletePhysicalFile(previous.storedFileName);
      }

      return previous?._id !== null
        ? CVMessages.CV_UPDATED
        : CVMessages.CV_CREATED;
    } catch (err) {
      await this.cvStorage.deletePhysicalFile(storedFileName);
      throw err;
    }
  }

  async getCurrentCv(): Promise<CVResponseAdminDto> {
    const cv = await this.cvRepository.findActive();

    return this.transformObject(cv);
  }

  async getOldsCVS(): Promise<CVResponseAdminDto[]> {
    const oldsCV = await this.cvRepository.findOldCVS();
    return this.transformArray(oldsCV);
  }

  async resolveDownload(): Promise<{
    filePath: string;
    originalName: string;
    downloadName: string;
  }> {
    const cv = await this.cvRepository.incrementDownloadAndGet();
    if (!cv) throw new NotFoundException(CVError.CV_NOT_FOUND);

    return {
      filePath: this.cvStorage.getFilePath(cv.storedFileName),
      originalName: cv.originalName,
      downloadName: cv.downloadName,
    };
  }
}
