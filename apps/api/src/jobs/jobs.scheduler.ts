import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobsService } from './jobs.service';

@Injectable()
export class JobsScheduler {
  constructor(private readonly jobs: JobsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { timeZone: 'Africa/Lubumbashi' })
  closeSessions(): Promise<number> {
    return this.jobs.closeInactiveSessions();
  }

  @Cron('10 0 * * *', { timeZone: 'Africa/Lubumbashi' })
  dailyStats(): Promise<void> {
    return this.jobs.computeDailyStats();
  }

  @Cron('0 3 * * *', { timeZone: 'Africa/Lubumbashi' })
  purge(): Promise<{ events: number; pageViews: number }> {
    return this.jobs.purgeOldDetail();
  }
}
