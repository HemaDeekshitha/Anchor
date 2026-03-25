// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, MoreThan } from 'typeorm';
// import { OnboardingResponse } from '../onboarding/onboarding.entity';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import * as dotenv from 'dotenv';
// import { Task } from './tasks.entity';
// dotenv.config();

// @Injectable()
// export class DashboardService {
//   private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

//   constructor(
//     @InjectRepository(OnboardingResponse)
//     private onboardingRepo: Repository<OnboardingResponse>,
//     @InjectRepository(Task)
//     private taskRepo: Repository<Task>,
//   ) {}

//   async getDashboardData(userId: string) {
//     const today = new Date().toISOString().slice(0, 10);

//     // 1. Fetch the latest onboarding data FIRST
//     let onboarding = await this.onboardingRepo.findOne({
//       where: { userId },
//       order: { createdAt: 'DESC' },
//     });

//     if (!onboarding) {
//       console.log(
//         `⚠️ No onboarding found for ${userId}. Using default fallback.`,
//       );
//       onboarding = {
//         primaryFocus: ['Job Search'],
//         preferredRole: ['Software Engineer'],
//         currentStatus: ['Open to opportunities'],
//         areasOfInterest: ['Full Stack Development', 'AI'],
//         createdAt: new Date(), // Important for the timestamp check
//         userId: userId,
//       } as any; // Cast as any to bypass strict Entity checks for this fallback
//     }

//     // 2. Fetch existing AI tasks for today
//     let smartPlanTasks = await this.taskRepo.find({
//       where: {
//         user_id: userId,
//         is_ai_generated: true,
//         task_date: today,
//       },
//     });

//     // 3. DETERMINE IF REGENERATION IS NEEDED
//     let shouldGenerate = false;

//     if (smartPlanTasks.length === 0) {
//       // Case A: No plan exists for today yet
//       shouldGenerate = true;
//     } else {
//       // Case B: Plan exists, but let's check if onboarding is NEWER than the plan
//       // Assuming your Task entity has a 'created_at' or 'createdAt' field
//       const planCreatedAt = smartPlanTasks[0].created_at;
//       const onboardingCreatedAt = onboarding?.createdAt;

//       // If onboarding was created AFTER the current plan, the plan is stale.
//       if (onboardingCreatedAt && onboardingCreatedAt > planCreatedAt) {
//         console.log('New onboarding data detected. Regenerating plan...');
//         shouldGenerate = true;

//         // Delete the old/stale tasks so we don't have duplicates
//         await this.taskRepo.remove(smartPlanTasks);
//         smartPlanTasks = []; // Clear array for the next step
//       }
//     }

//     // 4. GENERATE NEW CONTENT IF NEEDED
//     if (shouldGenerate) {
//       const prompt = this.generatePromptFromOnboarding(onboarding!);

//       const model = this.genAI.getGenerativeModel({
//         model: 'models/gemini-1.5-pro',
//       });

//       const result = await model.generateContent([{ text: prompt }]);
//       const rawText = result.response.text();

//       const cleanedText: string = rawText
//         .replace(/^```json/, '')
//         .replace(/^```/, '')
//         .replace(/```$/, '')
//         .trim();

//       try {
//         const tasks = JSON.parse(cleanedText);

//         smartPlanTasks = await this.taskRepo.save(
//           tasks.map((t: any) =>
//             this.taskRepo.create({
//               user_id: userId,
//               title: t.title,
//               status: 'pending',
//               is_ai_generated: true,
//               task_date: today,
//             }),
//           ),
//         );
//       } catch (err) {
//         console.error('Failed to parse Gemini response:', rawText);
//         throw new Error('Invalid Gemini response format');
//       }
//     }

//     // 5. Fetch Pending tasks (Backlog)
//     // (Existing logic remains the same)
//     const pendingTasks = await this.taskRepo.find({
//       where: {
//         user_id: userId,
//         is_ai_generated: false,
//         status: 'pending',
//         task_date: MoreThan(today),
//       },
//     });

