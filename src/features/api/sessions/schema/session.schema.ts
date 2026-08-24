import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DeviceType } from '../enum/device.enum';

@Schema({ versionKey: false })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  ip: string;

  @Prop({ type: String, required: false, select: false })
  refreshTokenHash?: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop({ required: false })
  deviceName: string;

  @Prop({ type: String, enum: DeviceType, required: false })
  deviceType: DeviceType;

  @Prop({ required: false })
  browser: string;

  @Prop({ required: false })
  os: string;

  @Prop({ required: false })
  userAgent: string;

  @Prop({ required: true, default: false })
  remembered: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  lastUsedAt: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, required: false, default: null })
  revokedAt: Date;
}

export type SessionDocument = Session & Document;
export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
