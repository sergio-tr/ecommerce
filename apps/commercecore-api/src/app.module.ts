import { type DynamicModule, Module } from '@nestjs/common';
import { SyntheticCatalogController } from './catalog/synthetic-catalog.controller';
import { InMemorySyntheticCatalog } from './catalog/synthetic-catalog';
import { PUBLIC_CONFIG, type PublicConfig } from './config/public-config';
import { HealthController } from './health/health.controller';

@Module({})
export class AppModule {
  static forRoot(config: PublicConfig): DynamicModule {
    return {
      module: AppModule,
      controllers: [HealthController, SyntheticCatalogController],
      providers: [{ provide: PUBLIC_CONFIG, useValue: config }, InMemorySyntheticCatalog],
    };
  }
}
