import { Mailer } from 'nestjs-mailer';

export type MessageQueue = {
  email: string;
  subject: string;
  exchange: string;
  urlApp: string;
  appImg: string;
  mailInfo: string;
  nombre: string;
  nameClient: string;
  emailClient: string;
  subjectClient: string;
  messageClient: string;
  emailFrom?: string;
};

export type MessageRabbit = {
  queue: string;
  payload: {
    message: MessageQueue;
    data: unknown;
    statusCode: number;
    ok: boolean;
  };
  mailer: Mailer;
};

export type ProductData = {
  image: string;
  name: string;
  unitPrice: number;
  vbuckPrice: number;
  quantity: number;
};
