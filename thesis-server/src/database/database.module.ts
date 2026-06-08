import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri =
          config.get<string>('database.uri') ??
          process.env.MONGODB_URI ??
          'mongodb://localhost:27017/thesis-management';
        console.log('🔗 MongoDB URI:', uri);
        return { uri };
      },
    }),
  ],
})
export class DatabaseModule {}
