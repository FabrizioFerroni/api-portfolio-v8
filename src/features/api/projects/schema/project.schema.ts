import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true, default: 'public' })
  visibility: string;

  @Prop({ required: true, trim: true, default: 'personal' })
  type: string;

  @Prop({ required: false, trim: true, default: '' })
  urlGithub: string;

  @Prop({ required: false, trim: true, default: '' })
  urlProyect: string;

  @Prop({ required: false, trim: true })
  imageUrl: string;

  @Prop({ required: false, trim: true })
  imageFullUrl: string;

  @Prop({ required: false, trim: true })
  imagePath: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  updatedAt: Date | null;
}

export type ProjectDocument = Project & Document;
export const ProjectSchema = SchemaFactory.createForClass(Project);
