# Anchor Next-Phase Plan: Reliable Sessions and Interview Learning Tracks

## 1. Outcome

The next phase should deliver two things together:

1. A session experience that never turns an expired token into a blank application-error page.
2. A curriculum-based Smart Plan with 1-month, 3-month, and 6-month tracks that adapts from answer quality, not merely task completion.

The product promise should be **high-confidence interview readiness for the user's chosen role**. Avoid promising that every user will pass every interview; interview outcomes also depend on experience, communication, company-specific material, and hiring conditions.

---

## 2. What the repository currently does

### Sessions

- Access tokens expire after 15 minutes.
- Refresh tokens normally expire after 7 days.
- Next.js middleware attempts a refresh only when a protected route is navigated to.
- Browser API requests do not share a central 401/refresh/retry handler.
- Profile and dashboard pages parse responses without first checking `response.ok`.
- The Google login refresh token is signed differently from the token expected by the refresh verifier.
- There is no application-level error boundary or useful session-expired state.

This means an already-open page can make API calls after its access token expires, receive a 401 JSON payload, and pass the wrong data shape into the UI. The screenshot is consistent with that class of failure, although production browser logs are required to identify the exact exception.

### Smart Plan

- A daily plan contains four questions.
- Difficulty is selected from the previous seven days' completion rate.
- Generated questions use the target role, resume text/keywords, interests, and previously seen titles.
- Software roles get one LeetCode task plus a rotating mix of technical, system-design, behavioral, and learning questions.
- Approved answers mark tasks complete; rejected answers remain incomplete.

The useful personalization foundation is already present. The main gap is that daily questions are generated independently, without a persistent curriculum, topic prerequisites, mastery state, or a track completion target.

---

## 3. Workstream A: Session reliability and inactivity UX

### 3.1 Separate two concepts

Do not treat access-token expiration and user inactivity as the same event.

- **Access-token expiration** is an internal security mechanism. If the user is active and the refresh session is valid, refresh silently and continue.
- **Inactivity timeout** is a product/security decision. Only this should open the “Stay signed in?” dialog.

Recommended default:

- 30 minutes without meaningful activity: show warning.
- 2-minute warning countdown.
- “Stay signed in”: call the refresh/session endpoint, reset inactivity, and preserve the current page/draft.
- “Log out” or countdown reaches zero: call logout, clear session cookies, clear sensitive client state, and redirect to `/login?reason=inactive`.

Meaningful activity includes pointer, keyboard, touch, scroll, visibility return, navigation, and answer editing. Throttle activity writes to at most once every 15–30 seconds. Synchronize `lastActivityAt` and logout across browser tabs using `BroadcastChannel` or the `storage` event.

### 3.2 Fix the authentication foundation first

1. Make all login methods use one token-issuing function and the same access/refresh secrets and lifetimes.
2. Add refresh-token identifiers (`jti`) and server-side session records so logout and compromised sessions can be revoked.
3. Rotate refresh tokens on refresh; reject reuse of an already-rotated token.
4. Add `GET /auth/session` for a small authenticated session status response.
5. Keep cookie attributes and deletion attributes identical. Verify production domain, `Secure`, `HttpOnly`, and `SameSite` behavior.
6. Rate-limit login and refresh endpoints and avoid logging tokens.

### 3.3 Centralize frontend API behavior

Create one `apiFetch` client and migrate every authenticated request to it:

1. Send the original request with credentials.
2. On the first 401, acquire a single shared refresh lock so simultaneous calls do not create a refresh storm.
3. Call `POST /auth/refresh` once.
4. If refresh succeeds, retry the original request once.
5. If refresh fails, publish a session-ended event and redirect cleanly to login.
6. Never retry a second time; return a typed error.

Every screen must check HTTP status and validate the response shape before rendering it. A 401/500 payload must not be stored as a profile, activity array, or Smart Plan.

### 3.4 Prevent blank crash pages

