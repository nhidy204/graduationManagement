import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Registration,
  RegistrationSchema,
} from './schemas/registration.schema';
import { Topic, TopicSchema } from '../topics/schemas/topic.schema';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
      { name: Topic.name, schema: TopicSchema },
    ]),
    TopicsModule,
  ],
  providers: [RegistrationsService],
  controllers: [RegistrationsController],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
