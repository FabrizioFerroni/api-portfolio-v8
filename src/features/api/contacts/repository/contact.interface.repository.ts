import { Injectable } from '@nestjs/common';
import { Contact, ContactDocument } from '../schema/contact.schema';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';

@Injectable()
export abstract class IContactRepository extends MongoDBRepository<ContactDocument> {
  abstract getAllContacts(
    skip: number,
    take: number,
  ): Promise<[ContactDocument[], number]>;
  abstract findOneContactById(id: string): Promise<ContactDocument | null>;
  abstract findOneContactByEmail(
    email: string,
  ): Promise<ContactDocument | null>;
  abstract findAllContactsByEmail(email: string): Promise<ContactDocument[]>;
  abstract findOneContactBySubject(
    subject: string,
  ): Promise<ContactDocument | null>;
  abstract findAllContactsBySubject(
    subject: string,
  ): Promise<ContactDocument[]>;
  abstract createContact(data: Contact): Promise<Contact>;
}
