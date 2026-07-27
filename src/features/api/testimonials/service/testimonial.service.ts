import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ITestimonialRepository } from '../repository/testimonial.interface.repository';
import { TransformDto } from '@/shared/utils';
import { Testimonial, TestimonialDocument } from '../schema/testimonial.schema';
import { TestimonialResponseDto } from '../dto/response/testimonial-response.dto';
import { PaginationService } from '@/core/services/pagination.service';
import { DefaultPageSize } from '@/shared/utils/constants/querying';
import { PaginationMeta } from '@/core/interfaces/pagination-meta.interface';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { ProjectService } from '../../projects/service/project.service';
import {
  TestimonialsError,
  TestimonialsOk,
} from '../messages/testimonial.message';
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { dirname, extname, join } from 'path';
import { generateSlug } from '@/shared/utils/functions/generateSlug';
import { configApp } from '@/config/app/config.app';
import {
  TestimonialPlain,
  TestimonialWithProject,
} from '../types/testimonial-with-project.type';
import { ProjectTestimonialSummaryDto } from '../dto/response/project-testimonial.dto';
import { ProjectResponseDto } from '../../projects/dto/response/project.response.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { TestimonialCount } from '../interfaces/testimonial-count.interface';

@Injectable()
export class TestimonialService {
  constructor(
    private readonly tesRepository: ITestimonialRepository,
    private readonly projectService: ProjectService,
    @Inject(TransformDto)
    private readonly transformDto: TransformDto<
      TestimonialDocument,
      TestimonialResponseDto
    >,
    @Inject(TransformDto)
    private readonly transformwpDto: TransformDto<
      TestimonialWithProject,
      TestimonialResponseDto
    >,
    private readonly paginationService: PaginationService,
  ) {}

  transformArray(data: TestimonialDocument[]): TestimonialResponseDto[] {
    return this.transformDto.transformDtoArray(data, TestimonialResponseDto);
  }

  transformObject(data: TestimonialDocument): TestimonialResponseDto {
    return this.transformDto.transformDtoObject(data, TestimonialResponseDto);
  }

  transformObjectWithProject(
    data: TestimonialWithProject,
  ): TestimonialResponseDto {
    return this.transformwpDto.transformDtoObject(data, TestimonialResponseDto);
  }

  async getAllTestimonialsHome(): Promise<TestimonialResponseDto[]> {
    const data = await this.tesRepository.getAllTestimonialsHome();

    const projectIds = [...new Set(data.map((t) => t.projectId.toString()))];
    const projects = await this.projectService.getProjectByIds(projectIds);
    const projectMap = new Map(projects.map((p) => [p._id.toString(), p]));

    const testimonials: TestimonialResponseDto[] = data.map(
      (t: TestimonialPlain) => {
        const project: ProjectResponseDto = projectMap.get(
          t.projectId.toString(),
        );
        const projectResp: ProjectTestimonialSummaryDto = {
          id: project._id.toString(),
          title: project.title,
          summary: project.summary,
          slug: project.slug,
        };

        const testimonialWithProject: TestimonialWithProject = {
          ...t,
          project: projectResp,
        };

        return this.transformObjectWithProject(testimonialWithProject);
      },
    );

    return testimonials;
  }

  async getAllTestimonialsAdmin(
    param: PaginationDto,
  ): Promise<{ testimonials: TestimonialResponseDto[]; meta: PaginationMeta }> {
    const { page, limit, search } = param;

    const take = limit ?? DefaultPageSize.TESTIMONIALS;
    const skip = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.tesRepository.getAllTestimonials(
      take,
      skip,
      search,
    );

    const projectIds = [...new Set(data.map((t) => t.projectId.toString()))];
    const projects = await this.projectService.getProjectByIds(projectIds);
    const projectMap = new Map(projects.map((p) => [p._id.toString(), p]));

    const testimonials: TestimonialResponseDto[] = data.map((t) => {
      const project: ProjectResponseDto = projectMap.get(
        t.projectId.toString(),
      );
      const projectResp: ProjectTestimonialSummaryDto = {
        id: project._id.toString(),
        title: project.title,
        summary: project.summary,
        slug: project.slug,
      };

      const testimonialWithProject: TestimonialWithProject = {
        ...t,
        project: projectResp,
      };

      return this.transformObjectWithProject(testimonialWithProject);
    });

    const meta = this.paginationService.createMeta(limit, page, count);

    const response = { testimonials, meta };

    return response;
  }

  async countAllTestimonials(): Promise<TestimonialCount> {
    const countTest: TestimonialCount =
      await this.tesRepository.getTestimonialsStats();

    return countTest;
  }

