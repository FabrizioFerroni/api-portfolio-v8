import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('debug-ip')
export class DebugIpController {
  @Get()
  getIp(@Req() req: Request) {
    return { ip: req.ip, ips: req.ips };
  }
}
