import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadPublicConfig, PublicConfigError } from './config/public-config';

async function bootstrap(): Promise<void> {
  let config;
  try {
    config = loadPublicConfig(process.env);
  } catch (error) {
    writeFailure(error);
    return;
  }

  try {
    const app = await NestFactory.create(AppModule.forRoot(config), { logger: false });
    await app.listen(config.port, config.host);
    process.stdout.write(
      `${JSON.stringify({
        timestamp: new Date().toISOString(),
        severity: 'info',
        'service.name': 'commercecore-api',
        'service.version': config.serviceVersion,
        environment: config.environment,
        'event.name': 'http.listening',
        host: config.host,
        port: config.port,
      })}\n`,
    );
  } catch (error) {
    writeFailure(error);
  }
}

function writeFailure(error: unknown): void {
  if (error instanceof PublicConfigError) {
    process.stderr.write(
      `${JSON.stringify({
        timestamp: new Date().toISOString(),
        severity: 'error',
        'service.name': 'commercecore-api',
        'event.name': 'config.invalid',
        field: error.field,
        reason: error.reason,
        code: error.code,
      })}\n`,
    );
  } else {
    process.stderr.write(
      `${JSON.stringify({
        timestamp: new Date().toISOString(),
        severity: 'error',
        'service.name': 'commercecore-api',
        'event.name': 'bootstrap.failed',
        error: { name: error instanceof Error ? error.name : 'UnknownError' },
      })}\n`,
    );
  }
  process.exitCode = 1;
}

void bootstrap();
