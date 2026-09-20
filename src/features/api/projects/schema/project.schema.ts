import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class ImageVariant {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  path: string;
}

@Schema({ versionKey: false })
export class Project {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: Date, default: null })
  publishedDate: Date | null;

  @Prop({ type: Boolean, required: true, default: false })
  isPublished: boolean;

  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, trim: true, default: 'public' })
  visibility: string;

  @Prop({ required: true, trim: true, default: 'personal' })
  type: string;

  @Prop({ required: false, trim: true, default: '' })
  urlGithub: string;

  @Prop({ required: false, trim: true, default: '' })
  urlProyect: string;

  @Prop({ type: Object })
  imageVariants: Record<string, { url: string; path: string }>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  updatedAt: Date | null;
}

export type ProjectDocument = Project & Document;
export const ProjectSchema = SchemaFactory.createForClass(Project);
