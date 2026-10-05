import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { CV, CVDocument } from '../schema/cv.schema';
import { Injectable } from '@nestjs/common';
import { Types, UpdateWriteOpResult } from 'mongoose';

@Injectable()
export abstract class ICVRepository extends MongoDBRepository<CVDocument> {
  abstract findActive(): Promise<CVDocument | null>;
  abstract findOldCVS(): Promise<CVDocument[] | null>;
  abstract create(data: CV): Promise<CV>;
  abstract deactivate(id: Types.ObjectId): Promise<UpdateWriteOpResult>;
  abstract incrementDownloadAndGet(): Promise<CV | null>;
}
