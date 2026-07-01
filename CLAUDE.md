# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered personal planner and study mentor. Users define learning goals, Google Gemini generates step-by-step roadmaps, and an interactive AI mentor provides guidance. Frontend-only Next.js app — all data lives in-memory (Zustand store) and resets on browser refresh.

## Running the Project

**Frontend** (from `frontend/`):
```bash
npm run dev      # Next.js dev server (port 3000)
npm run build    # Production build via next build
npm start        # Production server
npm run lint     # ESLint
```

**Prerequisites:** `GEMINI_API_KEY` set in `frontend/.env.local`.

No backend, no database, no authentication. The app works immediately on open.

## Architecture

### Frontend (`frontend/src/`)

Next.js 16 App Router with in-memory state management via Zustand.

- `app/page.tsx` — Goal creation form (landing page, uses React Hook Form + Zod)
- `app/dashboard/page.tsx` — Analytics, today's tasks, notifications, active goals
- `app/project/[id]/page.tsx` — Task checklist + AI mentor chat + pacing analysis
- `app/api/generate-plan/route.ts` — Gemini API route for plan generation
- `app/api/mentor/ask/route.ts` — Gemini API route for mentor chat
- `app/api/mentor/analyze/route.ts` — Gemini API route for pacing analysis
- `app/api/tasks/[id]/ask/route.ts` — Gemini API route for task assistant
- `app/api/tasks/[id]/reduce-difficulty/route.ts` — Gemini API route for task simplification
- `components/AppLayout.tsx` — Sidebar + top navbar (no auth)
- `components/TaskChatDrawer.tsx` — Slide-out drawer for per-task AI chat
- `store/usePlannerStore.ts` — Zustand store holding all app data (projects, tasks, notifications, chat)
- `lib/gemini.ts` — Shared Gemini API client
- `types/index.ts` — Shared TypeScript interfaces

**Styling:** Tailwind CSS 4, violet/indigo gradient scheme, glass-morphism effects, smooth transitions.

**Data flow:** All CRUD operations happen in Zustand. AI features call Next.js API routes which proxy to Google Gemini. No server-side persistence — data resets on browser refresh.

## Key Conventions

- Frontend port: 3000.
- All data is in-memory via Zustand — no localStorage, no database.
- AI calls go through Next.js API routes (`/api/...`) — never expose the API key to the client.
- Path alias: `@/*` maps to `frontend/src/*`.
- Gemini model: `gemini-2.0-flash` via `@google/generative-ai` SDK.
