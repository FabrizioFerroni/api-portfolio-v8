import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false })
export class ProjectFeature {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  updatedAt: Date | null;
}

export type ProjectFeatureDocument = ProjectFeature & Document;
export const ProjectFeatureSchema =
  SchemaFactory.createForClass(ProjectFeature);