//     return {
//       tasks: [...smartPlanTasks, ...pendingTasks],
//     };
//   }
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DashboardService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

  constructor(
    @InjectRepository(OnboardingResponse)
    private onboardingRepo: Repository<OnboardingResponse>,
  ) {}

  async getDashboardData(userId: string) {
    const onboarding = await this.onboardingRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' }, // Get latest
    });

    if (!onboarding) throw new Error('No onboarding data found.');

    const prompt = this.generatePromptFromOnboarding(onboarding);

    const model = this.genAI.getGenerativeModel({
      model: 'models/gemini-2.0-flash',
    });

    const result = await model.generateContent([{ text: prompt }]);
    const rawText = result.response.text();
    console.log('🧠 Gemini raw response:', rawText);

    const cleanedText: string = rawText
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();
    console.log('🧼 Cleaned Gemini JSON:', cleanedText);

    try {
      const tasks = JSON.parse(cleanedText);

      return {
        tasks: tasks.map((t: any, i: number) => ({
          id: i + 1,
          title: t.title,
          status: 'pending',
          is_ai_generated: true,
        })),
      };
    } catch (err) {
      console.error('Failed to parse Gemini response:', rawText);
      throw new Error('Invalid Gemini response format');
    }
  }

  private generatePromptFromOnboarding(onboarding: OnboardingResponse): string {
    return `

You're an AI career productivity assistant. Your job is to generate a **personalized daily to-do list** to help the user make tangible progress toward landing a job and growing professionally.

---

🎯 TASK GOALS:
Tasks should help the user:

- Apply to relevant jobs across platforms (LinkedIn, Wellfound, company sites)
- Refine resume, cover letters, LinkedIn, and GitHub profile
- Build or polish portfolio projects (landing pages, dashboards, mobile apps, etc.)
- Practice Leetcode, DSA, system design, or real-world technical problems
- Prepare for behavioral interviews using STAR format
- Develop communication or storytelling skills (e.g., record elevator pitch)
- Explore relevant tech blogs, newsletters, or podcasts
- Learn new concepts in CS, AI, frontend/backend dev, etc. (light stretch tasks)
- Audit and update their online presence (e.g., LinkedIn headline, GitHub READMEs)
- Network with recruiters or peers (e.g., send 1 follow-up message)
- Review previous applications or interview notes
- Manage time and energy through reflection, journaling, or planning
- Contribute to open source or community projects
- Document achievements or metrics from past work
- Stay accountable through small check-ins (e.g., "review yesterday’s progress")

Tasks should not only push the user toward a job offer, but also support long-term career clarity, confidence, and skill visibility.

---

📌 SMART TASK RULES:

1. **Task Variety (no restrictions)**:
   - You're not limited to a fixed list — you can invent new tasks relevant to the user's context (e.g., "Update LinkedIn headline", "Create GitHub README for project X", "Record elevator pitch", "Join 1 Discord job community", etc.)

2. **Vary task count (3–5 per day)**:
   - If user completed 3+ hard tasks yesterday → today = 2–3 easier tasks
   - If yesterday was incomplete or light → today = 4–5 focused tasks

3. **Avoid repetition**:
   - Do not repeat yesterday’s task types or similar content
   - Make each day feel fresh and adaptive

4. **Shuffle task types & order**:
   - Don’t follow the same pattern (like always starting with Leetcode)
   - Mix creative, technical, and outreach tasks naturally

5. **Each task must**:
   - Start with an action verb
   - Be 1 clear sentence (not too vague or generic)
   - Be realistic to complete within a day
   - Be directly helpful to job-seeking and skill-building

---
Example of how tasks should be:
   -Job Applications: "Apply to 3 SDE 1 roles via LinkedIn and Wellfound"
   - 🧠 Leetcode / DSA: "Solve 1 Medium problem — Trees or Sliding Window"
   - 📄 Resume / Portfolio: "Add your Gemini AI integration to resume bullets"
   - 💬 Behavioral Prep: "Write STAR story for 'dealing with conflict'"
   - 🖥️ System Design: "Sketch high-level design for a chat app"
   - ✍️ Pitch / Cover Letter: "Write a short pitch paragraph for Apple iOS role"
   - 🧘 Learning or Light Task: "Read 1 blog post on system design patterns"

👤 USER PROFILE:

- Primary Focus: ${onboarding.primaryFocus?.join(', ') || 'N/A'}
- Preferred Roles: ${onboarding.preferredRole?.join(', ') || 'N/A'}
- Current Status: ${onboarding.currentStatus?.join(', ') || 'N/A'}
- Areas of Interest: ${onboarding.areasOfInterest?.join(', ') || 'N/A'}


---

📤 Respond **ONLY** with a raw JSON array (no markdown, no explanation):

[
  { "title": "Update your resume summary to highlight React and Gemini AI experience", "is_ai_generated": true },
  { "title": "Apply to 2 iOS developer roles on LinkedIn", "is_ai_generated": true },
  { "title": "Solve 1 DSA problem involving backtracking", "is_ai_generated": true }
]
`;
  }
}
