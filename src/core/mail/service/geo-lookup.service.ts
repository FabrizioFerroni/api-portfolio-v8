import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GeoLookupResult } from '@/core/interfaces/geo-lookup.interface';

@Injectable()
export class GeoLookupService {
  private readonly logger = new Logger(GeoLookupService.name);

  constructor(private readonly httpService: HttpService) {}

  async lookup(ip: string): Promise<GeoLookupResult> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`http://ip-api.com/json/${ip}`, {
          params: { fields: 'status,message,country,city' },
          timeout: 3000,
        }),
      );

      if (data.status !== 'success') {
        this.logger.warn(`Geo lookup falló para ${ip}: ${data.message}`);
        return {};
      }

      return {
        city: data.city,
        country: data.country,
      };
    } catch (error) {
      this.logger.error(`Error consultando geolocalización para ${ip}`, error);
      return {};
    }
  }
}
