import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable } from '@nestjs/common';
import { Setting, SettingDocument } from '../schema/setting.schema';

@Injectable()
export abstract class ISettingRepository extends MongoDBRepository<SettingDocument> {
  abstract getSetting(): Promise<SettingDocument | null>;
  abstract updateSetting(id: string, data: Partial<Setting>): Promise<boolean>;
  abstract get(): Promise<SettingDocument>;
  abstract upsert(data: Partial<Setting>): Promise<SettingDocument>;
}
