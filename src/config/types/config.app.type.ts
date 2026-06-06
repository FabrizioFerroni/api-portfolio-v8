export type ConfigApp = {
  env: string;
  logLevel: string;
  apiPort: number;
  apiHost: string;
  database: DbConfig;
  passPrivateKey: string;
  pathPrivateKey: string;
  secret_jwt_register: string;
  secret_jwt: string;
  secret_jwt_refresh: string;
  max_pass_failures: number;
  ttl: number;
  limit: number;
  tz: string;
  hostMethod: string;
  hostAllowedHeader: string;
  hostCredentials: boolean;
  frontHost: string;
  frontHostPortfolio: string;
  filesDest: string;
  filesDestTemp: string;
  filesPathRoute: string;
  diskThreshold: number;
  defaultUser: DefaultUser;
  apiKey: string;

  //email
  enabledEmailService: boolean;
  emailFrom: string;
  mail: MailConfig;
  rabbit: RabbitConfig;
  transportFallback: string;

  appMail: string;
  appImg: string;
  exchange: string;
  mailInfo: string;
};

export type DbConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  timezone: string;
  authSource: string;
};

export type DefaultUser = {
  username: string;
  password: string;
};

type RabbitConfig = {
  protocol: string;
  host: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
  colas: string[];
};

type MailConfig = {
  host: string;
  port: number;
  auth: Auth;
};

type Auth = {
  user: string;
  pass: string;
};
