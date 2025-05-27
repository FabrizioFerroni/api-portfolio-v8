import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ versionKey: false, timestamps: true })
export class Contact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Date, default: Date.now })
  sendAt: Date;

  @Prop({ type: Date, required: false, default: null })
  receivedAt: Date;
}

export type ContactDocument = Contact & Document;
export const ContactSchema = SchemaFactory.createForClass(Contact);
