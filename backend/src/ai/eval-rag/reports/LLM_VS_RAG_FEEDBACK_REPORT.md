# LLM vs RAG Feedback Report

Generated: `2026-08-18T17:31:48.352Z`

Regenerate (from `backend/`, needs `GEMINI_API_KEY` or `GROQ_API_KEY`):

```bash
npm run report:llm-vs-rag
```

Compares production modes:
- **LLM** — criteria prompt + provider chain (name recorded per case)
- **RAG-only** — exemplar templates / heuristics (no API)

Primary LLM seen this run: **LLM**

## Summary

| Case | LLM score | RAG score | LLM provider |
| --- | ---: | ---: | --- |
| Behavioral · weak (no STAR) | 1 (fail) | 1 (fail) | fallback (rag-fallback) |
| Behavioral · strong (incident STAR) | 8.3 (pass) | 8.3 (pass) | fallback (rag-fallback) |
| System Design · weak (buzzwords) | 1 (fail) | 1 (fail) | fallback (rag-fallback) |
| System Design · strong (rate limiter) | 7.1 (pass) | 7.1 (pass) | fallback (rag-fallback) |
| Concept · weak (one-liner) | 1 (fail) | 1 (fail) | fallback (rag-fallback) |
| Concept · strong (CAP) | 7.8 (pass) | 7.8 (pass) | fallback (rag-fallback) |

---

## Behavioral · weak (no STAR)

| | |
| --- | --- |
| **Question** | Tell me about a time you disagreed with a teammate |
| **Category** | Behavioral |
| **Difficulty** | easy |

### Answer

> I think communication is important. I always try to be nice and listen to others. Teams work better when people get along.

### Scores

| Mode | Score | Result |
| --- | ---: | --- |
| LLM (fallback (rag-fallback)) | 1 | fail |
| RAG-only | 1 | fail |

### Feedback

#### LLM

Missing a complete STAR structure. Add a concrete Situation, your personal Actions (not only the team’s), and a measurable Result tied to the disagreement. Focus on: Addresses the question directly; Clear Situation (context/background); Defined Task (challenge/goal).

#### RAG-only

Missing a complete STAR structure. Add a concrete Situation, your personal Actions (not only the team’s), and a measurable Result tied to the disagreement. Focus on: Addresses the question directly; Clear Situation (context/background); Defined Task (challenge/goal).

_Exemplars: `star-easy-conflict`, `star-easy-feedback`_

---

## Behavioral · strong (incident STAR)

| | |
| --- | --- |
| **Question** | Tell me about a production incident you helped resolve |
| **Category** | Behavioral |
| **Difficulty** | medium |

### Answer

> Situation: Checkout p95 latency jumped to 4 seconds during a sale. Task: Restore our 500ms SLO and find root cause. Action: I owned the checkout API path, inspected dashboards, traced a hot Redis key stampede, applied a temporary rate limit, and shipped a cache TTL fix while coordinating with the database oncall on pool saturation. Result: p95 returned to 320ms within 25 minutes. We added a postmortem runbook and synthetic checkout alerts. I learned to separate mitigation from root-cause work under pressure.

### Scores

| Mode | Score | Result |
| --- | ---: | --- |
| LLM (fallback (rag-fallback)) | 8.3 | pass |
| RAG-only | 8.3 | pass |

### Feedback

#### LLM

Solid incident STAR: clear severity, personal mitigation steps, and a measurable recovery plus follow-up. Consider stating your decision criteria for rollback vs forward fix.

#### RAG-only

Solid incident STAR: clear severity, personal mitigation steps, and a measurable recovery plus follow-up. Consider stating your decision criteria for rollback vs forward fix.

_Exemplars: `star-medium-incident`, `star-medium-ambiguity`_

---

## System Design · weak (buzzwords)

| | |
| --- | --- |
| **Question** | Design a URL shortening service |
| **Category** | System Design |
| **Difficulty** | easy |

### Answer

