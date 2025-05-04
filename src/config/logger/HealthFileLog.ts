// src/logger/terminus-file-logger.ts
import { LoggerService, LogLevel } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as dayjs from 'dayjs';

const entorno = process.env.NODE_ENV || 'development';

const transportInfo = new DailyRotateFile({
  filename: `./logs/health-${entorno}-%DATE%.log`,
  datePattern: 'DD-MM-YYYY',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '1d',
});

const transportError = new DailyRotateFile({
  filename: `./logs/errors-health-${entorno}-%DATE%.log`,
  datePattern: 'DD-MM-YYYY',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '1d',
  level: 'error',
});

const appendTimestamp = format((info) => {
  info.timestamp = dayjs().format();
  return info;
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.splat(),
    format.metadata(),
    appendTimestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [transportInfo, transportError],
});

export class TerminusFileLogger implements LoggerService {
  log(message: any) {
    logger.info(message);
  }

  error(message: any, trace?: string) {
    logger.error({ message, trace });
  }

  warn(message: any) {
    logger.warn(message);
  }

  debug?(message: any) {
    logger.debug?.(message);
  }

  verbose?(message: any) {
    logger.verbose?.(message);
  }
}
