import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsScheduler } from './jobs.scheduler';
import { JobsService } from './jobs.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [JobsService, JobsScheduler],
  exports: [JobsService],
})
export class JobsModule {}
