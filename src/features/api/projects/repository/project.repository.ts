import { DeleteResult, FilterQuery, Model } from 'mongoose';
import { Project, ProjectDocument } from '../schema/project.schema';
import { IProjectRepository } from './project.interface.repository';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IProjectImageRepository } from '../../projects-images/repository/project-image.interface.repository';
import { IProjectTechnologyRepository } from '../../projects-technologies/repository/project-technology.interface.repository';
import { IProjectFeatureRepository } from '../../projects-features/repository/project-feature.interface.repository';
import { groupBy } from '@/shared/utils/functions/groupBy';
import { Types } from 'mongoose';
import { ProjectWithRelations } from '../interfaces/project-with-relations.interface';
import { ProjectError } from '../messages/project.messages';
import { QueryOptions } from 'mongoose';
import {
  getCurrentMonthRange,
  getPreviousMonthRange,
} from '@/shared/utils/functions/date.utils';

@Injectable()
export class ProjectRepository
  extends MongoDBRepository<ProjectDocument>
  implements IProjectRepository
{
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly projectImageRepository: IProjectImageRepository,
    private readonly projectTechnologyRepository: IProjectTechnologyRepository,
    private readonly projectFeatureRepository: IProjectFeatureRepository,
  ) {
    super(projectModel);
  }

  async getAllProjects(): Promise<ProjectWithRelations[] | null> {
    const allProjects = await this.findAll();

    if (!allProjects || allProjects.length === 0) return null;

    const projectIds = allProjects.map((p) => p._id) as Types.ObjectId[];

    const [images, technologies, features] = await Promise.all([
      this.projectImageRepository.findByProjectIds(projectIds),
      this.projectTechnologyRepository.findByProjectIds(projectIds),
      this.projectFeatureRepository.findByProjectIds(projectIds),
    ]);

    const imagesMap = groupBy(images, (i) => String(i.projectId));
    const techMap = groupBy(technologies, (t) => String(t.projectId));
    const featuresMap = groupBy(features, (f) => String(f.projectId));

    return allProjects.map((project) => {
      const id = String(project._id);
      return {
        ...project.toObject(),
        images: (imagesMap[id] ?? []).map((i) => i.toObject()), // 👈
        technologies: (techMap[id] ?? []).map((t) => t.toObject()), // 👈
        features: (featuresMap[id] ?? []).map((f) => f.toObject()), // 👈
      };
    });
  }

  async getAllProjectsAdmin(
    take: number,
    skip: number,
    search?: string | null,
  ): Promise<[ProjectWithRelations[] | null, number]> {
    const options: QueryOptions = {};

    if (typeof skip === 'number') options.skip = skip;
    if (typeof take === 'number') options.limit = take;

    const filter: FilterQuery<ProjectDocument> = {};

    if (search) {
      const regex = new RegExp(search, 'i');

      filter.$or = [{ title: regex }];
    }

    const allProjects: ProjectDocument[] = await this.findAll(filter, {
      ...options,
    });

    if (!allProjects || allProjects.length === 0) return [null, 0];

    const projectIds = allProjects.map((p) => p._id) as Types.ObjectId[];

    const [images, technologies, features] = await Promise.all([
      this.projectImageRepository.findByProjectIds(projectIds),
      this.projectTechnologyRepository.findByProjectIds(projectIds),
      this.projectFeatureRepository.findByProjectIds(projectIds),
    ]);

    const imagesMap = groupBy(images, (i) => String(i.projectId));
    const techMap = groupBy(technologies, (t) => String(t.projectId));
    const featuresMap = groupBy(features, (f) => String(f.projectId));

    const result = allProjects.map((project) => {
      const id = String(project._id);
      return {
        ...project.toObject(),
        images: (imagesMap[id] ?? []).map((i) => i.toObject()),
        technologies: (techMap[id] ?? []).map((t) => t.toObject()),
        features: (featuresMap[id] ?? []).map((f) => f.toObject()),
      };
    });

    const total = await this.model.countDocuments(filter);

    return [result, total];
  }

  async count(): Promise<number> {
    return this.projectModel.countDocuments().exec();
  }

  async countThisMonth(): Promise<number> {
    const { start, end } = getCurrentMonthRange();
    return this.projectModel
      .countDocuments({
        createdAt: { $gte: start, $lt: end },
      })
      .exec();
  }

  async countPreviousMonth(): Promise<number> {
    const { start, end } = getPreviousMonthRange();
    return this.projectModel
      .countDocuments({
        createdAt: { $gte: start, $lt: end },
      })
      .exec();
  }

  async getProjectById(id: string): Promise<ProjectWithRelations | null> {
    const project = await this.projectModel.findById(id);
    return this.populateProject(project);
  }

  async getProjectBySlug(slug: any): Promise<ProjectWithRelations | null> {
    const project = await this.projectModel.findOne({ slug });
    return this.populateProject(project);
  }

  async projectAlredyExist(title: string, id?: string): Promise<boolean> {
    if (!title) return false;

    const query: FilterQuery<ProjectDocument> = { title };

    if (id) {
      query._id = { $ne: new Types.ObjectId(id) };
    }

    const project = await this.projectModel.findOne(query);

    return !!project;
  }

  async projectAlredyExistSlug(slug: string, id?: string): Promise<boolean> {
    if (!slug) return false;

    const query: FilterQuery<ProjectDocument> = { slug };

    if (id) {
      query._id = { $ne: new Types.ObjectId(id) };
    }

    const project = await this.projectModel.findOne(query);

    return !!project;
  }

  async createProyect(data: Project): Promise<ProjectDocument> {
    const newProject: ProjectDocument = await this.save(data);

    if (!newProject._id)
      throw new InternalServerErrorException(
        ProjectError.INTERNAL_SERVER_ERROR,
      );

    return newProject;
  }

  async updateProyect(id: string, data: Project): Promise<boolean> {
    const query = {
      $set: data,
    };

    const proyectUpdated = await this.projectModel.updateOne(
      {
        _id: id,
      },
      query,
    );

    if (!proyectUpdated.acknowledged) {
      return false;
    }

    if (proyectUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(
        ProjectError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  async insertMany(records: Project[]): Promise<ProjectDocument[]> {
    const newProjects: ProjectDocument[] = await this.saveMany(records);

    const hasInvalidDocument: boolean = newProjects.some((p) => !p._id);

    if (hasInvalidDocument) {
      throw new InternalServerErrorException(
        ProjectError.INTERNAL_SERVER_ERROR,
      );
    }

    return newProjects;
  }

  async deleteProject(id: string): Promise<boolean> {
    const projectDeleted: DeleteResult = await this.projectModel.deleteOne({
      _id: id,
    });

    if (projectDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(
        ProjectError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  private async populateProject(
    project: ProjectDocument | null,
  ): Promise<ProjectWithRelations | null> {
    if (!project) return null;

    const projectId = project._id as Types.ObjectId;

    const [images, technologies, features] = await Promise.all([
      this.projectImageRepository.findByProjectIds([projectId]),
      this.projectTechnologyRepository.findByProjectIds([projectId]),
      this.projectFeatureRepository.findByProjectIds([projectId]),
    ]);

    return {
      ...project.toObject(),
      images: images.map((i) => i.toObject()),
      technologies: technologies.map((t) => t.toObject()),
      features: features.map((f) => f.toObject()),
    };
  }
}
