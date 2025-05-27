import { configApp } from '@/config/app/config.app';
import { InjectMailer, Mailer, MailerModule } from 'nestjs-mailer';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailQeueService } from './service/mail-qeue.service';
import { parseSafeArray } from '@/shared/utils/functions/parseArray';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        config: {
          transport: {
            host: configApp().mail.host,
            port: configApp().mail.port,
            auth: {
              user: configApp().mail.auth.user,
              pass: configApp().mail.auth.pass,
            },
          },
          defaults: {
            from: configApp().emailFrom,
          },
        },
      }),
    }),
  ],
  providers: [MailQeueService],
  exports: [MailQeueService],
})
export class MailModule implements OnModuleInit {
  constructor(
    @InjectMailer()
    private readonly mailer: Mailer,
    private readonly mailQeueService: MailQeueService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const colasString: string =
      this.configService.get<string>('RABBITMQ_COLAS');
    let colas: string[] = [];

    try {
      colas = parseSafeArray(colasString);
    } catch (e) {
      console.error('❌ Error parseando colas:', e);
    }

    if (Array.isArray(colas)) {
      for (const queue of colas) {
        await this.mailQeueService.receiveRabbit({
          queue,
          mailer: this.mailer,
        });
      }
    } else {
      console.error('❌ Colas no es un array válido:', colas);
    }
  }
}