> I would use Kafka, Kubernetes, MongoDB, and Redis because they scale.

### Scores

| Mode | Score | Result |
| --- | ---: | --- |
| LLM (fallback (rag-fallback)) | 1 | fail |
| RAG-only | 1 | fail |

### Feedback

#### LLM

Structure the answer as requirements → API → data model → core algorithm → cache/scale → trade-offs. Name components and why they exist. Focus on: Addresses the specific system; Includes essential components (API, DB, cache, etc.); Discusses trade-offs and design decisions.

#### RAG-only

Structure the answer as requirements → API → data model → core algorithm → cache/scale → trade-offs. Name components and why they exist. Focus on: Addresses the specific system; Includes essential components (API, DB, cache, etc.); Discusses trade-offs and design decisions.

_Exemplars: `design-easy-url`, `design-easy-rate-limit`_

---

## System Design · strong (rate limiter)

| | |
| --- | --- |
| **Question** | Design a distributed rate limiter |
| **Category** | System Design |
| **Difficulty** | easy |

### Answer

> First clarify scope: per user, IP, or API key, and whether we need strict global accuracy. I would place a limiter check in the API gateway. Algorithm: token bucket or sliding window implemented in Redis with atomic INCR + TTL or a Lua script so all instances share state. Local in-memory counters are faster but incorrect across nodes. For hot keys, shard by key hash. On limiter outage, decide fail-open vs fail-closed based on abuse risk. Scale reads/writes on Redis and monitor deny rate and latency added by the check.

### Scores

| Mode | Score | Result |
| --- | ---: | --- |
| LLM (fallback (rag-fallback)) | 7.1 | pass |
| RAG-only | 7.1 | pass |

### Feedback

#### LLM

Clear requirements, algorithm choice, shared store, and failure policy. Good distributed thinking.

#### RAG-only

Clear requirements, algorithm choice, shared store, and failure policy. Good distributed thinking.

_Exemplars: `design-easy-rate-limit`, `design-easy-url`_

---

## Concept · weak (one-liner)

| | |
| --- | --- |
| **Question** | Explain how database indexes speed up queries |
| **Category** | Technical Concepts |
| **Difficulty** | easy |

### Answer

> Indexes make databases faster.

### Scores

| Mode | Score | Result |
| --- | ---: | --- |
| LLM (fallback (rag-fallback)) | 1 | fail |
| RAG-only | 1 | fail |

### Feedback

#### LLM

Explain the mechanism (how the index is used), give a concrete example, and cover at least one trade-off. Accuracy without examples scores lower. Focus on: Explains the concept asked; Technically accurate; Covers key points for the topic.

#### RAG-only

Explain the mechanism (how the index is used), give a concrete example, and cover at least one trade-off. Accuracy without examples scores lower. Focus on: Explains the concept asked; Technically accurate; Covers key points for the topic.

_Exemplars: `concept-easy-index`, `concept-easy-http`_

---

## Concept · strong (CAP)

| | |
| --- | --- |
| **Question** | Explain the CAP theorem with a practical example |
| **Category** | Technical Concepts |
| **Difficulty** | medium |

### Answer

> CAP says that during a network partition, a distributed system must choose between consistency and availability. For example, a multi-region shopping cart that rejects writes when regions cannot agree is CP, while a cart that keeps serving possibly stale data is AP. You do not get all three during a partition. PACELC adds that even without partitions, systems trade latency versus consistency. A good interview answer also avoids claiming CA as a permanent mode under partition.

### Scores

| Mode | Score | Result |
| --- | ---: | --- |
| LLM (fallback (rag-fallback)) | 7.8 | pass |
| RAG-only | 7.8 | pass |

### Feedback

#### LLM

Good CAP framing under partition with a concrete example. Mentioning latency trade-offs (PACELC) shows depth.

#### RAG-only

Good CAP framing under partition with a concrete example. Mentioning latency trade-offs (PACELC) shows depth.

_Exemplars: `concept-medium-cap`, `concept-medium-cache`_

---

