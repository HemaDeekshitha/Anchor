import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class InsightsService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async getWeeklyRecap(userId: string) {
    // 1️⃣ Fetch analytics
    const analytics = await this.analyticsService.getAnalytics(userId);

    const { tasksCompleted, tasksTotal, streak, tasksCompletedLastWeek } =
      analytics;

    // 2️⃣ Determine current day (Monday=1, Sunday=7)
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

    // 3️⃣ Calculate weekly progress
    const weekFraction = tasksTotal > 0 ? tasksCompleted / tasksTotal : 0;

    // 4️⃣ Rule-based friendly messages
    let message = '';

    if (dayOfWeek === 1) {
      // Monday
      if (tasksCompleted === 0) {
        message = `The week just started! Last week you had a ${
          streak || 0
        }-day streak. Let's keep that momentum going this week!`;
      } else {
        message = `Great start! You already completed some tasks. Keep up the energy!`;
      }
    } else if (dayOfWeek <= 3) {
      // Tue-Wed (early week)
      if (tasksCompleted === 0) {
        message = `No tasks done yet? No worries — the week is still young. Let's start building momentum together!`;
      } else {
        message = `Fantastic start! You've completed ${tasksCompleted} task${
          tasksCompleted > 1 ? 's' : ''
        } so far. Keep the energy flowing!`;
      }
    } else if (dayOfWeek <= 5) {
      // Thu-Fri (midweek)
      if (weekFraction >= dayOfWeek / 7) {
        message = `You're rocking it so far! Keep this momentum and you'll finish the week stronger than ever. Every task completed counts — let's keep the streak alive!`;
      } else {
        message = `No worries, we still have time! Focus on the remaining tasks and let's build your momentum together. You've got this!`;
      }
    } else {
      // Sat-Sun (weekend)
      if (weekFraction >= 1) {
        message = `Amazing! You've completed all your tasks this week. Take a well-deserved rest!`;
      } else if (weekFraction > 0) {
        message = `Almost weekend! Finish the remaining tasks to end the week strong. You got this!`;
      } else {
        message = `The week was tough, but every new week is a chance to start fresh. Let's aim for a strong streak next week!`;
      }
    }

    return {
      recap: message,
      stats: {
        tasksCompleted,
        tasksTotal,
        streak,
        weekFraction,
      },
    };
  }
}
