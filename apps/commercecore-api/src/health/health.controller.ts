import { Controller, Get, Inject } from '@nestjs/common';
import { PUBLIC_CONFIG, type PublicConfig } from '../config/public-config';
import { healthLiveResponse, type HealthLiveResponse } from './health.response';

@Controller('health')
export class HealthController {
  private readonly config: PublicConfig;

  constructor(@Inject(PUBLIC_CONFIG) config: PublicConfig) {
    this.config = config;
  }

  @Get('live')
  live(): HealthLiveResponse {
    return healthLiveResponse(this.config.serviceVersion);
  }
}
