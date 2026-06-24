export interface BlueprintCompetency {
  name: string;
  importance: 'must_know' | 'frequent' | 'depth';
}

export interface RoleBlueprintDefinition {
  slug: string;
  title: string;
  version: number;
  competencies: BlueprintCompetency[];
}

const BLUEPRINTS: RoleBlueprintDefinition[] = [
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    version: 1,
    competencies: [
      { name: 'Data Structures & Algorithms', importance: 'must_know' },
      { name: 'Programming & Code Quality', importance: 'must_know' },
      { name: 'Databases & Data Modeling', importance: 'must_know' },
      { name: 'Operating Systems & Networking', importance: 'frequent' },
      { name: 'System Design & Trade-offs', importance: 'frequent' },
      { name: 'Testing, Debugging & Reliability', importance: 'frequent' },
      {
        name: 'Resume Projects & Technical Decisions',
        importance: 'must_know',
      },
      { name: 'Behavioral & Collaboration', importance: 'must_know' },
    ],
  },
  {
    slug: 'ai-ml-engineer',
    title: 'AI/ML Engineer',
    version: 1,
    competencies: [
      { name: 'Python, Data Structures & SQL', importance: 'must_know' },
      {
        name: 'Probability, Statistics & Linear Algebra',
        importance: 'must_know',
      },
      { name: 'Machine Learning Foundations', importance: 'must_know' },
      { name: 'Feature Engineering & Evaluation', importance: 'must_know' },
      { name: 'Deep Learning & Modern Architectures', importance: 'frequent' },
      { name: 'ML Systems, Deployment & Monitoring', importance: 'frequent' },
      { name: 'Experimentation & Product Judgment', importance: 'frequent' },
      { name: 'Resume Projects & Behavioral', importance: 'must_know' },
    ],
  },
  {
    slug: 'business-analyst',
    title: 'Business Analyst',
    version: 1,
    competencies: [
      { name: 'Requirements Elicitation', importance: 'must_know' },
      { name: 'Process Modeling & Improvement', importance: 'must_know' },
      { name: 'SQL, Analytics & KPI Design', importance: 'must_know' },
      { name: 'Stakeholder Management', importance: 'must_know' },
      { name: 'Business Cases & Prioritization', importance: 'frequent' },
      { name: 'Documentation & Communication', importance: 'frequent' },
      { name: 'Domain and Resume Project Defense', importance: 'frequent' },
      { name: 'Behavioral & Leadership', importance: 'must_know' },
    ],
  },
  {
    slug: 'electrical-engineer',
    title: 'Electrical Engineer',
    version: 1,
    competencies: [
      { name: 'Circuits & Electronics', importance: 'must_know' },
      { name: 'Signals, Systems & Control', importance: 'must_know' },
      { name: 'Digital Logic & Embedded Systems', importance: 'frequent' },
      { name: 'Power, Machines & Energy', importance: 'frequent' },
      {
        name: 'Testing, Measurement & Troubleshooting',
        importance: 'must_know',
      },
      { name: 'Engineering Design & Trade-offs', importance: 'must_know' },
      { name: 'Tools, Standards & Resume Projects', importance: 'frequent' },
      { name: 'Behavioral & Safety Judgment', importance: 'must_know' },
    ],
  },
  {
    slug: 'lawyer',
    title: 'Lawyer',
    version: 1,
    competencies: [
      { name: 'Issue Spotting & Legal Analysis', importance: 'must_know' },
      { name: 'Legal Research & Authority', importance: 'must_know' },
      { name: 'Writing, Drafting & Precision', importance: 'must_know' },
      { name: 'Fact Investigation & Case Strategy', importance: 'frequent' },
      { name: 'Advocacy, Negotiation & Client Advice', importance: 'frequent' },
      { name: 'Professional Responsibility & Ethics', importance: 'must_know' },
      { name: 'Practice-Area and Resume Experience', importance: 'frequent' },
      { name: 'Behavioral & Judgment', importance: 'must_know' },
    ],
  },
];

const FALLBACK_BLUEPRINT: RoleBlueprintDefinition = {
  slug: 'career-interview',
  title: 'Career Interview',
  version: 1,
  competencies: [
    { name: 'Role Foundations', importance: 'must_know' },
    { name: 'Applied Problem Solving', importance: 'must_know' },
    { name: 'Tools & Domain Knowledge', importance: 'must_know' },
    { name: 'Scenario and Case Analysis', importance: 'frequent' },
    { name: 'Resume and Project Defense', importance: 'must_know' },
    { name: 'Communication & Stakeholders', importance: 'frequent' },
    { name: 'Leadership & Collaboration', importance: 'frequent' },
    { name: 'Behavioral Interviewing', importance: 'must_know' },
  ],
};

function normalizeRole(role: string): string {
  return role
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function getRoleBlueprint(role: string): RoleBlueprintDefinition {
  const normalized = normalizeRole(role);
  return (
    BLUEPRINTS.find((blueprint) => {
      const slugWords = blueprint.slug.replace(/-/g, ' ');
      return normalized.includes(slugWords) || slugWords.includes(normalized);
    }) ?? { ...FALLBACK_BLUEPRINT, title: role }
  );
}
