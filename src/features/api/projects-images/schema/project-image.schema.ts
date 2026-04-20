import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false })
export class ProjectImage {
  @Prop({ required: true, trim: true })
  imageUrl: string;

  @Prop({ required: false, trim: true })
  imageFullUrl: string;

  @Prop({ required: true, trim: true })
  imagePath: string;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ trim: true, default: '' })
  altText: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export type ProjectImageDocument = ProjectImage & Document;
export const ProjectImageSchema = SchemaFactory.createForClass(ProjectImage);
