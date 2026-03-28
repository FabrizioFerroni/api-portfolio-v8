import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class Experience {
  @Prop({ required: true, trim: true })
  company: string;

  @Prop({ required: true, trim: true })
  position: string;

  @Prop({ type: Date, required: true })
  startsDate: Date;

  @Prop({ type: Date, default: null })
  endsDate: Date | null;

  @Prop({ default: false })
  currentPosition: boolean;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  updatedAt: Date | null;
}

export type ExperienceDocument = Experience & Document;
export const ExperienceSchema = SchemaFactory.createForClass(Experience);
