# Skill: Generate Learning Plan

## Description
Generate a personalized learning roadmap from a user's goal description using Google Gemini AI.

## When to use
When a user submits a new learning goal and needs a structured, step-by-step plan with tasks, deadlines, and difficulty levels.

## How it works
1. User provides a goal description (e.g., "Learn React in 30 days")
2. The skill calls the Gemini API via the backend `/api/generate-plan` endpoint
3. Gemini returns a structured roadmap with:
   - Project title and summary
   - Ordered tasks with deadlines, difficulty ratings, and notes
4. Tasks are saved to MongoDB and linked to the user's project

## Inputs
- `goal` (string) — The learning goal description
- `preferences` (object, optional) — User preferences (pace, focus areas)

## Outputs
- A `Project` document with an array of `Task` documents
- Each task has: `title`, `description`, `deadline`, `difficulty` (1-5), `notes`

## Files involved
- `backend/src/controllers/aiController.ts` — Gemini API call and response parsing
- `backend/src/routes/ai.ts` — POST `/api/generate-plan`
- `frontend/src/app/actions/planActions.ts` — Server action that calls the endpoint
- `frontend/src/app/page.tsx` — Goal creation form (React Hook Form + Zod)
