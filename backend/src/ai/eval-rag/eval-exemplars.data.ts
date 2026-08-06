import { EvalExemplar } from './eval-exemplar.types';

/**
 * Grounding corpus for RAG evaluation.
 * Rubric checklists are aligned with GeminiService prompt criteria.
 */
export const EVAL_EXEMPLARS: EvalExemplar[] = [
  // ─── STAR / Behavioral ─────────────────────────────────────────────────────
  {
    id: 'star-easy-conflict',
    evalType: 'star',
    difficulty: 'easy',
    topics: ['conflict', 'disagreement', 'team', 'communication', 'behavioral'],
    questionPattern:
      'Tell me about a time you disagreed with a teammate and how you resolved it.',
    rubricChecklist: [
      'Addresses the question directly',
      'Clear Situation (context/background)',
      'Defined Task (challenge/goal)',
      'Specific Action (what they personally did)',
      'Measurable Result (outcome/learning)',
      'Specific and detailed (not generic)',
      'Shows self-awareness and learning',
    ],
    strongExemplar:
      'Situation: On a sprint, a teammate wanted to ship a feature without integration tests. Task: I needed to protect release quality without blocking delivery. Action: I proposed a 1-day spike to add two critical path tests and deferred non-critical coverage. I demoed a past production bug that tests would have caught. Result: We shipped one day later with zero regressions; the team adopted the critical-path test rule. I learned to frame quality debates around concrete risk, not preference.',
    weakSignals: [
      'No Situation or jumps straight to advice',
      'Uses “we” only — no personal Action',
      'Vague Result (“it went well”) with no metric',
      'Generic soft-skills language with no story',
    ],
    feedbackAnchors: {
      strong:
        'Strong STAR answer: situation and personal actions are concrete, and the result includes a measurable outcome. Next step: briefly name one alternate approach you considered.',
      weak:
        'Missing a complete STAR structure. Add a concrete Situation, your personal Actions (not only the team’s), and a measurable Result tied to the disagreement.',
    },
  },
  {
    id: 'star-easy-feedback',
    evalType: 'star',
    difficulty: 'easy',
    topics: ['feedback', 'growth', 'mentorship', 'learning', 'behavioral'],
    questionPattern:
      'Tell me about a time you received difficult technical feedback.',
    rubricChecklist: [
      'Addresses the question directly',
      'Clear Situation',
      'Defined Task',
      'Specific Action',
      'Measurable Result',
      'Specific and detailed',
      'Shows self-awareness and learning',
    ],
    strongExemplar:
      'Situation: After a design review, a senior engineer said my API ignored idempotency. Task: Fix the design before implementation. Action: I researched idempotency keys, rewrote the write path, and brought a revised sequence diagram to office hours. Result: The redesign was approved; later we avoided duplicate charges in a failed-retry incident. I now checklist idempotency on every write API.',
    weakSignals: [
      'Defensive tone without learning',
      'No concrete change made after feedback',
      'Result is only “I felt better”',
    ],
    feedbackAnchors: {
      strong:
        'Good STAR story with clear personal action and a concrete learning loop. Strengthen the Result with one before/after reliability metric if available.',
      weak:
        'The answer acknowledges feedback but lacks specific Actions you took and a measurable Result. Rebuild with Situation → Task → your Actions → outcome.',
    },
  },
  {
    id: 'star-medium-incident',
    evalType: 'star',
    difficulty: 'medium',
    topics: [
      'incident',
      'production',
      'outage',
      'debugging',
      'oncall',
      'behavioral',
    ],
    questionPattern:
      'Tell me about a production incident you helped resolve.',
    rubricChecklist: [
      'Addresses the question directly',
      'Clear Situation',
      'Defined Task',
      'Specific Action',
      'Measurable Result',
      'Specific and detailed',
      'Shows self-awareness and learning',
    ],
    strongExemplar:
      'Situation: Checkout latency spiked to p95 4s during a sale. Task: Restore checkout SLO (<500ms) and find root cause. Action: I owned the API path: checked dashboards, traced a hot Redis key, rate-limited the stampede, and rolled forward a cache TTL fix. I coordinated with the DB oncall on connection pool saturation. Result: p95 returned to 320ms in 25 minutes; postmortem added cache stampede runbook and synthetic checkout alerts. I learned to separate mitigation from root-cause analysis under pressure.',
    weakSignals: [
      'No personal ownership — only “the team fixed it”',
      'No timeline, severity, or metrics',
      'Skips what changed afterward',
    ],
    feedbackAnchors: {
      strong:
        'Solid incident STAR: clear severity, personal mitigation steps, and a measurable recovery plus follow-up. Consider stating your decision criteria for rollback vs forward fix.',
      weak:
        'Incident answers need severity context, your concrete Actions during mitigation, and a measurable Result (latency/error recovery). Add what changed after the postmortem.',
    },
  },
  {
    id: 'star-medium-ambiguity',
    evalType: 'star',
    difficulty: 'medium',
    topics: [
      'ambiguous',
      'requirements',
      'stakeholders',
      'scope',
      'behavioral',
    ],
    questionPattern:
      'Tell me about a time requirements were ambiguous.',
    rubricChecklist: [
      'Addresses the question directly',
      'Clear Situation',
      'Defined Task',
      'Specific Action',
      'Measurable Result',
      'Specific and detailed',
      'Shows self-awareness and learning',
    ],
    strongExemplar:
      'Situation: Product asked for “better search” with no success metric. Task: Clarify scope before a 3-week commitment. Action: I drafted 5 clarifying questions, proposed two KPI options (CTR vs time-to-first-result), and ran a 30-minute stakeholder workshop with sample queries. Result: We agreed on time-to-first-result <200ms for top queries; delivered on time and improved that KPI by 35%. Ambiguity is now a checklist item in my kickoff template.',
    weakSignals: [
      'Says they “asked questions” without naming them',
      'No alignment outcome',
      'No metric for success',
    ],
    feedbackAnchors: {
      strong:
        'Strong ambiguity story: you show how clarification changed scope and cite a KPI result. Optionally note one wrong assumption you corrected.',
      weak:
        'Clarify Situation and list the specific questions or trade-offs you surfaced. End with a measurable Result that proves alignment prevented rework.',
    },
  },
  {
    id: 'star-hard-leadership',
    evalType: 'star',
    difficulty: 'hard',
    topics: [
      'leadership',
      'influence',
      'without authority',
      'priority',
      'conflict',
      'behavioral',
    ],
    questionPattern:
      'Tell me about a time you influenced a decision without formal authority.',
    rubricChecklist: [
      'Addresses the question directly',
      'Clear Situation',
      'Defined Task',
      'Specific Action',
      'Measurable Result',
      'Specific and detailed',
      'Shows self-awareness and learning',
    ],
    strongExemplar:
      'Situation: Two teams disputed whether to rewrite a billing service before a compliance deadline. Task: Align on a path that met the date without a risky rewrite. Action: I built a one-pager with risk matrix, effort estimates, and a strangler-fig migration option; facilitated a decision meeting with engineering + compliance; proposed incremental extraction of the audit path only. Result: Leadership chose the incremental plan; we hit the deadline and reduced rewrite risk. I learned to lead with shared constraints and written options, not opinions.',
    weakSignals: [
      'Claims influence without evidence of changed decision',
      'No trade-off analysis',
      'Result is interpersonal only, no business outcome',
    ],
    feedbackAnchors: {
      strong:
        'Excellent senior-level STAR: evidence-based influence, clear trade-offs, and a business Result. Mention how you handled dissent explicitly.',
      weak:
        'For hard behavioral prompts, show the decision landscape, your influence tactics with evidence, and a business-measurable Result — not only that people “agreed.”',
    },
  },
  {
    id: 'star-hard-quality-vs-speed',
    evalType: 'star',
    difficulty: 'hard',
    topics: [
      'quality',
      'speed',
      'trade-off',
      'technical debt',
      'deadline',
      'behavioral',
    ],
    questionPattern:
      'Tell me about a conflict between delivery speed and engineering quality.',
    rubricChecklist: [
      'Addresses the question directly',
      'Clear Situation',
      'Defined Task',
      'Specific Action',
      'Measurable Result',
      'Specific and detailed',
      'Shows self-awareness and learning',
    ],
    strongExemplar:
      'Situation: Sales promised a partner integration in two weeks; the clean design needed five. Task: Deliver a safe MVP without locking in irreversible debt. Action: I proposed a temporary adapter with explicit kill criteria, feature flag, and a tracked debt ticket with owner/date. I refused to skip authz checks. Result: We launched in 12 days; adapter removed in 3 weeks; zero auth incidents. I now document “accepted risk” vs “non-negotiable safeguards” in kickoffs.',
    weakSignals: [
      'Presents false binary with no safeguards',
      'No personal decision ownership',
      'No follow-up on debt',
    ],
    feedbackAnchors: {
      strong:
        'Strong trade-off STAR: you name risks accepted, safeguards required, and a cleanup Result. Good self-awareness on non-negotiables.',
      weak:
        'Spell out which quality risks you accepted vs refused, your Actions to contain debt, and a measurable Result after launch.',
    },
  },

  // ─── Technical Concepts ────────────────────────────────────────────────────
  {
    id: 'concept-easy-index',
    evalType: 'concept',
    difficulty: 'easy',
    topics: ['index', 'database', 'query', 'b-tree', 'sql'],
    questionPattern: 'Explain how database indexes speed up queries.',
    rubricChecklist: [
      'Explains the concept asked',
      'Technically accurate',
      'Covers key points for the topic',
      'Uses examples or analogies',
      'Shows genuine understanding',
    ],
    strongExemplar:
      'An index is a separate data structure (often a B-tree) that maps column values to row locations so the engine can avoid full table scans. Example: WHERE email = X with an email index does a tree lookup instead of reading every row. Trade-off: faster reads, slower writes and extra storage. A good answer also notes when indexes do not help (low selectivity, wrong columns, functions on the column).',
    weakSignals: [
      'Says “indexes make queries faster” with no mechanism',
      'No example query',
      'Ignores write/storage cost',
    ],
    feedbackAnchors: {
      strong:
        'Accurate concept answer with mechanism, example, and trade-off. Consider mentioning selectivity or composite indexes for depth.',
      weak:
        'Explain the mechanism (how the index is used), give a concrete example, and cover at least one trade-off. Accuracy without examples scores lower.',
    },
  },
  {
    id: 'concept-easy-http',
    evalType: 'concept',
    difficulty: 'easy',
    topics: ['http', 'rest', 'status', 'api', 'get', 'post'],
    questionPattern: 'Explain idempotency in HTTP APIs.',
    rubricChecklist: [
      'Explains the concept asked',
      'Technically accurate',
      'Covers key points',
      'Uses examples or analogies',
      'Shows genuine understanding',
    ],
    strongExemplar:
      'Idempotency means repeating the same request leaves the server in the same state as doing it once. GET/PUT/DELETE are typically idempotent; POST is not unless you add an idempotency key. Example: retrying “create payment” with the same key returns the original payment instead of charging twice. Clients need this under timeouts and network retries.',
    weakSignals: [
      'Confuses idempotency with safety or purity',
      'No retry/timeout motivation',
      'Wrong claims about POST always being idempotent',
    ],
    feedbackAnchors: {
      strong:
        'Clear definition, method examples, and a retry scenario. Nice practical understanding.',
      weak:
        'Define idempotency precisely, contrast methods, and give a retry example. Avoid conflating it with “safe” methods.',
    },
  },
  {
    id: 'concept-medium-cap',
    evalType: 'concept',
    difficulty: 'medium',
    topics: ['cap', 'consistency', 'availability', 'partition', 'distributed'],
    questionPattern: 'Explain the CAP theorem with a practical example.',
    rubricChecklist: [
      'Explains the concept asked',
      'Technically accurate',
      'Covers key points',
      'Uses examples or analogies',
      'Shows genuine understanding',
    ],
    strongExemplar:
      'CAP says that under a network partition a distributed system must choose consistency or availability. Example: a multi-region cart service that rejects writes on partition (CP) vs serving stale carts (AP). PACELC adds that even without partition you trade latency vs consistency. A strong answer avoids the myth that “CA” is a permanent operating mode under partition.',
    weakSignals: [
      'Memorizes C/A/P letters without partition framing',
      'Claims you can have all three during partition',
      'No concrete system example',
    ],
    feedbackAnchors: {
      strong:
        'Good CAP framing under partition with a concrete example. Mentioning latency trade-offs (PACELC) shows depth.',
      weak:
        'Reframe around partition behavior, pick a CP vs AP example, and correct any claim that all three are maintained during a partition.',
    },
  },
  {
    id: 'concept-medium-cache',
    evalType: 'concept',
    difficulty: 'medium',
    topics: ['cache', 'redis', 'ttl', 'stampede', 'invalidation'],
    questionPattern: 'How would you decide what to cache and how to invalidate it?',
    rubricChecklist: [
      'Explains the concept asked',
      'Technically accurate',
      'Covers key points',
      'Uses examples or analogies',
      'Shows genuine understanding',
    ],
    strongExemplar:
      'Cache read-heavy, expensive, or slow-changing data with a clear key design. Choose TTL vs event invalidation based on staleness tolerance. Example: product pages with 60s TTL plus delete-on-update; protect stampedes with singleflight/locks. Measure hit rate and origin load before/after. Avoid caching user-specific secrets without careful keying.',
    weakSignals: [
      'Only says “use Redis”',
      'No invalidation strategy',
      'Ignores stampede / thundering herd',
    ],
    feedbackAnchors: {
      strong:
        'Covers what/why to cache, invalidation, and failure modes like stampede. Strong practical understanding.',
      weak:
        'Go beyond naming Redis: justify cache candidates, key/TTL/invalidation choices, and at least one failure mode (stampede or stale reads).',
    },
  },
  {
    id: 'concept-hard-consensus',
    evalType: 'concept',
    difficulty: 'hard',
    topics: ['raft', 'consensus', 'quorum', 'leader', 'replication'],
    questionPattern: 'Explain Raft consensus and when you would use it.',
    rubricChecklist: [
      'Explains the concept asked',
      'Technically accurate',
      'Covers key points',
      'Uses examples or analogies',
      'Shows genuine understanding',
    ],
    strongExemplar:
      'Raft elects a leader, replicates a log, and commits when a majority acknowledges an entry — providing strongly consistent replicated state. Use it for control planes/metadata (etcd/Consul), not as a general app DB. Trade-offs: availability depends on majority; cross-region latency hurts. A strong answer contrasts with eventual replication and notes split votes/term mechanics at a high level.',
    weakSignals: [
      'Confuses Raft with 2PC or gossip',
      'No majority/commit explanation',
      'Suggests Raft for all data storage',
    ],
    feedbackAnchors: {
      strong:
        'Accurate Raft mental model with appropriate use cases and trade-offs. Good interview-level depth.',
      weak:
        'Explain leader + majority commit, give a realistic use case, and name a trade-off. Avoid treating Raft as a general-purpose database.',
    },
  },
  {
    id: 'concept-hard-transactions',
    evalType: 'concept',
    difficulty: 'hard',
    topics: [
      'transaction',
      'isolation',
      'anomaly',
      'serializable',
      'locking',
    ],
    questionPattern: 'Explain transaction isolation levels and anomalies.',
    rubricChecklist: [
      'Explains the concept asked',
      'Technically accurate',
      'Covers key points',
      'Uses examples or analogies',
      'Shows genuine understanding',
    ],
    strongExemplar:
      'Isolation levels trade concurrency for anomaly prevention: dirty reads, non-repeatable reads, phantoms. Read Committed blocks dirty reads; Repeatable Read / Snapshot reduce non-repeatable reads; Serializable aims to prevent phantoms via locking or SSI. Example: inventory decrement under Read Committed can oversell without careful constraints. Choose the weakest level that meets correctness, then measure latency.',
    weakSignals: [
      'Lists levels without anomalies',
      'No example workload',
      'Claims Serializable has no cost',
    ],
    feedbackAnchors: {
      strong:
        'Strong concept coverage: anomalies mapped to levels with a workload example and a practical selection heuristic.',
      weak:
        'Map each isolation level to the anomalies it prevents, add a concrete example, and discuss performance trade-offs.',
    },
  },

  // ─── System Design ─────────────────────────────────────────────────────────
  {
    id: 'design-easy-url',
    evalType: 'design',
    difficulty: 'easy',
    topics: ['url', 'shortener', 'redirect', 'hash', 'api'],
    questionPattern: 'Design a URL shortening service.',
    rubricChecklist: [
      'Addresses the specific system',
      'Includes essential components (API, DB, cache, etc.)',
      'Discusses trade-offs and design decisions',
      'Considers scalability and performance',
      'Shows architectural thinking',
    ],
    strongExemplar:
      'Clarify read/write ratio and custom aliases. API: POST /shorten, GET /{code} 302. Data model: code → long URL + created_at. Code generation: base62 counter or hash+collision retry. Cache hot redirects in Redis. Trade-offs: hash simplicity vs counter predictability; cache TTL vs consistency. Scale reads with cache + read replicas; writes are lower volume. Mention analytics as async side path.',
    weakSignals: [
      'Only names tech (“use Kafka + Mongo”) with no flow',
      'No API or data model',
      'No trade-offs',
    ],
    feedbackAnchors: {
      strong:
        'Good design skeleton: requirements, API, data model, code strategy, caching, and scale notes. Add failure handling for collisions and cache misses.',
      weak:
        'Structure the answer as requirements → API → data model → core algorithm → cache/scale → trade-offs. Name components and why they exist.',
    },
  },
  {
    id: 'design-easy-rate-limit',
    evalType: 'design',
    difficulty: 'easy',
    topics: ['rate', 'limiter', 'throttle', 'token', 'bucket', 'redis'],
    questionPattern: 'Design a distributed rate limiter.',
    rubricChecklist: [
      'Addresses the specific system',
      'Includes essential components',
      'Discusses trade-offs',
      'Considers scalability',
      'Shows architectural thinking',
    ],
    strongExemplar:
      'Clarify scope (user/IP/API key) and consistency needs. Prefer token bucket / sliding window in Redis with atomic INCR+TTL or Lua. Gateway middleware calls limiter before business logic. Trade-offs: local in-memory is fast but inaccurate across nodes; Redis is shared but adds latency. Discuss hot keys and fail-open vs fail-closed under limiter outage.',
    weakSignals: [
      'Describes only an algorithm with no deployment path',
      'Ignores multi-instance inconsistency',
      'No failure mode',
    ],
    feedbackAnchors: {
      strong:
        'Clear requirements, algorithm choice, shared store, and failure policy. Good distributed thinking.',
      weak:
        'State enforcement scope, choose an algorithm + shared store, and discuss multi-node correctness and limiter outage behavior.',
    },
  },
  {
    id: 'design-medium-feed',
    evalType: 'design',
    difficulty: 'medium',
    topics: ['feed', 'fan-out', 'push', 'pull', 'timeline', 'social'],
    questionPattern: 'Design a news-feed service.',
    rubricChecklist: [
      'Addresses the specific system',
      'Includes essential components',
      'Discusses trade-offs',
      'Considers scalability',
      'Shows architectural thinking',
    ],
    strongExemplar:
      'Clarify ranking needs and celebrity/fan-out skew. Models: posts, follows, timeline cache. Push fan-out writes to follower timelines (good for even graphs); pull merges on read (good for celebrities). Hybrid is common. Components: post service, graph service, timeline cache, ranking worker, CDN for media. Discuss eventual consistency, backpressure on fan-out queues, and pagination.',
    weakSignals: [
      'Ignores celebrity problem',
      'No push vs pull trade-off',
      'No ranking/pagination',
    ],
    feedbackAnchors: {
      strong:
        'Strong feed design: push/pull/hybrid trade-offs, skew handling, and core components. Mention consistency of timeline freshness.',
      weak:
        'Cover data model, push vs pull fan-out trade-offs (including celebrities), ranking/pagination, and how the system scales writes vs reads.',
    },
  },
  {
    id: 'design-medium-chat',
    evalType: 'design',
    difficulty: 'medium',
    topics: ['chat', 'websocket', 'messaging', 'presence', 'realtime'],
    questionPattern: 'Design a real-time chat service.',
    rubricChecklist: [
      'Addresses the specific system',
      'Includes essential components',
      'Discusses trade-offs',
      'Considers scalability',
      'Shows architectural thinking',
    ],
    strongExemplar:
      'Clarify delivery guarantees (at-least-once vs exactly-once UX), group size, and history. Connections via WebSocket gateway with sticky sessions or connection registry. Messages persisted first, then fan-out to online recipients; offline users get sync on reconnect. Order with channel seq numbers. Scale gateways horizontally; use pub/sub for cross-node delivery. Discuss presence TTLs and media via object storage.',
    weakSignals: [
      'Only “use WebSockets”',
      'No persistence or offline story',
      'No ordering discussion',
    ],
    feedbackAnchors: {
      strong:
        'Solid realtime design covering connections, persistence, fan-out, ordering, and offline sync. Good architectural coverage.',
      weak:
        'Include connection management, persistence-before-fanout, ordering, offline delivery, and horizontal scaling of gateways.',
    },
  },
  {
    id: 'design-hard-notification',
    evalType: 'design',
    difficulty: 'hard',
    topics: [
      'notification',
      'fan-out',
      'idempotency',
      'retry',
      'queue',
      'delivery',
    ],
    questionPattern: 'Design a notification delivery system.',
    rubricChecklist: [
      'Addresses the specific system',
      'Includes essential components',
      'Discusses trade-offs',
      'Considers scalability',
      'Shows architectural thinking',
    ],
    strongExemplar:
      'Clarify channels (push/email/SMS), latency, and preference center. Ingest API writes an immutable notification event with idempotency key. Orchestrator fans out to channel workers via queues; each worker is idempotent with provider message IDs. Handle retries/backoff, poison messages, quiet hours, and dedupe. Scale with partitioned queues; observe delivery rates and provider errors. Trade-offs: sync vs async UX, cost of SMS, at-least-once delivery with client dedupe.',
    weakSignals: [
      'No idempotency/retries',
      'Single monolithic sender',
      'Ignores preferences and provider failures',
    ],
    feedbackAnchors: {
      strong:
        'Excellent notification design: idempotent ingest, channel fan-out, retries, and operational concerns. Strong senior signal.',
      weak:
        'Add end-to-end flow with idempotency, queue-based workers per channel, retry/poison handling, and preference/scale considerations.',
    },
  },
  {
    id: 'design-hard-search',
    evalType: 'design',
    difficulty: 'hard',
    topics: [
      'search',
      'elasticsearch',
      'indexing',
      'ranking',
      'consistency',
    ],
    questionPattern: 'Design product search using Elasticsearch.',
    rubricChecklist: [
      'Addresses the specific system',
      'Includes essential components',
      'Discusses trade-offs',
      'Considers scalability',
      'Shows architectural thinking',
    ],
    strongExemplar:
      'Source of truth remains OLTP DB; search index is a derived view. Ingest via CDC/outbox to indexers updating Elasticsearch documents (denormalized product fields). Query path: search API → ES → hydrate critical fields from DB if needed. Ranking: BM25 + business signals. Discuss near-real-time lag, partial failures, reindex strategy, and synonyms/filters. Trade-off: query freshness vs indexer complexity.',
    weakSignals: [
      'Treats ES as system of record',
      'No sync/indexing pipeline',
      'No ranking or failure recovery',
    ],
    feedbackAnchors: {
      strong:
        'Strong search architecture: OLTP as source of truth, async indexing, ranking, and reindex/lag trade-offs.',
      weak:
        'Separate source of truth from the index, describe the indexing pipeline, query/ranking path, and how you recover from stale or failed indexing.',
    },
  },

  // ─── Code explanation / DSA (non-LeetCode URL path) ────────────────────────
  {
    id: 'code-easy-two-sum',
    evalType: 'code_explanation',
    difficulty: 'easy',
    topics: ['two sum', 'hash map', 'array', 'leetcode', 'algorithm'],
    questionPattern: 'Explain the optimal approach for Two Sum.',
    rubricChecklist: [
      'Explains the approach for the problem',
      'Mentions the optimal approach/algorithm',
      'Discusses time and space complexity',
      'Shows understanding of WHY it works',
    ],
    strongExemplar:
      'Brute force checks all pairs O(n²). Optimal: one pass hash map from value→index; for each x check if target−x was seen. Why: each lookup is amortized O(1), so total O(n) time and O(n) space. Edge cases: duplicates and self-pairs are handled by storing indices carefully.',
    weakSignals: [
      'Only restates the problem',
      'No complexity',
      'Claims O(n) without explaining the map',
    ],
    feedbackAnchors: {
      strong:
        'Clear optimal approach, why it works, and complexity. Mention one edge case for a complete answer.',
      weak:
        'Name the algorithm (hash map), explain why correctness holds, and state time/space complexity explicitly.',
    },
  },
  {
    id: 'code-easy-binary-search',
    evalType: 'code_explanation',
    difficulty: 'easy',
    topics: ['binary search', 'sorted', 'algorithm', 'complexity'],
    questionPattern: 'Explain binary search and its complexity.',
    rubricChecklist: [
      'Explains the approach',
      'Mentions the optimal approach/algorithm',
      'Discusses time and space complexity',
      'Shows understanding of WHY it works',
    ],
    strongExemplar:
      'Binary search repeatedly halves a sorted range by comparing the midpoint to the target. It works because sorted order guarantees the target can only lie in one half. Time O(log n), space O(1) iterative. Call out off-by-one mid updates as the common bug.',
    weakSignals: [
      'Forgets sorted precondition',
      'Wrong complexity',
      'No invariant explanation',
    ],
    feedbackAnchors: {
      strong:
        'Good explanation of invariant, complexity, and a practical pitfall. Solid fundamentals.',
      weak:
        'State the sorted precondition, describe the halving invariant, and give O(log n) time with O(1) iterative space.',
    },
  },
  {
    id: 'code-medium-sliding-window',
    evalType: 'code_explanation',
    difficulty: 'medium',
    topics: ['sliding window', 'substring', 'two pointers', 'algorithm'],
    questionPattern: 'Explain the sliding window approach for substring problems.',
    rubricChecklist: [
      'Explains the approach',
      'Mentions the optimal approach/algorithm',
      'Discusses time and space complexity',
      'Shows understanding of WHY it works',
    ],
    strongExemplar:
      'Maintain a window [left,right] expanding right and shrinking left when a constraint breaks (e.g., too many distinct chars). Why: each index moves at most once → O(n). Use a frequency map for counts. Contrast with recomputing from scratch each time. Space O(k) for alphabet/constraint set.',
    weakSignals: [
      'Describes nested loops as sliding window',
      'No amortized O(n) reasoning',
      'Missing constraint that drives shrinks',
    ],
    feedbackAnchors: {
      strong:
        'Clear window invariant, amortized complexity, and data structure. Good interview explanation.',
      weak:
        'Define the window invariant, when left moves, why total time is O(n), and what state you store.',
    },
  },
  {
    id: 'code-medium-bfs',
    evalType: 'code_explanation',
    difficulty: 'medium',
    topics: ['bfs', 'graph', 'shortest', 'queue', 'level order'],
    questionPattern: 'When do you use BFS and what is its complexity?',
    rubricChecklist: [
      'Explains the approach',
      'Mentions the optimal approach/algorithm',
      'Discusses time and space complexity',
      'Shows understanding of WHY it works',
    ],
    strongExemplar:
      'BFS explores layer by layer with a queue, so the first time you reach a node in an unweighted graph is a shortest path in edge count. Time O(V+E), space O(V). Prefer DFS for connectivity/components or path existence without shortest-path needs. Track visited to avoid cycles.',
    weakSignals: [
      'Confuses BFS with Dijkstra use cases',
      'No complexity',
      'Forgets visited set',
    ],
    feedbackAnchors: {
      strong:
        'Correct BFS mental model for unweighted shortest paths with complexity and contrast to DFS.',
      weak:
        'Explain queue layering, why it yields shortest unweighted paths, visited handling, and O(V+E) complexity.',
    },
  },
  {
    id: 'code-hard-dp',
    evalType: 'code_explanation',
    difficulty: 'hard',
    topics: ['dynamic programming', 'dp', 'optimal substructure', 'memo'],
    questionPattern: 'Explain how to recognize and solve a DP problem.',
    rubricChecklist: [
      'Explains the approach',
      'Mentions the optimal approach/algorithm',
      'Discusses time and space complexity',
      'Shows understanding of WHY it works',
    ],
    strongExemplar:
      'DP fits overlapping subproblems + optimal substructure. Define state, transition, base cases, then evaluate bottom-up or memoized top-down. Example: knapsack dp[i][w]. Complexity is state count × transition work. Explain why greedy fails when local choices block global optima. Space-optimize when only previous row is needed.',
    weakSignals: [
      'Says “use DP” without state definition',
      'No complexity in terms of states',
      'No why-not-greedy',
    ],
    feedbackAnchors: {
      strong:
        'Strong DP explanation: state/transition/base cases, complexity, and contrast with greedy. Interview-ready.',
      weak:
        'Define state and transition explicitly, give complexity from state space, and explain why the recurrence is correct.',
    },
  },
  {
    id: 'code-hard-union-find',
    evalType: 'code_explanation',
    difficulty: 'hard',
    topics: ['union find', 'disjoint set', 'connected components', 'kruskal'],
    questionPattern: 'Explain Union-Find and its complexity with path compression.',
    rubricChecklist: [
      'Explains the approach',
      'Mentions the optimal approach/algorithm',
      'Discusses time and space complexity',
      'Shows understanding of WHY it works',
    ],
    strongExemplar:
      'Union-Find tracks disjoint sets with parent links. Find follows parents; Union merges roots. Path compression + union by rank make operations effectively amortized α(n). Use for dynamic connectivity / Kruskal. Why it works: each node always points toward its component root after compression.',
    weakSignals: [
      'Omits path compression / rank',
      'Wrong complexity claims like O(1) worst-case',
      'No use case',
    ],
    feedbackAnchors: {
      strong:
        'Accurate Union-Find with optimizations, amortized complexity, and a concrete use case.',
      weak:
        'Describe Find/Union, path compression (and rank), amortized α(n) cost, and a connectivity use case.',
    },
  },

  // ─── LeetCode code review ──────────────────────────────────────────────────
  {
    id: 'lc-easy-correctness',
    evalType: 'leetcode',
    difficulty: 'easy',
    topics: ['leetcode', 'code', 'array', 'string', 'syntax'],
    questionPattern: 'Easy LeetCode solution review criteria.',
    rubricChecklist: [
      'Plausible correct solution for the problem',
      'Valid syntax in a recognizable language',
      'Covers common edge cases',
      'Reasonable time/space for difficulty',
    ],
    strongExemplar:
      'Readable solution with clear loop invariants, handles empty input / single-element edge cases, and uses an expected O(n) or O(n log n) approach for easy problems. Variable names and control flow make correctness obvious.',
    weakSignals: [
      'Empty or unrelated code',
      'Obvious syntax errors throughout',
      'Brute force that is fine for tiny n but wrongly claimed optimal without need',
    ],
    feedbackAnchors: {
      strong:
        'Code looks like an accepted easy solution: valid syntax, plausible correctness, and edge cases handled. Complexity is appropriate.',
      weak:
        'Reject only if empty, unrelated, or clearly incorrect. Otherwise point to specific edge cases or syntax issues and whether complexity fits an easy problem.',
    },
  },
  {
    id: 'lc-medium-patterns',
    evalType: 'leetcode',
    difficulty: 'medium',
    topics: ['leetcode', 'medium', 'graph', 'dp', 'window'],
    questionPattern: 'Medium LeetCode solution review criteria.',
    rubricChecklist: [
      'Plausible correct solution for the problem',
      'Valid syntax in a recognizable language',
      'Covers common edge cases',
      'Reasonable time/space for difficulty',
    ],
    strongExemplar:
      'Uses a standard medium pattern (sliding window, BFS/DFS, heap, union-find, DP) with correct visited/state handling. Complexity matches constraints. Edge cases like disconnected graphs or empty queues are handled.',
    weakSignals: [
      'Wrong algorithm family for the problem statement',
      'Off-by-one that breaks core cases',
      'Exponential solution where polynomial is expected',
    ],
    feedbackAnchors: {
      strong:
        'Plausible medium solution with an appropriate pattern and reasonable complexity. Note any remaining edge-case gaps briefly.',
      weak:
        'Check correctness against the problem, syntax validity, edge cases, and whether complexity is reasonable for medium constraints. Be generous if it looks accepted.',
    },
  },
  {
    id: 'lc-hard-scale',
    evalType: 'leetcode',
    difficulty: 'hard',
    topics: ['leetcode', 'hard', 'optimization', 'complex'],
    questionPattern: 'Hard LeetCode solution review criteria.',
    rubricChecklist: [
      'Plausible correct solution for the problem',
      'Valid syntax in a recognizable language',
      'Covers common edge cases',
      'Reasonable time/space for difficulty',
    ],
    strongExemplar:
      'Implements a known hard approach (advanced DP, segment tree, network flow style reasoning, careful greedy+prove) with clear state. Handles tricky bounds. Complexity is justified versus naive exponential search.',
    weakSignals: [
      'Pseudo-code fragments that cannot run',
      'Ignores stated constraints',
      'Clearly incorrect core invariant',
    ],
    feedbackAnchors: {
      strong:
        'Hard solution appears coherent with valid syntax and complexity suited to constraints. Call out any unclear invariant briefly.',
      weak:
        'For hard problems, still be generous to legitimate solutions. Flag empty/unrelated/incorrect code; otherwise comment on invariant gaps or complexity.',
    },
  },

  // ─── General / resume deep-dive / professional judgment ────────────────────
  {
    id: 'general-easy-resume',
    evalType: 'general',
    difficulty: 'easy',
    topics: ['resume', 'project', 'experience', 'ownership', 'metric'],
    questionPattern:
      'Walk me through a project on your resume and what you owned.',
    rubricChecklist: [
      'Addresses the task question',
      'Thoughtful and complete',
      'Shows effort and understanding',
    ],
    strongExemplar:
      'States the problem, your personal ownership, tools/methods, how you validated success, and one metric or lesson. Avoids inventing metrics. Distinguishes “I” vs team.',
    weakSignals: [
      'Invented metrics',
      'Only lists technologies',
      'No personal ownership',
    ],
    feedbackAnchors: {
      strong:
        'Clear ownership story with methods and validation. Good resume defense structure.',
      weak:
        'Address the question with problem → your ownership → methods → validation. Do not invent metrics; say when a figure is approximate.',
    },
  },
  {
    id: 'general-medium-resume-decision',
    evalType: 'general',
    difficulty: 'medium',
    topics: [
      'resume',
      'trade-off',
      'decision',
      'architecture',
      'alternative',
    ],
    questionPattern:
      'Why did you choose that technical approach on your project?',
    rubricChecklist: [
      'Addresses the task question',
      'Thoughtful and complete',
      'Shows effort and understanding',
    ],
    strongExemplar:
      'Names constraints, alternatives considered, decision criteria, and what you would change now. Ties the choice to a resume claim without exaggeration.',
    weakSignals: [
      '“It was popular” as only reason',
      'No alternatives',
      'Contradicts resume claim',
    ],
    feedbackAnchors: {
      strong:
        'Good decision narrative with constraints, alternatives, and reflection. Strong interview signal.',
      weak:
        'Explain constraints, alternatives, decision criteria, and a retrospective. Keep claims consistent with the resume.',
    },
  },
  {
    id: 'general-hard-judgment',
    evalType: 'general',
    difficulty: 'hard',
    topics: [
      'judgment',
      'ethics',
      'stakeholder',
      'risk',
      'professional',
    ],
    questionPattern:
      'How would you handle a stakeholder asking you to hide a material risk?',
    rubricChecklist: [
      'Addresses the task question',
      'Thoughtful and complete',
      'Shows effort and understanding',
    ],
    strongExemplar:
      'Clarifies facts vs assumptions, duties to users/company, documents advice, proposes transparent options, and knows escalation paths. Balances relationship with integrity.',
    weakSignals: [
      'Blind compliance',
      'Immediate resignation theater without process',
      'No documentation/escalation',
    ],
    feedbackAnchors: {
      strong:
        'Thoughtful professional judgment with clarification, options, documentation, and escalation. Complete answer.',
      weak:
        'Show how you clarify facts, communicate risk transparently, document decisions, and escalate — not only a slogan about honesty.',
    },
  },
  {
    id: 'general-easy-complete',
    evalType: 'general',
    difficulty: 'easy',
    topics: ['explanation', 'complete', 'structured', 'answer'],
    questionPattern: 'General structured answer expectations.',
    rubricChecklist: [
      'Addresses the task question',
      'Thoughtful and complete',
      'Shows effort and understanding',
    ],
    strongExemplar:
      'Opens by restating the ask, answers in structured bullets or short paragraphs, and closes with a takeaway. Stays on prompt.',
    weakSignals: [
      'Off-topic',
      'One-sentence shrug',
      'No structure',
    ],
    feedbackAnchors: {
      strong:
        'Direct, structured, and complete response to the prompt. Good effort and clarity.',
      weak:
        'Re-read the question and answer it directly with a clear structure and enough detail to show understanding.',
    },
  },
  {
    id: 'general-medium-case',
    evalType: 'general',
    difficulty: 'medium',
    topics: ['case', 'analysis', 'framework', 'recommendation'],
    questionPattern: 'Work through an ambiguous case and recommend an approach.',
    rubricChecklist: [
      'Addresses the task question',
      'Thoughtful and complete',
      'Shows effort and understanding',
    ],
    strongExemplar:
      'Clarifies goals/constraints, structures analysis, compares options, states recommendation with risks and success measures.',
    weakSignals: [
      'Jumps to solution with no clarification',
      'No options comparison',
      'No success metric',
    ],
    feedbackAnchors: {
      strong:
        'Good case structure: clarify → options → recommendation → risks/metrics.',
      weak:
        'Clarify constraints first, compare at least two options, and end with a recommendation plus how you would measure success.',
    },
  },
  {
    id: 'general-hard-systems-thinking',
    evalType: 'general',
    difficulty: 'hard',
    topics: ['systems', 'trade-off', 'risk', 'measurement', 'complex'],
    questionPattern: 'Analyze a complex systems/process failure and remediation.',
    rubricChecklist: [
      'Addresses the task question',
      'Thoughtful and complete',
      'Shows effort and understanding',
    ],
    strongExemplar:
      'Separates symptoms vs root causes, proposes layered fixes (immediate mitigation + systemic prevention), and defines leading/lagging indicators.',
    weakSignals: [
      'Only blame individuals',
      'Single silver-bullet fix',
      'No measurement',
    ],
    feedbackAnchors: {
      strong:
        'Strong systems answer: root-cause layering, mitigation vs prevention, and measurement. High quality.',
      weak:
        'Distinguish symptoms from causes, propose immediate and systemic fixes, and define how you would measure improvement.',
    },
  },
];
