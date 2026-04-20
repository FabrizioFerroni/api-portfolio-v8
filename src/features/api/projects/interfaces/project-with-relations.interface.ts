import { ProjectFeatureDocument } from '../../projects-features/schema/project-feature.schema';
import { ProjectImageDocument } from '../../projects-images/schema/project-image.schema';
import { ProjectTechnologyDocument } from '../../projects-technologies/schema/project-technology.schema';

export interface ProjectWithRelations {
  id: string;
  title: string;
  summary: string;
  description: string;
  publishedDate: Date | null;
  slug: string;
  isFeatured: boolean;
  imageUrl: string;
  imageFullUrl: string;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date | null;
  images: ProjectImageDocument[];
  technologies: ProjectTechnologyDocument[];
  features: ProjectFeatureDocument[];
}