- Add route-level `error.tsx` files for protected areas and a root error boundary.
- Show a recoverable screen with “Try again” and “Sign in again.”
- Add production error reporting with release/environment tags, route, request correlation ID, and sanitized stack trace.
- Add structured backend logs for refresh success/failure reasons without storing credentials.
- Autosave an in-progress answer locally or server-side so a refresh/logout does not silently destroy work. Remove the draft after successful submission.

### 3.5 Session acceptance criteria

- An active user can remain on the same page beyond 15 minutes and subsequent API calls succeed.
- Ten simultaneous API calls after access-token expiry cause exactly one refresh call and all original calls resolve or fail consistently.
- At 30 idle minutes, the warning dialog appears with a visible countdown.
- Choosing “Stay signed in” preserves the route, modal, and answer draft.
- Choosing “Log out,” allowing the countdown to expire, revoking the refresh session, or reaching the absolute session lifetime always returns to login without a React crash.
- Login/logout in one tab is reflected in all other tabs.
- Password, Google, and signup sessions all pass the same refresh tests.
- A malformed or unauthorized API response renders an error state, never the framework's client-side exception page.

---

## 4. Workstream B: Curriculum-based learning tracks

### 4.1 Enrollment and diagnostic

Before creating a track, collect or confirm:

- Target role and optional target companies/interview date.
- Experience level and current employment status.
- Resume projects, tools, and demonstrated skills.
- Weekly availability and preferred days.
- Interview formats expected for that role.
- A short diagnostic across the role's core competencies.

The user selects 1, 3, or 6 months. Show weekly workload, scope, and expected outcome before confirmation. Allow plan changes, but recalculate milestones rather than deleting history.

### 4.2 Role blueprint: the source of truth

Do not ask an LLM to invent the whole curriculum each day. Create a versioned, reviewed **role blueprint** for each supported career:

- Competencies and subtopics.
- Prerequisites and recommended order.
- Interview importance weight.
- Expected depth by experience level.
- Question formats: knowledge, applied scenario, problem-solving, project deep-dive, behavioral, case study, and mock interview.
- Rubric dimensions and reference-answer points.
- Company/industry tags where appropriate.

Start with a small number of roles and make them excellent. A generic “all careers” generator will produce uneven coverage and makes “completion” impossible to define.

### 4.3 Question bank quality

Store canonical questions in a reviewed question bank. Each question needs:

- Role, competency, topic, difficulty, format, estimated time, and prerequisite tags.
- Importance tier: must-know, frequently asked, useful depth, or specialist.
- A scoring rubric with required concepts and common misconceptions.
- One or more acceptable-answer outlines, not a single brittle reference answer.
- Follow-up questions and hints.
- Source/reviewer/version metadata.
- Exposure and outcome metrics.

Use AI to personalize wording, create resume-specific follow-ups, and evaluate responses against the rubric. Do not let it silently create unverified facts, fake LeetCode URLs, or alter curriculum coverage.

### 4.4 Track definitions

Assume five learning days per week and a default of four items per day. Let users choose a lighter 3-item or intensive 5-item daily load without changing the competency requirements.

#### 1-month track — Interview Essentials

Goal: fastest credible route to near-term interview readiness.

- Duration: 4 weeks, about 20 learning days.
- Scope: must-know and highest-frequency topics only.
- Daily mix: 2 core high-priority questions, 1 weak-area/review question, 1 behavioral or resume/project question.
- Week 1: diagnostic remediation and core foundations.
- Week 2: role-specific applied questions and problem-solving.
- Week 3: advanced high-frequency questions, resume defense, and targeted company patterns.
- Week 4: mixed timed practice, two mock interviews, and final gap repair.
- Graduation: every must-know competency at target mastery and two mocks meeting the readiness threshold.

This should be a defined set of essential outcomes, not simply 30 days of unrelated generated questions.

#### 3-month track — Structured Interview Preparation

Goal: teach the important topics, build applied skill, and create durable interview performance.

