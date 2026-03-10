export const SKILLS_DATA = [
  /* ================= PROGRAMMING ================= */

  { name: 'javascript', aliases: ['js'], category: 'programming' },
  { name: 'typescript', aliases: ['ts'], category: 'programming' },
  { name: 'python', aliases: [], category: 'programming' },
  { name: 'java', aliases: [], category: 'programming' },
  { name: 'c', aliases: [], category: 'programming' },
  { name: 'c++', aliases: ['cpp'], category: 'programming' },
  { name: 'c#', aliases: ['csharp'], category: 'programming' },
  { name: 'go', aliases: ['golang'], category: 'programming' },
  { name: 'rust', aliases: [], category: 'programming' },
  { name: 'swift', aliases: [], category: 'programming' },
  { name: 'kotlin', aliases: [], category: 'programming' },
  { name: 'php', aliases: [], category: 'programming' },
  { name: 'scala', aliases: [], category: 'programming' },
  { name: 'r', aliases: [], category: 'programming' },
  { name: 'matlab', aliases: [], category: 'programming' },

  /* ================= FRONTEND ================= */

  { name: 'react', aliases: ['reactjs'], category: 'frontend' },
  { name: 'nextjs', aliases: ['next.js'], category: 'frontend' },
  { name: 'vue', aliases: ['vuejs'], category: 'frontend' },
  { name: 'angular', aliases: ['angularjs'], category: 'frontend' },
  { name: 'svelte', aliases: [], category: 'frontend' },
  { name: 'redux', aliases: [], category: 'frontend' },
  { name: 'zustand', aliases: [], category: 'frontend' },
  { name: 'mobx', aliases: [], category: 'frontend' },
  { name: 'html', aliases: ['html5'], category: 'frontend' },
  { name: 'css', aliases: ['css3'], category: 'frontend' },
  { name: 'sass', aliases: ['scss'], category: 'frontend' },
  { name: 'tailwind', aliases: ['tailwindcss'], category: 'frontend' },
  { name: 'bootstrap', aliases: [], category: 'frontend' },
  { name: 'material ui', aliases: ['mui'], category: 'frontend' },
  { name: 'chakra ui', aliases: [], category: 'frontend' },
  { name: 'ant design', aliases: ['antd'], category: 'frontend' },
  { name: 'three.js', aliases: ['threejs'], category: 'frontend' },
  { name: 'webpack', aliases: [], category: 'frontend' },
  { name: 'vite', aliases: [], category: 'frontend' },
  { name: 'babel', aliases: [], category: 'frontend' },

  /* ================= BACKEND ================= */

  { name: 'nodejs', aliases: ['node'], category: 'backend' },
  { name: 'express', aliases: ['expressjs'], category: 'backend' },
  { name: 'nestjs', aliases: ['nest'], category: 'backend' },
  { name: 'spring boot', aliases: ['springboot'], category: 'backend' },
  { name: 'spring', aliases: [], category: 'backend' },
  { name: 'django', aliases: [], category: 'backend' },
  { name: 'flask', aliases: [], category: 'backend' },
  { name: 'fastapi', aliases: [], category: 'backend' },
  { name: 'laravel', aliases: [], category: 'backend' },
  { name: 'ruby on rails', aliases: ['rails'], category: 'backend' },
  { name: 'graphql', aliases: [], category: 'backend' },
  { name: 'rest api', aliases: ['rest'], category: 'backend' },
  { name: 'grpc', aliases: [], category: 'backend' },
  { name: 'microservices', aliases: [], category: 'backend' },

  /* ================= DATABASE ================= */

  { name: 'postgresql', aliases: ['postgres'], category: 'database' },
  { name: 'mysql', aliases: [], category: 'database' },
  { name: 'mongodb', aliases: ['mongo'], category: 'database' },
  { name: 'sqlite', aliases: [], category: 'database' },
  { name: 'oracle', aliases: ['oracle db'], category: 'database' },
  { name: 'mariadb', aliases: [], category: 'database' },
  { name: 'dynamodb', aliases: [], category: 'database' },
  { name: 'cassandra', aliases: [], category: 'database' },
  { name: 'redis', aliases: [], category: 'database' },
  { name: 'elasticsearch', aliases: ['elastic'], category: 'database' },
  { name: 'neo4j', aliases: [], category: 'database' },
  { name: 'firebase', aliases: [], category: 'database' },

  /* ================= CLOUD ================= */

  { name: 'aws', aliases: ['amazon web services'], category: 'cloud' },
  { name: 'gcp', aliases: ['google cloud'], category: 'cloud' },
  { name: 'azure', aliases: ['microsoft azure'], category: 'cloud' },
  { name: 'cloudflare', aliases: [], category: 'cloud' },
  { name: 'vercel', aliases: [], category: 'cloud' },
  { name: 'netlify', aliases: [], category: 'cloud' },

  /* ================= DEVOPS ================= */

  { name: 'docker', aliases: [], category: 'devops' },
  { name: 'kubernetes', aliases: ['k8s'], category: 'devops' },
  { name: 'terraform', aliases: [], category: 'devops' },
  { name: 'ansible', aliases: [], category: 'devops' },
  { name: 'jenkins', aliases: [], category: 'devops' },
  { name: 'github actions', aliases: [], category: 'devops' },
  { name: 'gitlab ci', aliases: [], category: 'devops' },
  { name: 'ci/cd', aliases: ['cicd'], category: 'devops' },
  { name: 'linux', aliases: [], category: 'devops' },
  { name: 'bash', aliases: ['shell'], category: 'devops' },

  /* ================= DATA / AI ================= */

  { name: 'machine learning', aliases: ['ml'], category: 'ai' },
  { name: 'deep learning', aliases: ['dl'], category: 'ai' },
  { name: 'pandas', aliases: [], category: 'ai' },
  { name: 'numpy', aliases: [], category: 'ai' },
  { name: 'scikit-learn', aliases: ['sklearn'], category: 'ai' },
  { name: 'tensorflow', aliases: [], category: 'ai' },
  { name: 'pytorch', aliases: [], category: 'ai' },
  { name: 'langchain', aliases: [], category: 'ai' },
  { name: 'rag', aliases: ['retrieval augmented generation'], category: 'ai' },
  { name: 'openai', aliases: ['gpt'], category: 'ai' },
  { name: 'huggingface', aliases: [], category: 'ai' },
  { name: 'llm', aliases: ['large language model'], category: 'ai' },

  /* ================= TESTING ================= */

  { name: 'jest', aliases: [], category: 'testing' },
  { name: 'cypress', aliases: [], category: 'testing' },
  { name: 'mocha', aliases: [], category: 'testing' },
  { name: 'chai', aliases: [], category: 'testing' },
  { name: 'playwright', aliases: [], category: 'testing' },
  { name: 'selenium', aliases: [], category: 'testing' },

  /* ================= TOOLS ================= */

  { name: 'git', aliases: [], category: 'tools' },
  { name: 'github', aliases: [], category: 'tools' },
  { name: 'gitlab', aliases: [], category: 'tools' },
  { name: 'bitbucket', aliases: [], category: 'tools' },
  { name: 'jira', aliases: [], category: 'tools' },
  { name: 'confluence', aliases: [], category: 'tools' },
  { name: 'postman', aliases: [], category: 'tools' },
  { name: 'swagger', aliases: [], category: 'tools' },
  { name: 'figma', aliases: [], category: 'design' },
];
