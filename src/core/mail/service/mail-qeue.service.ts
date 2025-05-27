import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import amqp from 'amqp-connection-manager';
import * as amqp from 'amqp-connection-manager';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { MessageQueue, MessageRabbit } from '../types/message.type';
import { SendQueue } from '../types/send-qeue';
import { templateToSend } from '../templates/templates';

@Injectable()
export class MailQeueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailQeueService.name, {
    timestamp: true,
  });
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;

  connectUri = '';
  constructor(private readonly configService: ConfigService) {
    const protocol = this.configService.get<string>('RABBITMQ_PROTOCOL');
    const username = this.configService.get<string>('RABBITMQ_USER');
    const password = this.configService.get<string>('RABBITMQ_PASS');
    const host = this.configService.get<string>('RABBITMQ_HOST');
    const port = this.configService.get<number>('RABBITMQ_PORT');

    this.connectUri = `${protocol}://${username}:${password}@${host}:${port}`;
  }

  async onModuleInit() {
    this.logger.log('Conectando a RabbitMQ...');

    this.connection = amqp.connect([this.connectUri]);
    this.channel = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        this.logger.log('Canal de RabbitMQ creado y listo');
        // Podés declarar exchanges/colas si querés acá también
      },
    });

    this.connection.on('connect', () =>
      this.logger.log('Conectado a RabbitMQ'),
    );
    this.connection.on('disconnect', (err) =>
      this.logger.error('Desconectado de RabbitMQ', err?.err),
    );

    await this.channel.waitForConnect();
  }

  async onModuleDestroy() {
    this.logger.log('Cerrando conexión a RabbitMQ...');
    await this.channel.close();
    await this.connection.close();
  }

  async sendEmailQueue({
    message,
    queue: routing,
    key: exchange,
  }: SendQueue<MessageQueue>): Promise<boolean> {
    try {
      await this.channel.publish(
        exchange,
        routing,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );
      this.logger.log(
        `Mensaje enviado a exchange "${exchange}" y routing "${routing}"`,
      );
      return true;
    } catch (err) {
      this.logger.error('Error enviando mensaje a RabbitMQ:', err);
      return false;
    }
  }

  async receiveRabbit({ queue, mailer }: Partial<MessageRabbit>) {
    try {
      await this.channel.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue(queue, { durable: true });

        await channel.consume(
          queue,
          async (message) => {
            if (!message) return;

            try {
              const data: MessageQueue = JSON.parse(message.content.toString());

              this.logger.log(` [x] Mensaje recibido de ${queue}:`, data);

              const {
                email,
                subject,
                emailFrom,
                nombre,
                urlApp,
                mailInfo,
                appImg,
                messageClient,
                nameClient,
                subjectClient,
                emailClient,
              } = data;

              const html = templateToSend({
                queue,
                urlApp,
                nameClient,
                emailClient,
                subjectClient,
                messageClient,
                mailInfo,
                appImg,
              });

              await mailer.sendMail({
                from: emailFrom,
                to: `${nombre} <${email}>`,
                subject,
                html,
              });

              channel.ack(message);
            } catch (err) {
              this.logger.error(
                '❌ Error procesando mensaje, reintentando...',
                err,
              );
              channel.nack(message, false, true);
            }
          },
          { noAck: false },
        );
      });

      this.logger.log(`✅ Esperando mensajes en la cola "${queue}"...`);
    } catch (err) {
      this.logger.error('Error inicializando consumidor de RabbitMQ:', err);
    }
  }
}
