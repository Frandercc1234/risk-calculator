import { Module } from '@nestjs/common';
import { RisksModule } from './risks/risks.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [RisksModule, HealthModule],
})
export class AppModule {}

