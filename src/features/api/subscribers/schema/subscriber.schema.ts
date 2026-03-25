import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Subscriber {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: Date, default: Date.now })
  subscribedAt: Date;

  @Prop({ required: true, default: 'web-portfolio' })
  source: string;

  @Prop({ required: true, default: true })
  status: boolean;
}

export type SubscriberDocument = Subscriber & Document;
export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