- Duration: 12 weeks, about 60 learning days.
- Phase 1, weeks 1–4: foundations and prerequisite topics.
- Phase 2, weeks 5–8: applied scenarios, cross-topic questions, projects, and deeper role skills.
- Phase 3, weeks 9–10: advanced and company-style interview patterns.
- Phase 4, weeks 11–12: timed sets, mock interviews, behavioral stories, and gap closure.
- Weekly rhythm: learn, apply, review, mixed interview set, then checkpoint/reflection.
- Graduation: all must-know and frequently asked competencies at target mastery, plus three passing mocks across different formats.

#### 6-month track — Comprehensive Role Mastery

Goal: broad, deep coverage of the supported role blueprint, including specialist options.

- Duration: 24 weeks, about 120 learning days.
- Phase 1, weeks 1–6: foundations and communication fundamentals.
- Phase 2, weeks 7–12: full core-domain coverage.
- Phase 3, weeks 13–17: advanced topics, trade-offs, and complex scenarios.
- Phase 4, weeks 18–20: selected specialization and portfolio/resume project defense.
- Phase 5, weeks 21–22: cross-topic integration and company-style rounds.
- Phase 6, weeks 23–24: interview simulation loop and final remediation.
- Graduation: required blueprint coverage, retained mastery after spaced reviews, and four passing mocks including a full-loop simulation.

“All questions” should mean all required competencies and question archetypes in the versioned blueprint—not every possible wording an interviewer could use.

---

## 5. Adaptive engine

### 5.1 Keep streak separate from mastery

- **Streak:** consecutive days with the required learning activity; used for motivation and rewards.
- **Mastery:** evidence that the user can answer correctly, specifically, and without excessive help; used for difficulty and scheduling.

A streak must never directly raise question difficulty. A strong answer can raise mastery even if the user missed yesterday; a weak answer must trigger remediation even during a long streak.

### 5.2 Per-topic mastery state

Maintain, per user and topic:

- Mastery score from 0–100.
- Number of independent attempts.
- Recent answer scores and rubric dimensions.
- Hint usage and retry count.
- Last practiced time and next review time.
- Confidence/uncertainty based on the amount of evidence.

Recommended initial mastery update:

- 40% correctness/rubric coverage.
- 20% reasoning and application.
- 15% specificity and use of evidence/examples.
- 15% communication/structure.
- 10% retention on later review.

Use role-specific rubric weights: for example, behavioral responses emphasize STAR evidence, coding emphasizes correctness/complexity/testing, and system design emphasizes requirements, trade-offs, reliability, and communication.

### 5.3 Difficulty progression

- Score below 50: give concise feedback, a prerequisite explanation, then an easier related question within 1–2 days.
- Score 50–69: stay at the same level with a different scenario.
- Score 70–84: schedule spaced review and occasionally advance.
- Score 85+ twice without heavy hints: advance difficulty or move to an integrative question.
- After repeated failure, diagnose the prerequisite gap; do not endlessly rephrase the same question.
- After mastery, revisit at expanding intervals such as 2, 7, 21, and 45 days, constrained by the selected track length.

### 5.4 Daily selection algorithm

Build each day from eligible curriculum items, then rank them using:

- Track importance and approaching milestone.
- Mastery gap and prerequisite readiness.
- Due spaced-review items.
- Recent failures or stale knowledge.
- Coverage balance and format variety.
- User availability and estimated time.
- Repetition penalty for recently seen archetypes.

Suggested four-item day:

1. One high-priority new concept.
2. One applied question on a current concept.
3. One due review or failed-topic remediation.
4. One behavioral, resume/project, or timed mixed question.

If a user misses a day, reflow unfinished required work across the remaining track. Do not create an ever-growing “previous pending tasks” pile.

---

## 6. Data and API changes

### Core tables

- `learning_tracks`: user, duration, role blueprint version, start/target dates, workload, status.
- `role_blueprints`: role, level, version, publication state.
- `competencies` and `topics`: hierarchy, prerequisites, importance, target mastery.
- `question_bank`: canonical prompt, format, difficulty, rubric, answer outline, review metadata.
- `track_curriculum_items`: which topics/archetypes belong to each track phase and milestone.
- `user_topic_mastery`: mastery, evidence count, last/next review, confidence.
- `plan_items`: scheduled date, source question, personalized variant, reason selected, status.
- `answer_attempts`: immutable attempt history, rubric scores, hints, evaluator version.
- `mock_interviews`: format, sections, result, competency breakdown.
- `auth_sessions`: refresh-token family, revocation, last activity, absolute expiry.

