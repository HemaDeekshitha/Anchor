# LLM vs RAG Feedback Report

Generated: `2026-08-05T22:39:33.600Z`

Regenerate (from `backend/`, needs `GEMINI_API_KEY` or `GROQ_API_KEY`):

```bash
npm run report:llm-vs-rag
```

Compares production modes:
- **LLM** — criteria prompt + provider chain (name recorded per case)
- **RAG-only** — exemplar templates / heuristics (no API)

Primary LLM seen this run: **gemini-2.5 (gemini-2.5-flash)**

## Summary

| Case | LLM score | RAG score | LLM provider |
| --- | ---: | ---: | --- |
| Behavioral · weak (no STAR) | 2 (fail) | 1 (fail) | groq / llama-3.3-70b-versatile |
| Behavioral · strong (incident STAR) | 7.5 (pass) | 8.3 (pass) | gemini-2.5 / gemini-2.5-flash |
| System Design · weak (buzzwords) | 2.5 (fail) | 1 (fail) | gemini-2.5 / gemini-2.5-flash |
| System Design · strong (rate limiter) | 8.5 (pass) | 7.1 (pass) | groq / llama-3.3-70b-versatile |
| Concept · weak (one-liner) | 0.5 (fail) | 1 (fail) | gemini-2.5 / gemini-2.5-flash |
| Concept · strong (CAP) | 9 (pass) | 7.8 (pass) | gemini-2.5 / gemini-2.5-flash |

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
| LLM (groq / llama-3.3-70b-versatile) | 2 | fail |
| RAG-only | 1 | fail |

### Feedback

#### LLM

The answer does not directly address the question and lacks a clear STAR structure. It provides generic statements about teamwork and communication without sharing a specific experience or story. To improve, the candidate should provide a detailed example of a time they disagreed with a teammate, including the situation, their actions, and the outcome.

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
| LLM (gemini-2.5 / gemini-2.5-flash) | 7.5 | pass |
| RAG-only | 8.3 | pass |

### Feedback

#### LLM

This is a very strong answer in terms of STAR structure and content quality. It clearly addresses the question, providing a concise yet detailed account of the incident. The Situation sets the scene well, the Task is clearly defined, and the Actions are specific, highlighting individual contributions (owning API path, inspecting, tracing, applying, shipping, coordinating) with appropriate technical detail (Redis key stampede, cache TTL fix, pool saturation). The Result is measurable (p95 returned to 320ms within 25 minutes) and includes valuable long-term improvements (runbook, alerts) and a key learning point. The only significant drawback is that the answer falls short of the expected minimum word count of 150 words. While the information is highly concise and impactful, a slightly more elaborated answer would provide even richer context, detail on the decision-making process under pressure, and further insights into the specific challenges encountered and overcome.

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
| LLM (gemini-2.5 / gemini-2.5-flash) | 2.5 | fail |
| RAG-only | 1 | fail |

### Feedback

#### LLM

This design explanation is extremely minimal and lacks the depth expected for even an 'easy' system design task. While it correctly identifies a set of powerful and scalable technologies (Kafka for messaging, Kubernetes for orchestration, MongoDB for data storage, and Redis for caching), it offers no actual design or architectural specifics for a URL shortening service. The sole justification provided, 'because they scale,' is too generic and falls short of a meaningful discussion of trade-offs or design decisions. For instance, it doesn't elaborate on *why* MongoDB was chosen over a relational database, *why* Kafka over another message queue, or *how* Redis would specifically cache URL mappings effectively. Crucially, it fails to outline how these components would interact to fulfill the core functions of a URL shortener, such as generating unique short codes, storing the long URL mappings, handling high-volume redirections, or implementing click analytics. There's no mention of API design, data flow, or error handling. Essentially, it presents a list of tools rather than a coherent system design that addresses the specific requirements of the problem.

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
| LLM (groq / llama-3.3-70b-versatile) | 8.5 | pass |
| RAG-only | 7.1 | pass |

### Feedback

#### LLM

The design effectively addresses the distributed rate limiter system, incorporating essential components such as the API gateway and Redis for state management. It discusses trade-offs, like the choice between token bucket and sliding window algorithms, and considers scalability through sharding and monitoring. The design also shows awareness of potential issues like hot keys and limiter outages, proposing solutions like fail-open or fail-closed strategies based on abuse risk. However, the explanation is concise and could benefit from more detailed architectural thinking and exploration of edge cases.

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
| LLM (gemini-2.5 / gemini-2.5-flash) | 0.5 | fail |
| RAG-only | 1 | fail |

### Feedback

#### LLM

The user's explanation, 'Indexes make databases faster,' is technically accurate in its statement of the outcome. However, it completely fails to address the core prompt: 'Explain *how* database indexes speed up queries.' This response is merely a factual assertion, not an explanation of the mechanism. 

It does not cover any key points of how indexes work, such as their structure (e.g., B-trees), how they avoid full table scans, the concept of sorted data, or the use of pointers to physical rows. There are no examples or analogies provided to aid understanding. While the statement itself is true, it demonstrates no genuine understanding of the underlying technical concept beyond its most superficial benefit. An explanation requires describing the *process* or *methodology*, which is entirely absent here.

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
| LLM (gemini-2.5 / gemini-2.5-flash) | 9 | pass |
| RAG-only | 7.8 | pass |

### Feedback

#### LLM

This explanation of the CAP theorem is exceptionally well-structured and accurate, delivering a comprehensive understanding in a concise manner. It correctly identifies the core premise that during a network partition, a distributed system must prioritize either consistency or availability. The practical example of a multi-region shopping cart effectively illustrates the difference between a CP (consistent-partition tolerant) system that rejects writes to maintain data integrity and an AP (available-partition tolerant) system that continues to serve data, potentially stale, for availability.

Furthermore, the explanation demonstrates a strong grasp of the topic by clarifying the impossibility of achieving all three (Consistency, Availability, and Partition Tolerance) simultaneously during a partition. The inclusion of PACELC, which addresses the trade-off between latency and consistency even without partitions, adds significant depth and context, showing an understanding of related distributed system concepts. The advice to avoid claiming CA (Consistent-Available) as a permanent mode under partition is a crucial nuance that highlights a sophisticated understanding of common misconceptions, making this an excellent answer, especially for an interview setting. It clearly shows genuine understanding and not just regurgitated information, making it highly effective.

#### RAG-only

Good CAP framing under partition with a concrete example. Mentioning latency trade-offs (PACELC) shows depth.

_Exemplars: `concept-medium-cap`, `concept-medium-cache`_

---

