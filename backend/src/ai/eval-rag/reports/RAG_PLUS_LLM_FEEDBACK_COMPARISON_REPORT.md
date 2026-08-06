# Test: RAG+LLM Feedback Comparison Report

Generated: `2026-08-05T22:26:10.970Z` · Provider: `openrouter` · Corpus: 33 exemplars

> Research / prompt-tuning report only. Production uses **LLM-first** with **RAG-only** fallback when all providers fail or JSON parse fails.

Modes compared:

| Mode | What it does |
| --- | --- |
| **LLM-only** | Original criteria prompt → LLM feedback |
| **RAG + LLM** | Slim task header + retrieved exemplar rubric → LLM feedback (no duplicated criteria list) |
| **RAG-only** | Retrieved exemplars + heuristics → template feedback (no LLM) |

## Summary

| Case | LLM-only | RAG + LLM | RAG-only |
| --- | ---: | ---: | ---: |
| [Behavioral · weak (no STAR)](#behavioral-weak) | 2 (fail) · 650ms · ~275 tok | 2 (fail) · 412ms · ~587 tok | 1 (fail) · 1ms · 0 tok |
| [Behavioral · strong (incident STAR)](#behavioral-strong) | 9 (pass) · 435ms · ~377 tok | 9 (pass) · 479ms · ~649 tok | 8.3 (pass) · 0ms · 0 tok |
| [System Design · weak (buzzwords)](#design-weak) | 2 (fail) · 593ms · ~210 tok | 2 (fail) · 598ms · ~491 tok | 1 (fail) · 3ms · 0 tok |
| [System Design · strong (rate limiter)](#design-strong) | 8.5 (pass) · 1291ms · ~325 tok | 8.5 (pass) · 699ms · ~571 tok | 7.1 (pass) · 0ms · 0 tok |
| [Concept · weak (one-liner)](#concept-weak) | 2 (fail) · 514ms · ~206 tok | 2 (fail) · 526ms · ~481 tok | 1 (fail) · 0ms · 0 tok |
| [Concept · strong (CAP)](#concept-strong) | 8.2 (pass) · 510ms · ~321 tok | 8 (pass) · 643ms · ~584 tok | 7.8 (pass) · 1ms · 0 tok |

### Averages

| Mode | Avg score | Avg latency | Avg prompt tokens |
| --- | ---: | ---: | ---: |
| LLM-only | 5.28 | 666ms | 286 |
| RAG + LLM | 5.25 | 560ms | 561 |
| RAG-only | 4.37 | 1ms | 0 |

---

## Behavioral · weak (no STAR)

<a id="behavioral-weak"></a>

| | |
| --- | --- |
| **Question** | Tell me about a time you disagreed with a teammate |
| **Category** | Behavioral |
| **Difficulty** | easy |
| **Expected band** | weak |

### User answer

> I think communication is important. I always try to be nice and listen to others. Teams work better when people get along.

### Scoreboard

| Mode | Score | Result | Latency | Prompt tokens |
| --- | ---: | --- | ---: | ---: |
| LLM-only | 2 | fail | 650ms | ~275 |
| RAG + LLM | 2 | fail | 412ms | ~587 |
| RAG-only | 1 | fail | 1ms | 0 |

### Feedback

#### 1. LLM-only

The answer does not directly address the question and lacks a clear STAR structure. It provides generic statements about teamwork and communication without sharing a specific experience or example. To improve, the candidate should provide a detailed story about a time they disagreed with a teammate, including the situation, their actions, and the outcome.

#### 2. RAG + LLM

Missing a complete STAR structure. Add a concrete Situation, your personal Actions (not only the team’s), and a measurable Result tied to the disagreement. The answer lacks Specific and detailed information, and does not show self-awareness and learning.

#### 3. RAG-only (no LLM)

Missing a complete STAR structure. Add a concrete Situation, your personal Actions (not only the team’s), and a measurable Result tied to the disagreement. Focus on: Addresses the question directly; Clear Situation (context/background); Defined Task (challenge/goal).

_Retrieved exemplars: `star-easy-conflict`, `star-easy-feedback`_

### Prompts

<details>
<summary>LLM-only prompt (~275 tokens) — click to expand</summary>

```
Evaluate this behavioral interview answer.

TASK DETAILS:
Title: "Tell me about a time you disagreed with a teammate"
Category: Behavioral
Difficulty: easy
Tags: conflict, team

EXPECTED FORMAT: STAR (Situation, Task, Action, Result)

USER'S ANSWER:
"I think communication is important. I always try to be nice and listen to others. Teams work better when people get along."

EVALUATION CRITERIA:
1. Does the answer directly address the question: "Tell me about a time you disagreed with a teammate"?
2. Has clear Situation (context/background)
3. Has defined Task (challenge/goal)
4. Has specific Action (what they actually did)
5. Has measurable Result (outcome/learning)
6. Is specific and detailed (not generic)
7. Shows self-awareness and learning

Minimum 150 words expected.

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "score": 8.5,
  "hasSituation": true,
  "hasTask": true,
  "hasAction": true,
  "hasResult": true,
  "isSpecific": true,
  "wordCount": 250,
  "feedback": "Strong answer with clear STAR structure.",
  "approved": true,
  "confidence": 0.92
}
```

</details>

<details>
<summary>RAG + LLM prompt (~587 tokens) — click to expand</summary>

```
Evaluate this behavioral interview answer (STAR expected).

Title: "Tell me about a time you disagreed with a teammate"
Category: Behavioral
Difficulty: easy
Tags: conflict, team

USER'S ANSWER:
"I think communication is important. I always try to be nice and listen to others. Teams work better when people get along."

GRADE USING THESE RETRIEVED EXEMPLARS (they replace a separate criteria list):
- Score and write feedback from the rubric below.
- Grade ONLY the user's answer; do not invent that they said exemplar content.
- Cite missing rubric items by name when feedback is corrective.
EXEMPLAR 1 [star-easy-conflict] (easy) — Tell me about a time you disagreed with a teammate and how you resolved it.
Rubric (score + feedback against these):
  1. Addresses the question directly
  2. Clear Situation (context/background)
  3. Defined Task (challenge/goal)
  4. Specific Action (what they personally did)
  5. Measurable Result (outcome/learning)
  6. Specific and detailed (not generic)
  7. Shows self-awareness and learning
Strong shape: Situation: On a sprint, a teammate wanted to ship a feature without integration tests. Task: I needed to protect release quality without blocking delivery. Action: I proposed a 1-day spike to add two critical path tests and deferred non-critical coverage. I demoed a past production bug that tests would have caught. Result: We shipped one day later with zero regressions; the team adopted the critical-path test rule. I…
Weak signals:
  - No Situation or jumps straight to advice
  - Uses “we” only — no personal Action
  - Vague Result (“it went well”) with no metric
  - Generic soft-skills language with no story
Feedback style:
- strong → Strong STAR answer: situation and personal actions are concrete, and the result includes a measurable outcome. Next step: briefly name one alternate approach you considered.
- weak → Missing a complete STAR structure. Add a concrete Situation, your personal Actions (not only the team’s), and a measurable Result tied to the disagreement.

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "score": 8.5,
  "hasSituation": true,
  "hasTask": true,
  "hasAction": true,
  "hasResult": true,
  "isSpecific": true,
  "wordCount": 250,
  "feedback": "Strong answer with clear STAR structure.",
  "approved": true,
  "confidence": 0.92
}
```

</details>

<details>
<summary>RAG-only — no LLM prompt</summary>

RAG-only does not call an LLM. It retrieves exemplars (`star-easy-conflict`, `star-easy-feedback`) and emits template feedback from rubric anchors + lexical heuristics.

</details>

---

## Behavioral · strong (incident STAR)

<a id="behavioral-strong"></a>

| | |
| --- | --- |
| **Question** | Tell me about a production incident you helped resolve |
| **Category** | Behavioral |
| **Difficulty** | medium |
| **Expected band** | strong |

### User answer

> Situation: Checkout p95 latency jumped to 4 seconds during a sale. Task: Restore our 500ms SLO and find root cause. Action: I owned the checkout API path, inspected dashboards, traced a hot Redis key stampede, applied a temporary rate limit, and shipped a cache TTL fix while coordinating with the database oncall on pool saturation. Result: p95 returned to 320ms within 25 minutes. We added a postmortem runbook and synthetic checkout alerts. I learned to separate mitigation from root-cause work under pressure.

### Scoreboard

| Mode | Score | Result | Latency | Prompt tokens |
| --- | ---: | --- | ---: | ---: |
| LLM-only | 9 | pass | 435ms | ~377 |
| RAG + LLM | 9 | pass | 479ms | ~649 |
| RAG-only | 8.3 | pass | 0ms | 0 |

### Feedback

#### 1. LLM-only

Excellent answer with clear STAR structure, specific details, and measurable results. The candidate demonstrates self-awareness and learning from the experience.

#### 2. RAG + LLM

Solid incident STAR: clear severity, personal mitigation steps, and a measurable recovery plus follow-up. The answer demonstrates self-awareness and learning from the incident.

#### 3. RAG-only (no LLM)

Solid incident STAR: clear severity, personal mitigation steps, and a measurable recovery plus follow-up. Consider stating your decision criteria for rollback vs forward fix.

_Retrieved exemplars: `star-medium-incident`, `star-medium-ambiguity`_

### Prompts

<details>
<summary>LLM-only prompt (~377 tokens) — click to expand</summary>

```
Evaluate this behavioral interview answer.

TASK DETAILS:
Title: "Tell me about a production incident you helped resolve"
Category: Behavioral
Difficulty: medium
Tags: incident, production

EXPECTED FORMAT: STAR (Situation, Task, Action, Result)

USER'S ANSWER:
"Situation: Checkout p95 latency jumped to 4 seconds during a sale. Task: Restore our 500ms SLO and find root cause. Action: I owned the checkout API path, inspected dashboards, traced a hot Redis key stampede, applied a temporary rate limit, and shipped a cache TTL fix while coordinating with the database oncall on pool saturation. Result: p95 returned to 320ms within 25 minutes. We added a postmortem runbook and synthetic checkout alerts. I learned to separate mitigation from root-cause work under pressure."

EVALUATION CRITERIA:
1. Does the answer directly address the question: "Tell me about a production incident you helped resolve"?
2. Has clear Situation (context/background)
3. Has defined Task (challenge/goal)
4. Has specific Action (what they actually did)
5. Has measurable Result (outcome/learning)
6. Is specific and detailed (not generic)
7. Shows self-awareness and learning

Minimum 150 words expected.

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "score": 8.5,
  "hasSituation": true,
  "hasTask": true,
  "hasAction": true,
  "hasResult": true,
  "isSpecific": true,
  "wordCount": 250,
  "feedback": "Strong answer with clear STAR structure.",
  "approved": true,
  "confidence": 0.92
}
```

</details>

<details>
<summary>RAG + LLM prompt (~649 tokens) — click to expand</summary>

```
Evaluate this behavioral interview answer (STAR expected).

Title: "Tell me about a production incident you helped resolve"
Category: Behavioral
Difficulty: medium
Tags: incident, production

USER'S ANSWER:
"Situation: Checkout p95 latency jumped to 4 seconds during a sale. Task: Restore our 500ms SLO and find root cause. Action: I owned the checkout API path, inspected dashboards, traced a hot Redis key stampede, applied a temporary rate limit, and shipped a cache TTL fix while coordinating with the database oncall on pool saturation. Result: p95 returned to 320ms within 25 minutes. We added a postmortem runbook and synthetic checkout alerts. I learned to separate mitigation from root-cause work under pressure."

GRADE USING THESE RETRIEVED EXEMPLARS (they replace a separate criteria list):
- Score and write feedback from the rubric below.
- Grade ONLY the user's answer; do not invent that they said exemplar content.
- Cite missing rubric items by name when feedback is corrective.
EXEMPLAR 1 [star-medium-incident] (medium) — Tell me about a production incident you helped resolve.
Rubric (score + feedback against these):
  1. Addresses the question directly
  2. Clear Situation
  3. Defined Task
  4. Specific Action
  5. Measurable Result
  6. Specific and detailed
  7. Shows self-awareness and learning
Strong shape: Situation: Checkout latency spiked to p95 4s during a sale. Task: Restore checkout SLO (<500ms) and find root cause. Action: I owned the API path: checked dashboards, traced a hot Redis key, rate-limited the stampede, and rolled forward a cache TTL fix. I coordinated with the DB oncall on connection pool saturation. Result: p95 returned to 320ms in 25 minutes; postmortem added cache stampede runbook and synthetic che…
Weak signals:
  - No personal ownership — only “the team fixed it”
  - No timeline, severity, or metrics
  - Skips what changed afterward
Feedback style:
- strong → Solid incident STAR: clear severity, personal mitigation steps, and a measurable recovery plus follow-up. Consider stating your decision criteria for rollback vs forward fix.
- weak → Incident answers need severity context, your concrete Actions during mitigation, and a measurable Result (latency/error recovery). Add what changed after the postmortem.

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "score": 8.5,
  "hasSituation": true,
  "hasTask": true,
  "hasAction": true,
  "hasResult": true,
  "isSpecific": true,
  "wordCount": 250,
  "feedback": "Strong answer with clear STAR structure.",
  "approved": true,
  "confidence": 0.92
}
```

</details>

<details>
<summary>RAG-only — no LLM prompt</summary>

RAG-only does not call an LLM. It retrieves exemplars (`star-medium-incident`, `star-medium-ambiguity`) and emits template feedback from rubric anchors + lexical heuristics.

</details>

---

## System Design · weak (buzzwords)

<a id="design-weak"></a>

| | |
| --- | --- |
| **Question** | Design a URL shortening service |
| **Category** | System Design |
| **Difficulty** | easy |
| **Expected band** | weak |

### User answer

> I would use Kafka, Kubernetes, MongoDB, and Redis because they scale.

### Scoreboard

| Mode | Score | Result | Latency | Prompt tokens |
| --- | ---: | --- | ---: | ---: |
| LLM-only | 2 | fail | 593ms | ~210 |
| RAG + LLM | 2 | fail | 598ms | ~491 |
| RAG-only | 1 | fail | 3ms | 0 |

### Feedback

#### 1. LLM-only

The design lacks essential components and does not address the specific system mentioned. It only mentions a few technologies without explaining how they would be used in the URL shortening service. There is no discussion of trade-offs, design decisions, or architectural thinking. The mention of scalability is vague and does not provide any concrete details on how the system would be designed to scale.

#### 2. RAG + LLM

The answer lacks essential details such as API, data model, and trade-offs. It only names technologies without explaining their roles or how they interact. To improve, structure the answer as requirements → API → data model → core algorithm → cache/scale → trade-offs, and provide a clear explanation for each component.

#### 3. RAG-only (no LLM)

Structure the answer as requirements → API → data model → core algorithm → cache/scale → trade-offs. Name components and why they exist. Focus on: Addresses the specific system; Includes essential components (API, DB, cache, etc.); Discusses trade-offs and design decisions.

_Retrieved exemplars: `design-easy-url`, `design-easy-rate-limit`_

### Prompts

<details>
<summary>LLM-only prompt (~210 tokens) — click to expand</summary>

```
Evaluate this system design explanation.

TASK DETAILS:
Title: "Design a URL shortening service"
Category: System Design
Difficulty: easy

USER'S DESIGN:
"I would use Kafka, Kubernetes, MongoDB, and Redis because they scale."

EVALUATION CRITERIA:
1. Does it address the specific system mentioned in "Design a URL shortening service"?
2. Includes essential components (database, API, cache, etc.)?
3. Discusses trade-offs and design decisions?
4. Considers scalability and performance?
5. Shows architectural thinking?

Minimum 150 words expected.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": 8.0,
  "hasComponents": true,
  "discussesTradeoffs": true,
  "considersScalability": true,
  "wordCount": 220,
  "feedback": "Solid system design with good component breakdown.",
  "approved": true,
  "confidence": 0.85
}
```

</details>

<details>
<summary>RAG + LLM prompt (~491 tokens) — click to expand</summary>

```
Evaluate this system design explanation.

Title: "Design a URL shortening service"
Category: System Design
Difficulty: easy

USER'S DESIGN:
"I would use Kafka, Kubernetes, MongoDB, and Redis because they scale."

GRADE USING THESE RETRIEVED EXEMPLARS (they replace a separate criteria list):
- Score and write feedback from the rubric below.
- Grade ONLY the user's answer; do not invent that they said exemplar content.
- Cite missing rubric items by name when feedback is corrective.
EXEMPLAR 1 [design-easy-url] (easy) — Design a URL shortening service.
Rubric (score + feedback against these):
  1. Addresses the specific system
  2. Includes essential components (API, DB, cache, etc.)
  3. Discusses trade-offs and design decisions
  4. Considers scalability and performance
  5. Shows architectural thinking
Strong shape: Clarify read/write ratio and custom aliases. API: POST /shorten, GET /{code} 302. Data model: code → long URL + created_at. Code generation: base62 counter or hash+collision retry. Cache hot redirects in Redis. Trade-offs: hash simplicity vs counter predictability; cache TTL vs consistency. Scale reads with cache + read replicas; writes are lower volume. Mention analytics as async side path.
Weak signals:
  - Only names tech (“use Kafka + Mongo”) with no flow
  - No API or data model
  - No trade-offs
Feedback style:
- strong → Good design skeleton: requirements, API, data model, code strategy, caching, and scale notes. Add failure handling for collisions and cache misses.
- weak → Structure the answer as requirements → API → data model → core algorithm → cache/scale → trade-offs. Name components and why they exist.

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "score": 8.0,
  "hasComponents": true,
  "discussesTradeoffs": true,
  "considersScalability": true,
  "wordCount": 220,
  "feedback": "Solid system design with good component breakdown.",
  "approved": true,
  "confidence": 0.85
}
```

</details>

<details>
<summary>RAG-only — no LLM prompt</summary>

RAG-only does not call an LLM. It retrieves exemplars (`design-easy-url`, `design-easy-rate-limit`) and emits template feedback from rubric anchors + lexical heuristics.

</details>

---

## System Design · strong (rate limiter)

<a id="design-strong"></a>

| | |
| --- | --- |
| **Question** | Design a distributed rate limiter |
| **Category** | System Design |
| **Difficulty** | easy |
| **Expected band** | strong |

### User answer

> First clarify scope: per user, IP, or API key, and whether we need strict global accuracy. I would place a limiter check in the API gateway. Algorithm: token bucket or sliding window implemented in Redis with atomic INCR + TTL or a Lua script so all instances share state. Local in-memory counters are faster but incorrect across nodes. For hot keys, shard by key hash. On limiter outage, decide fail-open vs fail-closed based on abuse risk. Scale reads/writes on Redis and monitor deny rate and latency added by the check.

### Scoreboard

| Mode | Score | Result | Latency | Prompt tokens |
| --- | ---: | --- | ---: | ---: |
| LLM-only | 8.5 | pass | 1291ms | ~325 |
| RAG + LLM | 8.5 | pass | 699ms | ~571 |
| RAG-only | 7.1 | pass | 0ms | 0 |

### Feedback

#### 1. LLM-only

The design effectively addresses the distributed rate limiter system, incorporating essential components such as the API gateway and Redis for state management. It discusses trade-offs, like the choice between token bucket and sliding window algorithms, and considers scalability and performance through sharding and monitoring. The design also shows architectural thinking by considering the implications of limiter outage and deciding between fail-open and fail-closed approaches based on abuse risk. However, the explanation is concise and could benefit from more detailed elaboration on some points, such as the specific advantages of using Redis with atomic operations and Lua scripts, and how the system would handle extreme traffic conditions or Redis failures.

#### 2. RAG + LLM

The design effectively addresses the distributed rate limiter system, including clarifying scope, choosing a suitable algorithm, and discussing trade-offs. It also considers scalability and shows good architectural thinking. However, it could be improved by providing more details on the deployment path and failure modes, such as 'Multi-instance inconsistency' and a more detailed 'Failure mode' discussion as mentioned in the rubric.

#### 3. RAG-only (no LLM)

Clear requirements, algorithm choice, shared store, and failure policy. Good distributed thinking.

_Retrieved exemplars: `design-easy-rate-limit`, `design-easy-url`_

### Prompts

<details>
<summary>LLM-only prompt (~325 tokens) — click to expand</summary>

```
Evaluate this system design explanation.

TASK DETAILS:
Title: "Design a distributed rate limiter"
Category: System Design
Difficulty: easy

USER'S DESIGN:
"First clarify scope: per user, IP, or API key, and whether we need strict global accuracy. I would place a limiter check in the API gateway. Algorithm: token bucket or sliding window implemented in Redis with atomic INCR + TTL or a Lua script so all instances share state. Local in-memory counters are faster but incorrect across nodes. For hot keys, shard by key hash. On limiter outage, decide fail-open vs fail-closed based on abuse risk. Scale reads/writes on Redis and monitor deny rate and latency added by the check."

EVALUATION CRITERIA:
1. Does it address the specific system mentioned in "Design a distributed rate limiter"?
2. Includes essential components (database, API, cache, etc.)?
3. Discusses trade-offs and design decisions?
4. Considers scalability and performance?
5. Shows architectural thinking?

Minimum 150 words expected.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": 8.0,
  "hasComponents": true,
  "discussesTradeoffs": true,
  "considersScalability": true,
  "wordCount": 220,
  "feedback": "Solid system design with good component breakdown.",
  "approved": true,
  "confidence": 0.85
}
```

</details>

<details>
<summary>RAG + LLM prompt (~571 tokens) — click to expand</summary>

```
Evaluate this system design explanation.

Title: "Design a distributed rate limiter"
Category: System Design
Difficulty: easy

USER'S DESIGN:
"First clarify scope: per user, IP, or API key, and whether we need strict global accuracy. I would place a limiter check in the API gateway. Algorithm: token bucket or sliding window implemented in Redis with atomic INCR + TTL or a Lua script so all instances share state. Local in-memory counters are faster but incorrect across nodes. For hot keys, shard by key hash. On limiter outage, decide fail-open vs fail-closed based on abuse risk. Scale reads/writes on Redis and monitor deny rate and latency added by the check."

GRADE USING THESE RETRIEVED EXEMPLARS (they replace a separate criteria list):
- Score and write feedback from the rubric below.
- Grade ONLY the user's answer; do not invent that they said exemplar content.
- Cite missing rubric items by name when feedback is corrective.
EXEMPLAR 1 [design-easy-rate-limit] (easy) — Design a distributed rate limiter.
Rubric (score + feedback against these):
  1. Addresses the specific system
  2. Includes essential components
  3. Discusses trade-offs
  4. Considers scalability
  5. Shows architectural thinking
Strong shape: Clarify scope (user/IP/API key) and consistency needs. Prefer token bucket / sliding window in Redis with atomic INCR+TTL or Lua. Gateway middleware calls limiter before business logic. Trade-offs: local in-memory is fast but inaccurate across nodes; Redis is shared but adds latency. Discuss hot keys and fail-open vs fail-closed under limiter outage.
Weak signals:
  - Describes only an algorithm with no deployment path
  - Ignores multi-instance inconsistency
  - No failure mode
Feedback style:
- strong → Clear requirements, algorithm choice, shared store, and failure policy. Good distributed thinking.
- weak → State enforcement scope, choose an algorithm + shared store, and discuss multi-node correctness and limiter outage behavior.

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "score": 8.0,
  "hasComponents": true,
  "discussesTradeoffs": true,
  "considersScalability": true,
  "wordCount": 220,
  "feedback": "Solid system design with good component breakdown.",
  "approved": true,
  "confidence": 0.85
}
```

</details>

<details>
<summary>RAG-only — no LLM prompt</summary>

RAG-only does not call an LLM. It retrieves exemplars (`design-easy-rate-limit`, `design-easy-url`) and emits template feedback from rubric anchors + lexical heuristics.

</details>

---

## Concept · weak (one-liner)

<a id="concept-weak"></a>

| | |
| --- | --- |
| **Question** | Explain how database indexes speed up queries |
| **Category** | Technical Concepts |
| **Difficulty** | easy |
| **Expected band** | weak |

### User answer

> Indexes make databases faster.

### Scoreboard

| Mode | Score | Result | Latency | Prompt tokens |
| --- | ---: | --- | ---: | ---: |
| LLM-only | 2 | fail | 514ms | ~206 |
| RAG + LLM | 2 | fail | 526ms | ~481 |
| RAG-only | 1 | fail | 0ms | 0 |

### Feedback

#### 1. LLM-only

The explanation is too brief and lacks technical details. It does not cover how database indexes speed up queries, and it does not provide any examples or analogies to support the claim. A more comprehensive explanation is needed to demonstrate a genuine understanding of the concept.

#### 2. RAG + LLM

The explanation lacks a clear mechanism of how database indexes speed up queries, does not provide any examples, and ignores trade-offs such as write and storage costs. To improve, explain the mechanism, give a concrete example, and cover at least one trade-off.

#### 3. RAG-only (no LLM)

Explain the mechanism (how the index is used), give a concrete example, and cover at least one trade-off. Accuracy without examples scores lower. Focus on: Explains the concept asked; Technically accurate; Covers key points for the topic.

_Retrieved exemplars: `concept-easy-index`, `concept-easy-http`_

### Prompts

<details>
<summary>LLM-only prompt (~206 tokens) — click to expand</summary>

```
Evaluate this technical concept explanation.

TASK DETAILS:
Title: "Explain how database indexes speed up queries"
Category: Technical Concepts
Difficulty: easy

USER'S EXPLANATION:
"Indexes make databases faster."

EVALUATION CRITERIA:
1. Does it explain the concept asked in "Explain how database indexes speed up queries"?
2. Is technically accurate?
3. Covers all key points for this topic?
4. Uses examples or analogies?
5. Shows genuine understanding (not copy-pasted from documentation)?

Minimum 100 words expected.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": 7.5,
  "isAccurate": true,
  "coversKeyPoints": true,
  "hasExamples": true,
  "showsUnderstanding": true,
  "wordCount": 180,
  "feedback": "Good explanation covering the key concepts.",
  "approved": true,
  "confidence": 0.88
}
```

</details>

<details>
<summary>RAG + LLM prompt (~481 tokens) — click to expand</summary>

```
Evaluate this technical concept explanation.

Title: "Explain how database indexes speed up queries"
Category: Technical Concepts
Difficulty: easy

USER'S EXPLANATION:
"Indexes make databases faster."

GRADE USING THESE RETRIEVED EXEMPLARS (they replace a separate criteria list):
- Score and write feedback from the rubric below.
- Grade ONLY the user's answer; do not invent that they said exemplar content.
- Cite missing rubric items by name when feedback is corrective.
EXEMPLAR 1 [concept-easy-index] (easy) — Explain how database indexes speed up queries.
Rubric (score + feedback against these):
  1. Explains the concept asked
  2. Technically accurate
  3. Covers key points for the topic
  4. Uses examples or analogies
  5. Shows genuine understanding
Strong shape: An index is a separate data structure (often a B-tree) that maps column values to row locations so the engine can avoid full table scans. Example: WHERE email = X with an email index does a tree lookup instead of reading every row. Trade-off: faster reads, slower writes and extra storage. A good answer also notes when indexes do not help (low selectivity, wrong columns, functions on the column).
Weak signals:
  - Says “indexes make queries faster” with no mechanism
  - No example query
  - Ignores write/storage cost
Feedback style:
- strong → Accurate concept answer with mechanism, example, and trade-off. Consider mentioning selectivity or composite indexes for depth.
- weak → Explain the mechanism (how the index is used), give a concrete example, and cover at least one trade-off. Accuracy without examples scores lower.

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "score": 7.5,
  "isAccurate": true,
  "coversKeyPoints": true,
  "hasExamples": true,
  "showsUnderstanding": true,
  "wordCount": 180,
  "feedback": "Good explanation covering the key concepts.",
  "approved": true,
  "confidence": 0.88
}
```

</details>

<details>
<summary>RAG-only — no LLM prompt</summary>

RAG-only does not call an LLM. It retrieves exemplars (`concept-easy-index`, `concept-easy-http`) and emits template feedback from rubric anchors + lexical heuristics.

</details>

---

## Concept · strong (CAP)

<a id="concept-strong"></a>

| | |
| --- | --- |
| **Question** | Explain the CAP theorem with a practical example |
| **Category** | Technical Concepts |
| **Difficulty** | medium |
| **Expected band** | strong |

### User answer

> CAP says that during a network partition, a distributed system must choose between consistency and availability. For example, a multi-region shopping cart that rejects writes when regions cannot agree is CP, while a cart that keeps serving possibly stale data is AP. You do not get all three during a partition. PACELC adds that even without partitions, systems trade latency versus consistency. A good interview answer also avoids claiming CA as a permanent mode under partition.

### Scoreboard

| Mode | Score | Result | Latency | Prompt tokens |
| --- | ---: | --- | ---: | ---: |
| LLM-only | 8.2 | pass | 510ms | ~321 |
| RAG + LLM | 8 | pass | 643ms | ~584 |
| RAG-only | 7.8 | pass | 1ms | 0 |

### Feedback

#### 1. LLM-only

The explanation effectively covers the CAP theorem, providing a practical example and mentioning PACELC for additional context. It demonstrates a clear understanding of the trade-offs between consistency and availability during a network partition.

#### 2. RAG + LLM

The explanation effectively covers the CAP theorem with a practical example, correctly framing the trade-off between consistency and availability during a network partition, and also mentions the PACELC extension regarding latency versus consistency trade-offs.

#### 3. RAG-only (no LLM)

Good CAP framing under partition with a concrete example. Mentioning latency trade-offs (PACELC) shows depth.

_Retrieved exemplars: `concept-medium-cap`, `concept-medium-cache`_

### Prompts

<details>
<summary>LLM-only prompt (~321 tokens) — click to expand</summary>

```
Evaluate this technical concept explanation.

TASK DETAILS:
Title: "Explain the CAP theorem with a practical example"
Category: Technical Concepts
Difficulty: medium

USER'S EXPLANATION:
"CAP says that during a network partition, a distributed system must choose between consistency and availability. For example, a multi-region shopping cart that rejects writes when regions cannot agree is CP, while a cart that keeps serving possibly stale data is AP. You do not get all three during a partition. PACELC adds that even without partitions, systems trade latency versus consistency. A good interview answer also avoids claiming CA as a permanent mode under partition."

EVALUATION CRITERIA:
1. Does it explain the concept asked in "Explain the CAP theorem with a practical example"?
2. Is technically accurate?
3. Covers all key points for this topic?
4. Uses examples or analogies?
5. Shows genuine understanding (not copy-pasted from documentation)?

Minimum 100 words expected.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": 7.5,
  "isAccurate": true,
  "coversKeyPoints": true,
  "hasExamples": true,
  "showsUnderstanding": true,
  "wordCount": 180,
  "feedback": "Good explanation covering the key concepts.",
  "approved": true,
  "confidence": 0.88
}
```

</details>

<details>
<summary>RAG + LLM prompt (~584 tokens) — click to expand</summary>

```
Evaluate this technical concept explanation.

Title: "Explain the CAP theorem with a practical example"
Category: Technical Concepts
Difficulty: medium

USER'S EXPLANATION:
"CAP says that during a network partition, a distributed system must choose between consistency and availability. For example, a multi-region shopping cart that rejects writes when regions cannot agree is CP, while a cart that keeps serving possibly stale data is AP. You do not get all three during a partition. PACELC adds that even without partitions, systems trade latency versus consistency. A good interview answer also avoids claiming CA as a permanent mode under partition."

GRADE USING THESE RETRIEVED EXEMPLARS (they replace a separate criteria list):
- Score and write feedback from the rubric below.
- Grade ONLY the user's answer; do not invent that they said exemplar content.
- Cite missing rubric items by name when feedback is corrective.
EXEMPLAR 1 [concept-medium-cap] (medium) — Explain the CAP theorem with a practical example.
Rubric (score + feedback against these):
  1. Explains the concept asked
  2. Technically accurate
  3. Covers key points
  4. Uses examples or analogies
  5. Shows genuine understanding
Strong shape: CAP says that under a network partition a distributed system must choose consistency or availability. Example: a multi-region cart service that rejects writes on partition (CP) vs serving stale carts (AP). PACELC adds that even without partition you trade latency vs consistency. A strong answer avoids the myth that “CA” is a permanent operating mode under partition.
Weak signals:
  - Memorizes C/A/P letters without partition framing
  - Claims you can have all three during partition
  - No concrete system example
Feedback style:
- strong → Good CAP framing under partition with a concrete example. Mentioning latency trade-offs (PACELC) shows depth.
- weak → Reframe around partition behavior, pick a CP vs AP example, and correct any claim that all three are maintained during a partition.

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "score": 7.5,
  "isAccurate": true,
  "coversKeyPoints": true,
  "hasExamples": true,
  "showsUnderstanding": true,
  "wordCount": 180,
  "feedback": "Good explanation covering the key concepts.",
  "approved": true,
  "confidence": 0.88
}
```

</details>

<details>
<summary>RAG-only — no LLM prompt</summary>

RAG-only does not call an LLM. It retrieves exemplars (`concept-medium-cap`, `concept-medium-cache`) and emits template feedback from rubric anchors + lexical heuristics.

</details>

---

_Regenerate with `npm run report:rag-plus-llm`._
