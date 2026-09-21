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

    case 'forgot_password': {
      const body = {
        year,
        urlApp,
        name: nameClient,
        email: emailClient,
        subject: subjectClient,
        url: messageClient,
        mailinfo: mailInfo,
        appImg,
        app: 'Portfolio Fabrizio Dev',
      };
      template = templateToString('forgot_password', body);

      break;
    }

    case 'recovery': {
      const body = {
        year,
        urlApp,
        name: nameClient,
        email: emailClient,
        subject: subjectClient,
        url: messageClient,
        mailinfo: mailInfo,
        appImg,
        app: 'Portfolio Fabrizio Dev',
      };
      template = templateToString('recovery', body);

      break;
    }
  }
  return template;
};
