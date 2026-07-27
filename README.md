# PlacePro AI

[![CI](https://img.shields.io/github/actions/workflow/status/placepro/placepro-ai/ci.yml?label=CI)](https://github.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748)](https://www.prisma.io)

**World-class AI-powered placement preparation platform** — compete with LeetCode, HackerRank, InterviewBit, GeeksforGeeks, and Unstop.

![PlacePro Dashboard](docs/screenshots/dashboard.png)

> Add screenshots to `docs/screenshots/` for the README gallery.

## Platform Highlights

| Module | Capabilities |
|--------|----------------|
| **AI Career Coach** | Career score, skill radar, 30/60/90 roadmaps, placement probability, salary insights, live chat |
| **Resume Builder** | ATS templates, AI content, PDF export, versioning, job tailoring |
| **Company Prep Hub** | 14 companies (Google → Capgemini), rounds, DSA, HR, timelines, salary bands |
| **Interview Experiences** | UGC community, upvote/downvote, save, share, search, trending |
| **Recruiter Portal** | Jobs, candidates, ATS, interviews, analytics |
| **AI Roadmap** | Daily/weekly/monthly tasks, milestones, 6 target roles |
| **Job Match** | Resume vs JD, match %, skill gaps |
| **Cover Letter AI** | Personalized letters, PDF export |
| **Coding Battles** | 1v1 & multiplayer matchmaking, leaderboards |
| **Analytics** | Radar, heatmaps, readiness trends (live data) |
| **Coding + Contests** | Monaco, Judge0, leaderboards |
| **Networking & Referrals** | AI outreach, referral marketplace |

## Architecture

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for diagrams, API map, and deployment strategy.

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│  Next.js    │────▶│  Express API │────▶│  PostgreSQL    │
│  Web App    │     │  + Socket.io │     │  (Prisma)      │
└─────────────┘     └──────┬───────┘     └────────────────┘
                           │
                    ┌──────▼───────┐     ┌────────────────┐
                    │ FastAPI AI   │     │ Redis + Judge0 │
                    └──────────────┘     └────────────────┘
```

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Recharts, Monaco
- **Backend:** Node.js, Express 5, Prisma, PostgreSQL, Redis, Socket.io
- **AI:** FastAPI, OpenAI / Gemini
- **Execution:** Judge0
- **Deploy:** Vercel, Docker, GitHub Actions

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- Python 3.12 (optional, for AI service)

### Install

```bash
git clone <repo-url> placepro-ai
cd placepro-ai
cp .env.example .env
npm install
```

### Database

```bash
docker compose up postgres redis -d
npm run db:generate
npm run db:push
npm run db:seed
```

### Run

```bash
npm run dev:api    # http://localhost:4000
npm run dev:web    # http://localhost:3000
```

AI service (optional):

```bash
cd apps/ai-service && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Guest mode

Click **Guest** in the dashboard header or use token `placepro-demo-token` — works without database for demos.

## API Documentation

| Endpoint | Description |
|----------|-------------|
| `POST /api/career-coach` | Chat, insights, sessions |
| `GET /api/career-coach/dashboard` | Career score, roadmaps, radar |
| `POST /api/resume-builder/*` | Build, score, export PDF |
| `GET /api/company-prep` | Company hub tracker |
| `GET/POST /api/interview-experiences` | Community experiences |
| `POST /api/coding-battles/matchmake` | 1v1 / multiplayer battles |
| `GET /api/analytics` | Student analytics dashboard |
| `POST /api/job-match` | AI job matching |
| `POST /api/cover-letter` | Cover letter generation |
| `POST /api/salary-predictor` | Salary prediction |
| `GET /api/recruiter/*` | Recruiter portal |

Full route list: `apps/api/src/app.ts`

## Database Schema

60+ Prisma models including: `User`, `CodingProblem`, `Submission`, `Contest`, `Job`, `RecruiterProfile`, `InterviewExperience`, `CodingBattle`, `PlacementRoadmap`, `ResumeBuilderDocument`, `CareerCoachSession`, and more.

Schema: `packages/database/prisma/schema.prisma`

## Deployment

### Docker (full stack)

```bash
docker compose up --build
```

### Vercel (frontend)

```bash
cd apps/web && vercel --prod
```

Set `NEXT_PUBLIC_API_URL` to production API.

### Production checklist

- [ ] Rotate `JWT_SECRET`
- [ ] Production PostgreSQL + Redis
- [ ] Judge0 API key
- [ ] OpenAI/Gemini keys
- [ ] S3 for file uploads
- [ ] CORS `FRONTEND_URL` on API

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push and open a PR

Follow existing patterns: `{ success, data }` API responses, Zod validation, guest demo fallbacks.

## Roadmap

- [ ] E2E test suite (Playwright)
- [ ] Stripe/Razorpay subscriptions
- [ ] Push notifications
- [ ] Mobile PWA
- [ ] 5000+ coding problems seed pipeline
- [ ] Live coding battle sockets + ELO

## License

Proprietary — PlacePro AI © 2026
