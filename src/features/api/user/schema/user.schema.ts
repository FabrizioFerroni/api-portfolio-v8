import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';
@Schema({ versionKey: false })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: false,
    default:
      'https://res.cloudinary.com/fabrizio-dev/image/upload/v1671107994/fabrizio-dev/default_user_acmdr1.webp',
  })
  avatar: string;

  @Prop({ required: false, trim: true })
  imageUrl: string;

  @Prop({ required: false, trim: true })
  imagePath: string;

  @Prop({ required: true, default: false })
  active: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: false, default: null })
  updatedAt: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
