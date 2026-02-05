import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingResponse } from './onboarding.entity';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingResponse, User])],
  controllers: [OnboardingController],
  providers: [CloudinaryProvider, CloudinaryService, OnboardingService],
})
export class OnboardingModule {}
