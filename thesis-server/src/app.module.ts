import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TopicsModule } from './modules/topics/topics.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { ProgressModule } from './modules/progress/progress.module';
import { GradingModule } from './modules/grading/grading.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    TopicsModule,
    RegistrationsModule,
    ProgressModule,
    GradingModule,
  ],
})
export class AppModule {}
