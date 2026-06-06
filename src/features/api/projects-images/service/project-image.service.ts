import { TransformDto } from '@/shared/utils';
import { ProjectImageResponseDto } from '../dto/response/project-image.response.dto';
import {
  ProjectImage,
  ProjectImageDocument,
} from '../schema/project-image.schema';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IProjectImageRepository } from '../repository/project-image.interface.repository';
import { ImagesError } from '../messages/project-images.messages';
import { UploadImagesProjectsDto } from '../dto/UploadImagesProjectDto';
import { dirname, extname, join } from 'path';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { configApp } from '@/config/app/config.app';
import { Types } from 'mongoose';
import { ObjectId } from 'bson';
import { generateSlug } from '@/shared/utils/functions/generateSlug';

@Injectable()
export class ProjectImageService {
  constructor(
    private readonly imgRepository: IProjectImageRepository,
    @Inject(TransformDto)
    private readonly transformDto: TransformDto<
      ProjectImageDocument,
      ProjectImageResponseDto
    >,
  ) {}

  transformArray(data: ProjectImageDocument[]): ProjectImageResponseDto[] {
    return this.transformDto.transformDtoArray(data, ProjectImageResponseDto);
  }

  transformObject(data: ProjectImageDocument): ProjectImageResponseDto {
    return this.transformDto.transformDtoObject(data, ProjectImageResponseDto);
  }

  async getAllProjectImages(): Promise<ProjectImageResponseDto[] | null> {
    const allImgs: ProjectImageDocument[] =
      await this.imgRepository.getAllProjectsImages();
    return this.transformArray(allImgs);
  }

  async getProjectImageById(
    id: string,
  ): Promise<ProjectImageResponseDto | null> {
    const img: ProjectImageDocument =
      await this.imgRepository.getProjectImgById(id);

    if (!img) {
      throw new NotFoundException(ImagesError.IMAGES_NOT_FOUND);
    }

    return this.transformObject(img);
  }

  async countAll(): Promise<number> {
    return this.imgRepository.countAll();
  }

  async getAllProjectImagesByProjectId(
    projectId: string,
  ): Promise<ProjectImageResponseDto[] | null> {
    const allImgs: ProjectImageDocument[] =
      await this.imgRepository.getProjectImgsByProjectId(projectId);
    return this.transformArray(allImgs);
  }

  async uploadProjectImage(
    dto: UploadImagesProjectsDto,
    file: Express.Multer.File,
  ): Promise<boolean> {
    const folder = join(process.cwd(), 'uploads', 'projects', dto.projectId);
    mkdirSync(folder, { recursive: true });

    const ext = extname(file.originalname);
    const uid =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const filename = `${generateSlug(dto.projectName)}-${uid}${ext}`;
    const filePath = join(folder, filename);

    writeFileSync(filePath, file.buffer);

    const record: ProjectImage = {
      imageUrl: `/file/projects/${dto.projectId}/${filename}`,
      imageFullUrl: `${configApp().frontHost}/file/projects/${dto.projectId}/${filename}`, //TODO: fronthost debiera ser el host del frontedn del portfolio...
      imagePath: filePath,
      displayOrder: dto.displayOrder ?? 0,
      altText: dto.altText ?? `Imagen proyecto ${dto.projectName}`,
      projectId: new Types.ObjectId(dto.projectId),
      createdAt: new Date(),
    };

    const result = await this.imgRepository.uploadImageToProject(record);

    if (!result) {
      throw new InternalServerErrorException(ImagesError.INTERNAL_SERVER_ERROR);
    }

    return true;
  }

  async remove(id: string): Promise<boolean> {
    const image: ProjectImageDocument =
      await this.imgRepository.getProjectImgById(id);

    if (!image) {
      throw new NotFoundException(`Imagen con id ${id} no encontrada`);
    }

    if (existsSync(image.imagePath)) {
      unlinkSync(image.imagePath);
      this.removeDirectoryIfEmpty(image.imagePath);
    }

    const result: boolean = await this.imgRepository.deleteImageProject(id);

    if (!result) {
      throw new InternalServerErrorException(ImagesError.IMAGES_ERROR);
    }

    return true;
  }

  async removeAllByProject(projectId: string): Promise<boolean> {
    const images: ProjectImageDocument[] =
      await this.imgRepository.getProjectImgsByProjectId(projectId);

    for (const image of images) {
      if (existsSync(image.imagePath)) {
        unlinkSync(image.imagePath);
      }
    }

    if (images.length > 0) {
      this.removeDirectoryIfEmpty(images[0].imagePath);
    }

    const result: boolean =
      await this.imgRepository.deleteImageProjectMany(projectId);

    if (!result) {
      throw new InternalServerErrorException(ImagesError.IMAGES_ERROR);
    }
    return true;
  }

  private removeDirectoryIfEmpty(filePath: string): void {
    const dir: string = dirname(filePath); // importás dirname de 'path'

    if (existsSync(dir)) {
      const remaining: string[] = readdirSync(dir);
      if (remaining.length === 0) {
        rmdirSync(dir);
      }
    }
  }
}
