import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

@Schema({ timestamps: true })
export abstract class BaseSchema extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: false, default: null })
  updatedAt: Date;
}
