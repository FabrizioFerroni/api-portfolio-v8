import { InjectModel } from '@nestjs/mongoose';
import { Setting, SettingDocument } from '../schema/setting.schema';
import { Model } from 'mongoose';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ISettingRepository } from './setting.interface.repository';
import { SettingsMsjError } from '../messages/setting.message';

@Injectable()
export class SettingRepository
  extends MongoDBRepository<SettingDocument>
  implements ISettingRepository
{
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {
    super(settingModel);
  }

  async getSetting(): Promise<SettingDocument | null> {
    const setting = await this.settingModel.findOne();
    return setting ? setting.toJSON() : null;
  }

  async updateSetting(id: string, data: Partial<Setting>): Promise<boolean> {
    const query = { $set: data };

    const userUpdated = await this.update(id, query);

    if (!userUpdated.acknowledged || userUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(
        SettingsMsjError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  async get(): Promise<SettingDocument> {
    return this.model.findOne().lean().exec();
  }

  async upsert(data: Partial<Setting>): Promise<SettingDocument> {
    return this.model
      .findOneAndUpdate({}, { $set: data }, { upsert: true, new: true })
      .lean()
      .exec();
  }
}