Retain `user_daily_tasks` during migration, but add track/topic/question references or replace it behind a versioned API.

### APIs

- `GET /learning-tracks/options`
- `POST /learning-tracks/diagnostic`
- `POST /learning-tracks`
- `GET /learning-tracks/current`
- `PATCH /learning-tracks/current` for workload or duration changes
- `GET /learning-tracks/current/today`
- `GET /learning-tracks/current/roadmap`
- `POST /plan-items/:id/attempts`
- `POST /plan-items/:id/hint`
- `GET /learning-tracks/current/mastery`
- `POST /mock-interviews`

Responses should include `selectionReason` (for example, “due review” or “must-know gap”) so the plan feels intentional rather than random.

---

## 7. Delivery sequence

### Phase 0 — Observe and reproduce (2–3 days)

- Capture the production client stack trace and failed network responses for the screenshot scenario.
- Test password, signup, and Google sessions at and beyond 15 minutes.
- Add temporary sanitized logging/correlation IDs if the current evidence is insufficient.

Exit: exact crash signature identified and covered by a failing test.

### Phase 1 — Session hardening (1 sprint)

- Unify token issuing, fix Google refresh behavior, add central `apiFetch`, add refresh locking, and validate response shapes.
- Add inactivity dialog, tab synchronization, clean logout, draft preservation, and error boundaries.
- Add integration and browser tests for expiry, inactivity, and revoked sessions.

Exit: all session acceptance criteria in section 3.5 pass.

### Phase 2 — Curriculum foundation (1–2 sprints)

- Select the first 2–3 target roles using current user demand.
- Build reviewed role blueprints, rubrics, and the initial high-quality question bank.
- Add track enrollment, diagnostic, roadmap, milestones, and data model.
- Backfill existing users into a default track without deleting history.

Exit: a user can enroll and see a complete, deterministic roadmap with coverage targets.

### Phase 3 — Mastery adaptation (1–2 sprints)

- Store rubric-level attempt evidence and per-topic mastery.
- Replace completion-rate difficulty with mastery-based scheduling and spaced repetition.
- Add remediation, hints, schedule reflow, and selection explanations.

Exit: controlled test histories produce the expected easier, same-level, harder, and review selections.

### Phase 4 — Mock interviews and quality loop (1 sprint, then ongoing)

- Add track-specific timed sets and mock interview formats.
- Add reviewer tools, question versioning, evaluator calibration, and question-performance analytics.
- Expand to additional roles only when content quality gates pass.

Exit: graduation is calculated from blueprint coverage, retained mastery, and mock performance—not days elapsed.

---

## 8. Success metrics and guardrails

### Reliability

- Client-side crash-free sessions.
- Refresh success/failure rate by login method.
- Forced re-login rate and draft recovery rate.
- Inactivity warning actions: stay, explicit logout, countdown logout.

### Learning quality

- Diagnostic-to-mastery gain by competency.
- First-attempt and later-retention scores.
- Remediation recovery rate.
- Weekly plan adherence without backlog growth.
- Mock interview readiness trend.
- Question report rate, evaluator disagreement rate, and duplicate/near-duplicate rate.

### Guardrails

- Do not claim guaranteed employment or guaranteed interview success.
- Do not use streak length as evidence of knowledge.
- Do not publish unsupported role curricula as “comprehensive.”
- Do not allow AI-generated evaluation to be the only quality signal; calibrate against human-reviewed examples.
- Give users access to their answer history, evaluation rationale, plan controls, and account/session controls.

---

## 9. Recommended first release scope

Ship the session fix before expanding Smart Plan behavior. For the learning release, launch one-month and three-month tracks for the strongest existing role blueprint first, while keeping the six-month track behind a content-completeness gate. This produces a trustworthy experience sooner and prevents a long track from exposing curriculum gaps that daily generation cannot reliably hide.
