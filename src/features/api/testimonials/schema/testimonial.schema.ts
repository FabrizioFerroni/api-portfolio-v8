import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({ versionKey: false })
export class Testimonial {
  @Prop({ required: false, trim: true })
  imageUrl: string;

  @Prop({ required: false, trim: true })
  imageFullUrl: string;

  @Prop({ required: false, trim: true })
  imagePath: string;

  @Prop({ required: true, trim: true })
  comment: string;

  @Prop({ required: true, trim: true })
  fullname: string;

  @Prop({ required: true, trim: true })
  position: string;

  @Prop({ required: true, trim: true })
  empresa: string;

  @Prop({ required: true, default: false })
  visible: boolean;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: false, default: null })
  updatedAt: Date;
}

// export type TestimonialDocument = Testimonial & Document;
export type TestimonialDocument = HydratedDocument<Testimonial>;
export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
