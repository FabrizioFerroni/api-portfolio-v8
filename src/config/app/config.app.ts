import { ConfigApp } from '../types/config.app.type';

export const configApp = (): ConfigApp => {
  const enabledEmail = () =>
    process.env.MAIL_ENABLED === 'true' ? true : false;
  return {
    env: process.env.NODE_ENV || 'development',
    apiPort: Number(process.env.API_PORT) || 8080,
    apiHost: process.env.API_HOST || 'localhost',
    logLevel: process.env.LOG_LEVEL || 'info',
    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_BASEDATOS || 'test',
      timezone:
        process.env.DATABASE_TIMEZONE || 'America/Argentina/Buenos_Aires',
      authSource: process.env.DATABASE_AUTH_SOURCE || 'admin',
    },
    passPrivateKey: process.env.PASSWORD_PRIVATE_KEY || '',
    pathPrivateKey: process.env.PATH_PRIVATE_KEY || '',
    secret_jwt_register: process.env.SECRET_JWT_REGISTER || '',
    secret_jwt: process.env.SECRET_JWT || '',
    secret_jwt_refresh: process.env.SECRET_JWT_REFRESH || '',
    max_pass_failures: Number(process.env.MAX_PASS_FAILURES) || 5,
    ttl: Number(process.env.THROTTLE_TTL) || 60,
    limit: Number(process.env.THROTTLE_LIMIT) || 10,
    tz: process.env.TZ || 'America/Argentina/Buenos_Aires',
    hostMethod: process.env.HOST_METHODS || 'GET',
    hostAllowedHeader: process.env.HOST_ALLOWED_HEADERS || '*',
    hostCredentials: Boolean(process.env.HOST_CREDENTIALS) || Boolean(false),
    frontHost: process.env.FRONT_HOST || 'http://localhost:3000',
    filesDest: process.env.FILES_DEST || './uploads',
    filesDestTemp: process.env.FILES_DEST_TEMP || './uploads/temp',
    defaultUser: {
      username: process.env.DEFAULT_USER || 'admin',
      password: process.env.DEFAULT_PASSWORD || 'admin',
    },
    filesPathRoute: process.env.FILES_PATH_ROUTE || 'D:/',
    diskThreshold: Number(process.env.PERCENT_FREE) || 0.8,
    apiKey: process.env.API_KEY || '',

    enabledEmailService: enabledEmail(),
    transportFallback: process.env.TRANSPORT_FALLBACK || 'smtp://',
    emailFrom: process.env.EMAIL_FROM || '"SGD Sports" <info@api-sgd.cloud>',
    mail: {
      host: process.env.MAIL_HOST || 'localhost',
      port: +(process.env.MAIL_PORT || '1025'),
      auth: {
        user: process.env.MAIL_USER || 'user',
        pass: process.env.MAIL_PASS || 'pass',
      },
    },

    rabbit: {
      protocol: process.env.RABBITMQ_PROTOCOL || 'amqp',
      host: process.env.RABBITMQ_HOST || 'localhost',
      port: +(process.env.RABBITMQ_PORT || '5672'),
      username: process.env.RABBITMQ_USER || 'guest',
      password: process.env.RABBITMQ_PASS || 'guest',
      vhost: process.env.RABBITMQ_VHOST || '/',
      colas: Array(process.env.RABBITMQ_COLAS) || [
        'recovery',
        'forgot_password',
        'login',
        'register',
      ],
    },

    appMail: process.env.APP_MAIL || '',
    appImg: process.env.APP_IMG || '',
    exchange: process.env.RABBITMQ_EXCHANGES || '',
    mailInfo: process.env.MAIL_INFO || '',
  };
};
