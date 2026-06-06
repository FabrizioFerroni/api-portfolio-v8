import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class PortfolioView {
  @Prop({ type: Date, required: true, unique: true, index: true })
  date: Date; // "YYYY-MM-DD"

  @Prop({ default: 0, type: 'Number' })
  viewsCount: number;
}

export type PortfolioViewDocument = PortfolioView & Document;
export const PortfolioViewSchema = SchemaFactory.createForClass(PortfolioView);
