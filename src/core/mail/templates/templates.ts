import { templateToString } from '../config/config.mail';

export const templateToSend = (bodyT: Record<string, unknown>): string => {
  const {
    queue,
    urlApp,
    nameClient,
    emailClient,
    subjectClient,
    messageClient,
    mailInfo,
    appImg,
  } = bodyT;

  const year = new Date().getFullYear();

  let template: string;
  switch (queue) {
    case 'send_contact': {
      const body = {
        year,
        urlApp,
        name: nameClient,
        email: emailClient,
        subject: subjectClient,
        message: messageClient,
        mailinfo: mailInfo,
        appImg,
      };
      template = templateToString('send_contact', body);

      break;
    }
  }
  return template;
};
