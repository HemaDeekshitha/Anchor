import { Injectable } from '@nestjs/common';
import { ONBOARDING_STEPS } from './onboarding.data';

@Injectable()
export class OnboardingService {
  getSteps() {
    return {
      steps: ONBOARDING_STEPS,
    };
  }
  saveAnswers(file: Express.Multer.File | undefined, answers: string) {
    console.log('\n📥 Onboarding submission received');
    console.log('--------------------------------');

    if (file) {
      console.log('📎 Resume file received:');
      console.log('Name:', file.originalname);
      console.log('Size:', file.size);
      console.log('Type:', file.mimetype);
    } else {
      console.log('No resume file uploaded');
    }

    if (answers) {
      console.log('📝 Onboarding answers:');
      console.log(JSON.parse(answers));
    }

    console.log('--------------------------------\n');

    return {
      success: true,
      message: 'Onboarding data received',
    };
  }
}