  async getTestimonialById(id: string): Promise<TestimonialResponseDto> {
    const testimonial = await this.tesRepository.getTestimonialById(id);

    if (!testimonial) {
      throw new NotFoundException(TestimonialsError.TESTIMONIALS_NOT_FOUND);
    }

    const project = await this.projectService.getProjectById(
      testimonial.projectId.toString(),
    );

    const projectResp: ProjectTestimonialSummaryDto = {
      id: project._id.toString(),
      title: project.title,
      summary: project.summary,
      slug: project.slug,
    };

    const testimonialWithProject: TestimonialWithProject = {
      ...testimonial,
      project: projectResp,
    };

    return this.transformObjectWithProject(testimonialWithProject);
  }

  async createTestimonial(
    dto: CreateTestimonialDto,
    file: Express.Multer.File,
  ): Promise<string> {
    const { empresa, fullname } = dto;

    const testimonialAlreadyExist =
      await this.tesRepository.testimonialAlredyExist(empresa, fullname);

    if (testimonialAlreadyExist) {
      throw new BadRequestException(TestimonialsError.TESTIMONIALS_ERROR);
    }

    let visible = false;

    if (dto.visible === 'true') {
      visible = true;
    }

    const newTestimonial: Partial<Testimonial> = {};

    for (const test in dto) {
      if (dto[test] ?? false) newTestimonial[test] = dto[test];
    }

    newTestimonial.visible = visible;

    const result: TestimonialDocument =
      await this.tesRepository.createTestimonial(newTestimonial as Testimonial);

    if (!result) {
      throw new InternalServerErrorException(
        TestimonialsError.INTERNAL_SERVER_ERROR,
      );
    }

    await this.uploadFile(result, file);

    return TestimonialsOk.TESTIMONIALS_CREATED;
  }

  async updateTestimonial(
    id: string,
    dto: UpdateTestimonialDto,
    file?: Express.Multer.File,
  ): Promise<string> {
    const { empresa, fullname } = dto;
    const testimonial: TestimonialPlain =
      await this.tesRepository.getTestimonialById(id);

    if (!testimonial) {
      throw new NotFoundException(TestimonialsError.TESTIMONIALS_NOT_FOUND);
    }

    const testimonialAlreadyExist =
      await this.tesRepository.testimonialAlredyExist(
        empresa,
        fullname,
        testimonial._id,
      );

    if (testimonialAlreadyExist) {
      throw new BadRequestException(TestimonialsError.TESTIMONIALS_ERROR);
    }

    if (file) {
      if (existsSync(testimonial.imagePath)) {
        unlinkSync(testimonial.imagePath);
        this.removeDirectoryIfEmpty(testimonial.imagePath);
      }

      await this.uploadFile(
        testimonial as unknown as TestimonialDocument,
        file,
      );
    }

    const testimonialToEdit: Partial<Testimonial> = {};

    for (const test in dto) {
      if (dto[test] ?? false) testimonialToEdit[test] = dto[test];
    }

    testimonialToEdit.updatedAt = new Date();

    const result: boolean = await this.tesRepository.updateTestimonial(
      id,
      testimonialToEdit as Testimonial,
    );

    if (!result) {
      throw new InternalServerErrorException(
        TestimonialsError.INTERNAL_SERVER_ERROR,
      );
    }

    return TestimonialsOk.TESTIMONIALS_UPDATED;
  }

  async deleteTestimonial(id: string): Promise<string> {
    const testimonial: TestimonialPlain =
      await this.tesRepository.getTestimonialById(id);

    if (!testimonial) {
      throw new NotFoundException(TestimonialsError.TESTIMONIALS_NOT_FOUND);
    }

    if (existsSync(testimonial.imagePath)) {
      unlinkSync(testimonial.imagePath);
      this.removeDirectoryIfEmpty(testimonial.imagePath);
    }

    const result: boolean = await this.tesRepository.deleteTestimonial(id);

    if (!result) {
      throw new InternalServerErrorException(
        TestimonialsError.TESTIMONIALS_ERROR,
      );
    }

    return TestimonialsOk.TESTIMONIALS_REMOVED;
  }

  private async uploadFile(
    data: TestimonialDocument,
    file: Express.Multer.File,
  ) {
    const id = data._id;
    const folder = join(
      process.cwd(),
      'uploads',
      'testimonials',
      id.toString(),
    );
    mkdirSync(folder, { recursive: true });

    const ext = extname(file.originalname);
    const uid =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const filename = `${generateSlug(data.position)}-${generateSlug(data.empresa)}-${generateSlug(data.fullname)}-${uid}${ext}`;
    const filePath = join(folder, filename);

    writeFileSync(filePath, file.buffer);

    data.imageUrl = `/file/testimonials/${id.toString()}/${filename}`;
    data.imageFullUrl = `${configApp().frontHost}/file/testimonials/${id.toString()}/${filename}`;
    data.imagePath = filePath;
    data.updatedAt = new Date();

    const update = await this.tesRepository.updateTestimonial(
      id.toString(),
      data,
    );

    if (!update) {
      throw new InternalServerErrorException(
        TestimonialsError.INTERNAL_SERVER_ERROR,
      );
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
}
