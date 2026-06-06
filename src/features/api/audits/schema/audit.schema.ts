import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ versionKey: false, timestamps: true })
export class Audit {
  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  details: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  module: string;

  @Prop({ required: true, default: false })
  isPortfolio: boolean;

  @Prop({ type: Date, default: Date.now })
  dateAudit: Date;
}

export type AuditDocument = Audit & Document;
export const AuditSchema = SchemaFactory.createForClass(Audit);
