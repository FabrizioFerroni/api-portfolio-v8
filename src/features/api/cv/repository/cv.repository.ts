import { InjectModel } from '@nestjs/mongoose';
import { CV, CVDocument } from '../schema/cv.schema';
import { Model, Types, UpdateWriteOpResult } from 'mongoose';
import { ICVRepository } from './cv.interface.repository';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CVError } from '../messages/general.messages';

@Injectable()
export class CVRepository
  extends MongoDBRepository<CVDocument>
  implements ICVRepository
{
  constructor(
    @InjectModel(CV.name)
    private readonly cvModel: Model<CVDocument>,
  ) {
    super(cvModel);
  }

  async findActive(): Promise<CVDocument> {
    return this.cvModel.findOne({ isActive: true }).exec();
  }

  async findOldCVS(): Promise<CVDocument[] | null> {
    return this.cvModel
      .find({
        isActive: false,
      })
      .sort({
        createdAt: -1,
      });
  }

  async create(data: CV): Promise<CV> {
    const cv: CV = plainToInstance(CV, data);
    const cvCreated: CVDocument = await this.save(cv);

    if (!cvCreated._id) {
      throw new InternalServerErrorException(CVError.INTERNAL_SERVER_ERROR);
    }

    return cv;
  }

  async deactivate(id: Types.ObjectId): Promise<UpdateWriteOpResult> {
    const result = await this.cvModel
      .updateOne({ _id: id }, { isActive: false })
      .exec();

    return result;
  }

  async incrementDownloadAndGet(): Promise<CV | null> {
    return this.cvModel
      .findOneAndUpdate(
        { isActive: true },
        { $inc: { downloadCount: 1 } },
        { new: true },
      )
      .exec();
  }
}
