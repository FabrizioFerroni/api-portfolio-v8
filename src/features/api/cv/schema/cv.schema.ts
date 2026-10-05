import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false })
export class CV {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  downloadName: string;

  @Prop({ required: true })
  storedFileName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  sizeBytes: number;

  @Prop({ default: 0 })
  downloadCount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  updatedAt: Date | null;
}

export type CVDocument = CV & Document<Types.ObjectId>;
export const CVSchema = SchemaFactory.createForClass(CV);
