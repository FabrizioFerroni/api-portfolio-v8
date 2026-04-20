import { TransformDto } from '@/shared/utils';
import { Project, ProjectDocument } from '../schema/project.schema';
import { ProjectResponseDto } from '../dto/response/project.response.dto';
import { IProjectRepository } from '../repository/project.interface.repository';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProjectWithRelations } from '../interfaces/project-with-relations.interface';
import { ProjectError, ProjectOk } from '../messages/project.messages';
import { CreateNewProjectDto } from '../dto/create-project.dto';
import { dirname, extname, join } from 'path';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { generateSlug } from '@/shared/utils/functions/generateSlug';
import { Types } from 'mongoose';
import { configApp } from '@/config/app/config.app';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { parse } from 'date-fns';
import { InsertOrUpdateProjectFeatDto } from '../../projects-features/dto/insert-update.dto';
import { ProjectFeatureService } from '../../projects-features/service/project-feature.service';
import { ProjectTechnologyService } from '../../projects-technologies/service/project-technology.service';
import { InsertOrUpdateProjectTecDto } from '../../projects-technologies/dto/insert-update.dto';
import { DeleteProjectTechFeat } from '../dto/delete-project-feat-tech.dto';

@Injectable()
export class ProjectService {
  private readonly logger: Logger = new Logger(ProjectService.name, {
    timestamp: true,
  });

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly featuresService: ProjectFeatureService,
    private readonly technologyService: ProjectTechnologyService,
    @Inject(TransformDto)
    private readonly transformDto: TransformDto<
      ProjectWithRelations,
      ProjectResponseDto
    >,
  ) {}

  transformArray(data: ProjectWithRelations[]): ProjectResponseDto[] {
    if (!Array.isArray(data)) return [];
    return this.transformDto.transformDtoArray(data, ProjectResponseDto);
  }

  transformObject(data: ProjectWithRelations): ProjectResponseDto {
    return this.transformDto.transformDtoObject(data, ProjectResponseDto);
  }

  async getAllProyects(): Promise<ProjectResponseDto[]> {
    const allProyects: ProjectWithRelations[] =
      await this.projectRepository.getAllProjects();

    return this.transformArray(allProyects);
  }

  async getProjectById(id: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.getProjectById(id);

    if (!project) {
      throw new NotFoundException(ProjectError.PROJECT_NOT_FOUND);
    }

    return this.transformObject(project);
  }

  async getProjectBySlug(slug: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.getProjectBySlug(slug);

    if (!project) {
      throw new NotFoundException(ProjectError.PROJECT_NOT_FOUND);
    }

    return this.transformObject(project);
  }

  async createNewProject(
    dto: CreateNewProjectDto,
    file: Express.Multer.File,
  ): Promise<string> {
    const slug: string = generateSlug(dto.title);

    const projectAlreadyExistSlug: boolean =
      await this.projectRepository.projectAlredyExistSlug(slug);

    if (projectAlreadyExistSlug) {
      throw new BadRequestException(ProjectError.PROJECT_ERROR_SLUG);
    }

    const projectAlreadyExist: boolean =
      await this.projectRepository.projectAlredyExist(dto.title);

    if (projectAlreadyExist) {
      throw new BadRequestException(ProjectError.PROJECT_ERROR);
    }

    const newProject: Partial<Project> = {};

    for (const proj in dto) {
      if (dto[proj] ?? false) newProject[proj] = dto[proj];
    }

    newProject.publishedDate = parse(
      dto.publishedDate,
      'dd/MM/yyyy',
      new Date(),
    );

    newProject.isFeatured = Boolean(dto.isFeatured);

    newProject.slug = slug;

    const result: ProjectDocument = await this.projectRepository.createProyect(
      newProject as Project,
    );

    if (!result) {
      throw new InternalServerErrorException(
        ProjectError.INTERNAL_SERVER_ERROR,
      );
    }

    await this.uploadFile(result, file);

    await this.createProjectFeat(
      dto.projectFeatures,
      result._id as Types.ObjectId,
    );

    await this.createProjectTech(
      dto.projectTechnologies,
      result._id as Types.ObjectId,
    );

    return ProjectOk.PROJECT_CREATED;
  }

  async updateProject(
    id: string,
    dto: UpdateProjectDto,
    file?: Express.Multer.File,
  ) {
    const project: ProjectWithRelations =
      await this.projectRepository.getProjectById(id);

    if (!project) {
      throw new NotFoundException(ProjectError.PROJECT_NOT_FOUND);
    }

    const projectAlreadyExist: boolean =
      await this.projectRepository.projectAlredyExist(dto.title, id);

    if (projectAlreadyExist) {
      throw new BadRequestException(ProjectError.PROJECT_ERROR);
    }

    if (file) {
      if (existsSync(project.imagePath)) {
        unlinkSync(project.imagePath);
        this.removeDirectoryIfEmpty(project.imagePath);
      }

      await this.uploadFile(project as unknown as ProjectDocument, file);
    }

    const projToEdit: Partial<Project> = {};

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        projToEdit[key] = dto[key];
      }
    }

    projToEdit.isFeatured = Boolean(dto.isFeatured);
    projToEdit.publishedDate = parse(
      dto.publishedDate,
      'dd/MM/yyyy',
      new Date(),
    );
    projToEdit.updatedAt = new Date();

    await this.removeOldDataFeatTech(dto.deleteDataFT);

    await this.createProjectFeat(dto.projectFeatures, id);

    await this.createProjectTech(dto.projectTechnologies, id);

    const result: boolean = await this.projectRepository.updateProyect(
      id,
      projToEdit as Project,
    );

    if (!result) {
      throw new InternalServerErrorException(
        ProjectError.INTERNAL_SERVER_ERROR,
      );
    }

    return ProjectOk.PROJECT_UPDATED;
  }

  async removeProj(id: string): Promise<boolean> {
    const project: ProjectWithRelations =
      await this.projectRepository.getProjectById(id);

    if (!project) {
      throw new NotFoundException(ProjectError.PROJECT_NOT_FOUND);
    }

    if (existsSync(project.imagePath)) {
      unlinkSync(project.imagePath);
      this.removeDirectoryIfEmpty(project.imagePath);
    }

    const result: boolean = await this.projectRepository.deleteProject(id);

    if (!result) {
      throw new InternalServerErrorException(ProjectError.PROJECT_ERROR);
    }

    return true;
  }

  private removeDirectoryIfEmpty(filePath: string): void {
    const dir: string = dirname(filePath);

    if (existsSync(dir)) {
      const remaining: string[] = readdirSync(dir);
      if (remaining.length === 0) {
        rmdirSync(dir);
      }
    }
  }

  private async uploadFile(data: ProjectDocument, file: Express.Multer.File) {
    const id = data._id;
    const folder = join(process.cwd(), 'uploads', 'projects', id.toString());
    mkdirSync(folder, { recursive: true });

    const ext = extname(file.originalname);
    const uid =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const filename = `${generateSlug(data.title)}-${uid}${ext}`;
    const filePath = join(folder, filename);

    writeFileSync(filePath, file.buffer);

    data.imageUrl = `/file/projects/${id.toString()}/${filename}`;
    data.imageFullUrl = `${configApp().apiHost}/file/projects/${id.toString()}/${filename}`;
    data.imagePath = filePath;
    data.updatedAt = new Date();

    const update = await this.projectRepository.updateProyect(
      id.toString(),
      data,
    );

    if (!update) {
      throw new InternalServerErrorException(
        ProjectError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  private async createProjectFeat(
    data: InsertOrUpdateProjectFeatDto[],
    projectId: Types.ObjectId | string,
  ) {
    if (data === undefined || data === null || data.length === 0) return;
    const id = new Types.ObjectId(projectId);
    const results = await Promise.allSettled(
      data.map((e) =>
        this.featuresService.createNewFeat({
          description: e.description,
          displayOrder: e.displayOrder,
          projectId: id,
        }),
      ),
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      this.logger.warn(`${failed.length} features fallaron al crear`);
    }
  }

  private async createProjectTech(
    data: InsertOrUpdateProjectTecDto[],
    projectId: Types.ObjectId | string,
  ) {
    if (data === undefined || data === null || data.length === 0) return;

    const id = new Types.ObjectId(projectId);

    const results = await Promise.allSettled(
      data.map((e) =>
        this.technologyService.createNewTech({
          name: e.name,
          category: e.category,
          projectId: id,
        }),
      ),
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      this.logger.warn(`${failed.length} technology fallaron al crear`);
    }
  }

  private async removeOldDataFeatTech(data: DeleteProjectTechFeat[]) {
    if (data === undefined || data === null || data.length === 0) return;

    await Promise.allSettled(
      data.map((d) => {
        switch (d.module) {
          case 1:
            return this.featuresService.deleteFeat(d.id);
          case 2:
            return this.technologyService.deleteTechnology(d.id);
          default:
            return Promise.resolve();
        }
      }),
    );
  }
}
