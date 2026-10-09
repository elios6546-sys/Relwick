import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SettingsCacheService } from './settings-cache.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsCacheService],
  exports: [SettingsCacheService, SettingsService],
})
export class SettingsModule {}
