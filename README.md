
# PlacePro AI

**AI-powered placement preparation platform** — coding practice, aptitude tests, mock interviews, resume analysis, career coaching, jobs, contests, and more.

Built to compete with LeetCode, HackerRank, InterviewBit, and GeeksforGeeks in functionality and UX.

## Features

| Module | Highlights |
|--------|------------|
| **Landing** | Hero, animated stats, company logos, testimonials, roadmap, pricing, FAQ |
| **Auth** | Email/password, OTP, Google/GitHub OAuth, forgot password, JWT |
| **Dashboard** | Readiness scores, streaks, XP, AI insights, recommendations |
| **Coding** | Monaco editor, Judge0, 5 languages, submissions, editorials, discussions |
| **Aptitude** | Quant/Logical/Verbal, timed quizzes, mock exams, analytics |
| **Resume** | AI ATS analysis, skill gaps, suggestions |
| **Interviews** | Technical/HR/Behavioral AI mock interviews |
| **Learning** | DSA, System Design, DBMS, OS, Networks, Cloud, Security |
| **Contests** | Weekly challenges, leaderboards, certificates |
| **Jobs** | Browse/apply, recruiter posting |
| **Mentors** | Book sessions, Zoom/Meet links |
| **Community** | Forums, upvotes, comments |
| **Analytics** | Radar, pie, line charts, heatmaps |
| **Gamification** | XP, streaks, badges, levels |
| **Admin** | Users, revenue, placement stats |

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Recharts, Monaco
- **Backend:** Node.js, Express 5, Prisma, PostgreSQL, Redis, Socket.io
- **AI:** FastAPI, OpenAI / Gemini
- **Execution:** Judge0 API
- **Deploy:** Vercel (web), AWS/Render (API), Docker, GitHub Actions

## Project Structure

```
placepro-ai/
├── apps/
│   ├── web/           # Next.js frontend
│   ├── api/           # Express REST API
│   └── ai-service/    # FastAPI AI microservice
├── packages/
│   ├── database/      # Prisma schema & client
│   └── shared/        # Shared types & constants
├── docker-compose.yml
└── .github/workflows/
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- Python 3.12 (for AI service)

### 1. Clone & install

```bash
cd placepro-ai
cp .env.example .env
npm install
```

### 2. Database

```bash
# Start Postgres + Redis
docker compose up postgres redis -d

# Push schema & seed
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Run services

```bash
# Terminal 1 — API
npm run dev:api

# Terminal 2 — Web
npm run dev:web

# Terminal 3 — AI (optional)
cd apps/ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```

- **Web:** http://localhost:3000
- **API:** http://localhost:4000/health
- **AI:** http://localhost:8000/health

### Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@placepro.ai | password123 |
| Admin | admin@placepro.ai | password123 |

## Environment Variables

See [`.env.example`](.env.example) for full list:

- `DATABASE_URL` — PostgreSQL connection
- `JWT_SECRET` — API authentication
- `JUDGE0_API_KEY` — Code execution
- `OPENAI_API_KEY` / `GEMINI_API_KEY` — AI features
- `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID` — OAuth

## API Overview

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Register, login, OTP, OAuth, reset password |
| `/api/dashboard` | Student stats & insights |
| `/api/coding` | Problems, run, submit, discussions |
| `/api/aptitude` | Questions, quizzes, analytics |
| `/api/resume` | Upload & AI analysis |
| `/api/interviews` | Mock interview sessions |
| `/api/learning` | Courses & progress |
| `/api/contests` | Contests & leaderboards |
| `/api/jobs` | Jobs & applications |
| `/api/mentors` | Mentor booking |
| `/api/community` | Posts, comments, upvotes |
| `/api/career` | AI career plans |
| `/api/admin` | Admin analytics |

## Deployment

### Vercel (Frontend)

```bash
cd apps/web
vercel --prod
```

Set `NEXT_PUBLIC_API_URL` to your production API URL.

### Docker (Full stack)

```bash
docker compose up --build
```

### Production checklist

- [ ] Rotate `JWT_SECRET` and `NEXTAUTH_SECRET`
- [ ] Configure production PostgreSQL & Redis
- [ ] Set Judge0 API key
- [ ] Configure S3 for resume uploads
- [ ] Enable Stripe/Razorpay webhooks
- [ ] Set CORS `FRONTEND_URL` on API

## License

Proprietary — PlacePro AI © 2026
=======
# PLACE_PRO
>>>>>>> 14afa875615c34d7da0a6b729596b88de44f4b5c
