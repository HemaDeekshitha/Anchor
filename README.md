# 🪩 Anchor – AI-Powered Job Search Companion  
> Stay motivated. Stay consistent. Grow with purpose.



---

## 🧭 Overview
**Anchor** is a next-generation, emotionally intelligent job-search companion.  
It helps users plan applications, track progress, reflect on moods, and earn **rewards** for consistency.  
Built with AI, it blends productivity and motivation through personalized plans, emotion analysis, and performance insights — accessible on both **web** and **iOS** with the same experience and features.

---

## 🏗️ Architecture Overview

- **Users**
  - ⬇️ Web (Next.js) / iOS (SwiftUI)
    - ⬇️ **Auth & API Gateway** (NextAuth.js / OAuth2)
      - ⬇️ **Backend Microservices**
        - FastAPI (AI Orchestration)
        - NestJS (User, Tasks, Rewards, Notices)
        - Email/Calendar Sync via Celery
      - ⬇️ **Data & Intelligence Layer**
        - PostgreSQL · MongoDB · Redis · Pinecone
      - ⬇️ **AI Orchestration**
        - LangChain · GPT-4o / Gemini
      - ⬇️ **Analytics & Monitoring**
        - Mixpanel · Grafana · Sentry



## ⚙️ Tech Stack


| Layer                      |                             Technologies                                                             |
|----------------------------|------------------------------------------------------------------------------------------------------|
| **Frontend (Web + iOS)**   |   Next.js (TypeScript), SwiftUI, Tailwind CSS, ShadCN/UI, Combine, CoreData, Zustand, TanStack Query |
| **Backend**                |   FastAPI (Python), Node.js / NestJS, PostgreSQL, Redis, MongoDB                                     | 
| **AI & ML**                |   OpenAI GPT-4o / Gemini, LangChain, Pinecone, Hugging Face, Meilisearch                             |
| **DevOps / Cloud**         |   AWS (Lambda, ECS, RDS), Vercel, Docker, GitHub Actions, Cloudflare                                 |
| **Analytics & Monitoring** | Mixpanel, Firebase Analytics, Grafana, Prometheus, Sentry                                            |

---

## 🧩 Prerequisites

### 🖥️ System Requirements
- **Node.js ≥ 18**  
- **Python ≥ 3.10**  
- **Xcode ≥ 15** with **Swift 5.9+**  
- **PostgreSQL** and **Redis** running locally  
- **Docker** (recommended for consistency)

### 🧰 Developer Environments
- **Swift Toolchain & CLI:**  
  Install via Xcode Command Line Tools → `xcode-select --install`  
  Validate with `swift --version`
- **Virtual Env (Backend):**  
  `python -m venv myenv && source myenv/bin/activate`
- **Package Managers:**  
  `npm`, `pip`, and Swift Package Manager

### 🔑 Required Accounts / API Keys
- GitHub account  
- Firebase project (analytics + notifications)  
- OpenAI / Gemini API keys  
- Mixpanel project key  
- AWS or GCP credentials  

---

## 📦 Repository Setup
```bash
git clone https://github.com/<your-org>/anchor.git
cd anchor
anchor/
 ├── web-frontend/      # Next.js frontend
 ├── ios-app/           # SwiftUI app
 ├── backend/           # FastAPI + NestJS backend
 ├── docs/              # Architecture + workflow docs
 └── .github/workflows/ # CI/CD configurations

