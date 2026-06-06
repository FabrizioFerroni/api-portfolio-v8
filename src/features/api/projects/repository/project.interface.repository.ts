import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Project, ProjectDocument } from '../schema/project.schema';
import { Injectable } from '@nestjs/common';
import { ProjectWithRelations } from '../interfaces/project-with-relations.interface';

@Injectable()
export abstract class IProjectRepository extends MongoDBRepository<ProjectDocument> {
  abstract getAllProjects(): Promise<ProjectWithRelations[] | null>;
  abstract getAllProjectsAdmin(
    take: number,
    skip: number,
    search?: string | null,
  ): Promise<[ProjectWithRelations[] | null, number]>;
  abstract count(): Promise<number>;
  abstract getProjectById(id: string): Promise<ProjectWithRelations | null>;
  abstract getProjectBySlug(slug): Promise<ProjectWithRelations | null>;
  abstract projectAlredyExist(title: string, id?: string): Promise<boolean>;
  abstract projectAlredyExistSlug(slug: string, id?: string): Promise<boolean>;
  abstract createProyect(data: Project): Promise<ProjectDocument>;
  abstract updateProyect(id: string, data: Project): Promise<boolean>;
  abstract insertMany(records: Project[]): Promise<ProjectDocument[]>;
  abstract deleteProject(id: string): Promise<boolean>;
  abstract countThisMonth(): Promise<number>;
  abstract countPreviousMonth(): Promise<number>;
}
