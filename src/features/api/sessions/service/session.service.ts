import { TransformDto } from '@/shared/utils';
import { Session, SessionDocument } from '../schema/session.schema';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ISessionRepository } from '../repository/session.interface.repository';
import { SessionResponseDto } from '../dto/response/session.response.dto';
import { Types } from 'mongoose';
import { UAParser } from 'ua-parser-js';
import { CreateSession } from '../dto/create-session.dto';
import { DeviceType } from '../enum/device.enum';
import { Request } from 'express';
import { GeoLookupService } from '@/core/mail/service/geo-lookup.service';
import { isPrivateIp } from '@/shared/utils/functions/is-private-ip.util';
import { GeoLookupResult } from '@/core/interfaces/geo-lookup.interface';
import { createHash, timingSafeEqual } from 'node:crypto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly geoLookupService: GeoLookupService,
    @Inject(TransformDto)
    private readonly transform: TransformDto<
      SessionDocument,
      SessionResponseDto
    >,
  ) {}

  transformObject(data: SessionDocument) {
    return this.transform.transformDtoObjectNew(data, SessionResponseDto);
  }

  async create(dto: CreateSession, req: Request): Promise<SessionDocument> {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] ?? '';
    const parsed = this.parseUserAgent(userAgent);
    const location = await this.resolveLocation(
      ip,
      req.headers['cf-ipcountry'] as string,
    );

    let rememberMe = false;

    if (dto.remembered === 'true') {
      rememberMe = true;
    }

    const expiresAt = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 60 * 60 * 1000);

    const sessionData: Session = {
      userId: new Types.ObjectId(dto.userId),
      ip,
      city: location.city ?? '',
      country: location.country ?? '',
      deviceName: parsed.deviceName,
      deviceType: parsed.deviceType,
      browser: parsed.browser,
      os: parsed.os,
      userAgent: userAgent,
      remembered: rememberMe,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      expiresAt,
      revokedAt: null,
    } as Session;

    return this.sessionRepository.createSession(sessionData);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async validateRefreshTokenHash(
    sessionId: string,
    token: string,
  ): Promise<boolean> {
    const session = await this.sessionRepository.findByIdWithHash(sessionId);
    if (!session || !session.refreshTokenHash) return false;

    const incomingHash = Buffer.from(this.hashToken(token));
    const storedHash = Buffer.from(session.refreshTokenHash);

    if (incomingHash.length !== storedHash.length) return false;
    return timingSafeEqual(incomingHash, storedHash);
  }

  async storeRefreshTokenHash(sessionId: string, token: string): Promise<void> {
    await this.sessionRepository.updateRefreshTokenHash(
      sessionId,
      this.hashToken(token),
    );
  }

  async findActiveById(sessionId: string): Promise<SessionResponseDto | null> {
    const activeSession: SessionDocument =
      await this.sessionRepository.findActiveById(sessionId);

    return this.transformObject(activeSession);
  }

  async touch(sessionId: string): Promise<boolean> {
    return this.sessionRepository.touch(sessionId);
  }

  async rotate(
    sessionId: string,
    token: string,
    rememberMe: boolean,
  ): Promise<boolean> {
    const ttlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + ttlMs);
    return this.sessionRepository.rotate(
      sessionId,
      this.hashToken(token),
      expiresAt,
    );
  }

  async revoke(sessionId: string): Promise<boolean> {
    return this.sessionRepository.revoke(sessionId);
  }

  async revokeAllExcept(
    userId: Types.ObjectId,
    keepSessionId: string,
  ): Promise<boolean> {
    return this.sessionRepository.revokeAllExcept(userId, keepSessionId);
  }

  async findActiveByUser(
    userId: Types.ObjectId,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionRepository.findActiveByUser(userId);
    return sessions.map((s) => this.transformObject(s));
  }

  private readonly DEVICE_NAMES: Record<string, string> = {
    Android: 'Android Celular',
    iOS: 'iPhone Celular',
    Windows: 'Windows PC',
    MacOS: 'Macbook',
    Linux: 'Linux PC',
  };

  private parseUserAgent(userAgent: string) {
    const parsed = UAParser(userAgent);
    const deviceType = this.resolveDeviceType(parsed.device.type);

    const deviceName = this.DEVICE_NAMES[parsed.os.name ?? ''] ?? 'Desconocido';

    return {
      deviceType,
      deviceName: deviceName,
      browser:
        `${parsed.browser.name ?? 'Desconocido'} ${parsed.browser.major ?? ''}`.trim(),
      os: `${parsed.os.name ?? 'Desconocido'} ${parsed.os.version ?? ''}`.trim(),
    };
  }

  private resolveDeviceType(type?: string): DeviceType {
    if (type === 'mobile') return DeviceType.MOBILE;
    if (type === 'tablet') return DeviceType.TABLET;
    return DeviceType.DESKTOP;
  }

  private async resolveLocation(
    ip: string,
    cfCountry?: string,
  ): Promise<GeoLookupResult> {
    if (isPrivateIp(ip)) {
      return {};
    }

    if (cfCountry) {
      return { country: cfCountry };
    }

    return this.geoLookupService.lookup(ip);
  }
}
