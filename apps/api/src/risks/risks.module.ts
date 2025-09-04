import { Module } from '@nestjs/common';
import { RisksController, SimulationController } from './risks.controller';
import { RisksService } from './risks.service';
import { RisksRepository } from './risks.repository';

@Module({
  controllers: [RisksController, SimulationController],
  providers: [RisksService, RisksRepository],
  exports: [RisksService],
})
export class RisksModule {}

