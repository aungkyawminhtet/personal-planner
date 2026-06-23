# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered personal planner and study mentor. Users define learning goals, Google Gemini generates step-by-step roadmaps, and an interactive AI mentor provides guidance. Two independent TypeScript apps (backend + frontend) with no monorepo tooling.

## Running the Project

**Backend** (from `backend/`):
```bash
npm run dev      # Dev server via nodemon + ts-node (port 5001)
npm run build    # Compile to dist/ via tsc
npm start        # Production server via node dist/index.js
```

**Frontend** (from `frontend/`):
```bash
npm run dev      # Next.js dev server (port 3000)
npm run build    # Production build via next build
npm start        # Production server
npm run lint     # ESLint
```

**Prerequisites:** MongoDB running locally, `GEMINI_API_KEY` set in `backend/.env`. A demo user is seeded on startup (`mentor@example.com` / `password123`).

No test framework is configured in either app.

## Architecture

### Backend (`backend/src/`)

Express 5 MVC pattern: **routes → controllers → Mongoose models**. JWT auth via `Authorization: Bearer` header; all protected routes use `authMiddleware`.

- `models/` — User, Project, Task, MentorAdvice, Notification (Mongoose schemas)
- `controllers/` — Business logic. `aiController.ts` and `mentorController.ts` call Gemini API (`gemini-3.5-flash`)
- `routes/` — Route definitions, all prefixed with `/api`
- `middleware/auth.ts` — JWT verification middleware
- `dbs/init.mongodb.ts` — MongoDB connection
- `index.ts` — Entry point, route registration, DB seeding

Three AI features: **plan generation** (goal → roadmap + tasks), **mentor chat** (context-aware conversation), **pacing analysis** (redistributes overdue deadlines).

### Frontend (`frontend/src/`)

Next.js 16 App Router. Key pattern: **Server Actions** in `src/app/actions/` — all API calls go through `'use server'` functions that read JWT from HTTP cookies and proxy to the backend.

- `app/page.tsx` — Goal creation form (main entry, uses React Hook Form + Zod)
- `app/dashboard/page.tsx` — Analytics, today's tasks, notifications
- `app/project/[id]/page.tsx` — Task checklist + AI mentor chat
- `app/login/`, `app/register/` — Auth pages
- `components/AppLayout.tsx` — Sidebar + top navbar with auth guards
- `context/AuthContext.tsx` — React Context for auth state, redirects unauthenticated users
- `store/usePlannerStore.ts` — Zustand store for notifications

**Styling:** Tailwind CSS 4, violet/indigo color scheme, glass-morphism (backdrop-blur, transparency).

## Key Conventions

- Backend port: 5001. Frontend port: 3000.
- All frontend API calls go through server actions in `src/app/actions/` — never call the backend directly from client components.
- Protected pages use `AuthContext` which redirects to `/login` if no valid session.
- Path alias: `@/*` maps to `frontend/src/*`.
- No root-level `package.json` — each app is managed independently from its own directory.
