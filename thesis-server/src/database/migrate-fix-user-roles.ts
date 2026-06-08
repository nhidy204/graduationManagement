import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module';
import { User } from '../modules/users/schemas/user.schema';
import type { Model } from 'mongoose';
import type { UserDocument } from '../modules/users/schemas/user.schema';

/**
 * Migration script to fix users without roles
 * Run with: npm run migrate:fix-roles
 */
async function migrate() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // Get the User model from the dependency injection container
    const UserModel: Model<UserDocument> = app.get(getModelToken(User.name));
    
    if (!UserModel) {
      console.error('❌ Could not get User model');
      await app.close();
      return;
    }

    // Find and update users without role
    const result = await UserModel.updateMany(
      {
        $or: [
          { role: null },
          { role: { $exists: false } }
        ]
      },
      { $set: { role: 'STUDENT' } }
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Matched: ${result.matchedCount} users`);
    console.log(`   - Modified: ${result.modifiedCount} users`);

    if (result.modifiedCount > 0) {
      console.log(`\n✅ Successfully fixed ${result.modifiedCount} users by setting role to STUDENT`);
    } else {
      console.log(`\n✅ No users needed fixing (all have roles)`);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await app.close();
  }
}

void migrate();
