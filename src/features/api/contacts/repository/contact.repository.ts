import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Contact, ContactDocument } from '../schema/contact.schema';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IContactRepository } from './contact.interface.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ContactError } from '../messages/contact.messages';
import { ContactCount } from '../interfaces/contact-count.interface';
import {
  getCurrentMonthRange,
  getPreviousMonthRange,
} from '@/shared/utils/functions/date.utils';

@Injectable()
export class ContactRepository
  extends MongoDBRepository<ContactDocument>
  implements IContactRepository
{
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {
    super(contactModel);
  }

  async getAllContacts(
    skip: number,
    take: number,
    search?: string | null,
  ): Promise<[ContactDocument[], number]> {
    const options: QueryOptions = {};
    if (typeof skip === 'number') options.skip = skip;
    if (typeof take === 'number') options.limit = take;

    const filter: FilterQuery<ContactDocument> = {};

    if (search) {
      const regex = new RegExp(search, 'i');

      if (search.includes('@')) {
        filter.email = regex;
      } else {
        filter.$or = [{ name: regex }, { subject: regex }];
      }
    }

    const allContacts = await this.findAll(filter, options);

    const plainContacts = allContacts.map((contact) => contact.toObject());

    const total = await this.model.countDocuments(filter);

    return [plainContacts, total];
  }

  async count(): Promise<number> {
    return this.contactModel.countDocuments().exec();
  }

  async countThisMonth(): Promise<number> {
    const { start, end } = getCurrentMonthRange();
    return this.contactModel
      .countDocuments({
        createdAt: { $gte: start, $lt: end },
      })
      .exec();
  }

  async countPreviousMonth(): Promise<number> {
    const { start, end } = getPreviousMonthRange();
    return this.contactModel
      .countDocuments({
        createdAt: { $gte: start, $lt: end },
      })
      .exec();
  }

  async getContactStats(): Promise<ContactCount> {
    const [total, unread, read, repplied] = await Promise.all([
      this.model.countDocuments({}),
      this.model.countDocuments({
        status: { $regex: 'unread', $options: 'i' },
      }),
      this.model.countDocuments({
        status: { $regex: 'read', $options: 'i' },
      }),
      this.model.countDocuments({
        status: { $regex: 'repplied', $options: 'i' },
      }),
    ]);

    return { total, unread, read, repplied };
  }

  async findOneContactById(id: string): Promise<ContactDocument | null> {
    const contact = await this.contactModel.findById(id);
    return contact ? contact.toJSON() : null;
  }

  async findAllContactsByEmail(email: string): Promise<ContactDocument[]> {
    const allContactsByEmail = await this.findAll({ email });
    const plainContacts: ContactDocument[] = allContactsByEmail.map(
      (contact: ContactDocument) => contact.toObject(),
    );
    return plainContacts;
  }

  async findOneContactByEmail(email: string): Promise<ContactDocument | null> {
    const contact = await this.contactModel.findOne({ email });
    return contact ? contact.toJSON() : null;
  }

  async findOneContactBySubject(
    subject: string,
  ): Promise<ContactDocument | null> {
    const contact = await this.contactModel.findOne({ subject });
    return contact ? contact.toJSON() : null;
  }

  async findAllContactsBySubject(subject: string): Promise<ContactDocument[]> {
    const allContactsBySubject = await this.findAll({ subject });
    const plainContacts: ContactDocument[] = allContactsBySubject.map(
      (contact: ContactDocument) => contact.toObject(),
    );
    return plainContacts;
  }

  async createContact(data: Contact): Promise<Contact> {
    const contact = plainToInstance(Contact, data);
    const contactCreated = await this.save(contact);

    if (!contactCreated._id) {
      throw new InternalServerErrorException(
        ContactError.INTERNAL_SERVER_ERROR,
      );
    }

    return contact;
  }

  async updateContact(id: string, data: Contact): Promise<boolean> {
    const contact: Contact = plainToInstance(Contact, data);

    const query = {
      $set: contact,
    };

    const contactUpdated = await this.update(id, query);

    if (!contactUpdated.acknowledged) {
      return null;
    }

    if (contactUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(
        ContactError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  async deleteContact(id: string): Promise<boolean> {
    const contDeleted: { deletedCount?: number } = await this.remove(id);

    if (contDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(
        ContactError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }
}
