import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from './schemas/progress.schema';
import { Registration, RegistrationSchema } from '../registrations/schemas/registration.schema';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Progress.name,
        schema: ProgressSchema,
      },
      {
        name: Registration.name,
        schema: RegistrationSchema,
      },
    ]),
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
