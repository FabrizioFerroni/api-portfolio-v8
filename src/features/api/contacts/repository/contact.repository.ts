import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Contact, ContactDocument } from '../schema/contact.schema';
import { Model, QueryOptions } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IContactRepository } from './contact.interface.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ContactError } from '../messages/contact.messages';

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
  ): Promise<[ContactDocument[], number]> {
    const options: QueryOptions = {};
    if (typeof skip === 'number') options.skip = skip;
    if (typeof take === 'number') options.limit = take;

    const allContacts = await this.findAll(null, options);

    const plainContacts = allContacts.map((contact) => contact.toObject());

    const total = await this.model.countDocuments({});

    return [plainContacts, total];
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
}
