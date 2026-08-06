import { RagTask } from '../../rag/rag-task.entity';

export type EvalFixture = {
  name: string;
  label: string;
  quality: 'strong' | 'weak';
  task: Pick<
    RagTask,
    'title' | 'category' | 'difficulty' | 'tags' | 'leetcodeUrl'
  >;
  answer: string;
  expect: {
    scoreMin: number;
    scoreMax: number;
    feedbackShouldMention?: string[];
  };
};

export const EVAL_FIXTURES: EvalFixture[] = [
  {
    name: 'behavioral-weak',
    label: 'Behavioral · weak (no STAR)',
    quality: 'weak',
    task: {
      title: 'Tell me about a time you disagreed with a teammate',
      category: 'Behavioral',
      difficulty: 'easy',
      tags: ['conflict', 'team'],
      leetcodeUrl: null,
    },
    answer:
      'I think communication is important. I always try to be nice and listen to others. Teams work better when people get along.',
    expect: {
      scoreMin: 0,
      scoreMax: 6.5,
      feedbackShouldMention: ['Situation', 'Action', 'Result'],
    },
  },
  {
    name: 'behavioral-strong',
    label: 'Behavioral · strong (incident STAR)',
    quality: 'strong',
    task: {
      title: 'Tell me about a production incident you helped resolve',
      category: 'Behavioral',
      difficulty: 'medium',
      tags: ['incident', 'production'],
      leetcodeUrl: null,
    },
    answer: `Situation: Checkout p95 latency jumped to 4 seconds during a sale. Task: Restore our 500ms SLO and find root cause. Action: I owned the checkout API path, inspected dashboards, traced a hot Redis key stampede, applied a temporary rate limit, and shipped a cache TTL fix while coordinating with the database oncall on pool saturation. Result: p95 returned to 320ms within 25 minutes. We added a postmortem runbook and synthetic checkout alerts. I learned to separate mitigation from root-cause work under pressure.`,
    expect: { scoreMin: 7, scoreMax: 10 },
  },
  {
    name: 'design-weak',
    label: 'System Design · weak (buzzwords)',
    quality: 'weak',
    task: {
      title: 'Design a URL shortening service',
      category: 'System Design',
      difficulty: 'easy',
      tags: ['url', 'shortener'],
      leetcodeUrl: null,
    },
    answer:
      'I would use Kafka, Kubernetes, MongoDB, and Redis because they scale.',
    expect: {
      scoreMin: 0,
      scoreMax: 6.5,
      feedbackShouldMention: ['API', 'trade-off', 'component'],
    },
  },
  {
    name: 'design-strong',
    label: 'System Design · strong (rate limiter)',
    quality: 'strong',
    task: {
      title: 'Design a distributed rate limiter',
      category: 'System Design',
      difficulty: 'easy',
      tags: ['rate', 'limiter', 'redis'],
      leetcodeUrl: null,
    },
    answer: `First clarify scope: per user, IP, or API key, and whether we need strict global accuracy. I would place a limiter check in the API gateway. Algorithm: token bucket or sliding window implemented in Redis with atomic INCR + TTL or a Lua script so all instances share state. Local in-memory counters are faster but incorrect across nodes. For hot keys, shard by key hash. On limiter outage, decide fail-open vs fail-closed based on abuse risk. Scale reads/writes on Redis and monitor deny rate and latency added by the check.`,
    expect: { scoreMin: 7, scoreMax: 10 },
  },
  {
    name: 'concept-weak',
    label: 'Concept · weak (one-liner)',
    quality: 'weak',
    task: {
      title: 'Explain how database indexes speed up queries',
      category: 'Technical Concepts',
      difficulty: 'easy',
      tags: ['index', 'database'],
      leetcodeUrl: null,
    },
    answer: 'Indexes make databases faster.',
    expect: {
      scoreMin: 0,
      scoreMax: 6,
      feedbackShouldMention: ['example', 'trade-off', 'mechanism'],
    },
  },
  {
    name: 'concept-strong',
    label: 'Concept · strong (CAP)',
    quality: 'strong',
    task: {
      title: 'Explain the CAP theorem with a practical example',
      category: 'Technical Concepts',
      difficulty: 'medium',
      tags: ['cap', 'distributed'],
      leetcodeUrl: null,
    },
    answer: `CAP says that during a network partition, a distributed system must choose between consistency and availability. For example, a multi-region shopping cart that rejects writes when regions cannot agree is CP, while a cart that keeps serving possibly stale data is AP. You do not get all three during a partition. PACELC adds that even without partitions, systems trade latency versus consistency. A good interview answer also avoids claiming CA as a permanent mode under partition.`,
    expect: { scoreMin: 7, scoreMax: 10 },
  },
];

export function fixtureToTask(partial: EvalFixture['task']): RagTask {
  return {
    id: 1,
    title: partial.title,
    category: partial.category,
    difficulty: partial.difficulty as RagTask['difficulty'],
    tags: partial.tags ?? [],
    time_minutes: 25,
    is_active: true,
    created_at: new Date(),
    priority: 'medium',
    user_id: null,
    description: null,
    leetcodeUrl: partial.leetcodeUrl ?? null,
    source_keywords: [],
    source_resume_point: null,
    selection_reason: null,
  };
}
