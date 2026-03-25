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
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { MessageQueue, MessageRabbit } from '../types/message.type';
import { SendQueue } from '../types/send-qeue';
import { templateToSend } from '../templates/templates';

@Injectable()
export class MailQeueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(MailQeueService.name, {
    timestamp: true,
  });
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;

  connectUri: string = '';
  constructor(private readonly configService: ConfigService) {
    const protocol: string =
      this.configService.get<string>('RABBITMQ_PROTOCOL');
    const username: string = this.configService.get<string>('RABBITMQ_USER');
    const password: string = this.configService.get<string>('RABBITMQ_PASS');
    const host: string = this.configService.get<string>('RABBITMQ_HOST');
    const port: number = this.configService.get<number>('RABBITMQ_PORT');

    this.connectUri = `${protocol}://${username}:${password}@${host}:${port}`;
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Conectando a RabbitMQ...');

    this.connection = amqp.connect([this.connectUri]);
    this.channel = this.connection.createChannel({
      setup: async (_channel: ConfirmChannel): Promise<void> => {
        this.logger.log('Canal de RabbitMQ creado y listo');
      },
    });

    this.connection.on('connect', (): void =>
      this.logger.log('Conectado a RabbitMQ'),
    );
    this.connection.on('disconnect', (err: { err: Error }): void =>
      this.logger.error('Desconectado de RabbitMQ', err?.err),
    );

    await this.channel.waitForConnect();
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Cerrando conexión a RabbitMQ...');
    try {
      await this.channel.close();
    } catch (err) {
      this.logger.warn('Canal ya cerrado:', err?.message);
    }
    try {
      await this.connection.close();
    } catch (err) {
      this.logger.warn('Conexión ya cerrada:', err?.message);
    }
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

  async receiveRabbit({
    queue,
    mailer,
  }: Partial<MessageRabbit>): Promise<void> {
    try {
      await this.channel.addSetup(
        async (channel: ConfirmChannel): Promise<void> => {
          await channel.assertQueue(queue, { durable: true });

          await channel.consume(
            queue,
            async (message: ConsumeMessage): Promise<void> => {
              if (!message) return;

              try {
                const data: MessageQueue = JSON.parse(
                  message.content.toString(),
                );

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

                const html: string = templateToSend({
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
                  from: `${nombre} <${email}>`,
                  to: emailFrom,
                  subject,
                  html,
                });

                this.safeAck(channel, message);
              } catch (err) {
                this.logger.error(
                  '❌ Error procesando mensaje, reintentando...',
                  err,
                );
                this.safeAck(channel, message, true);
              }
            },
            { noAck: false },
          );
        },
      );

      this.logger.log(`✅ Esperando mensajes en la cola "${queue}"...`);
    } catch (err) {
      this.logger.error('Error inicializando consumidor de RabbitMQ:', err);
    }
  }

  private safeAck(
    channel: ConfirmChannel,
    message: any,
    requeue = false,
  ): void {
    try {
      requeue ? channel.nack(message, false, true) : channel.ack(message);
    } catch (err) {
      if (err?.message === 'Channel closed') {
        this.logger.warn(
          `Canal cerrado al intentar ${requeue ? 'nack' : 'ack'}, ignorando...`,
        );
      } else {
        throw err;
      }
    }
  }
}
