# Agent: Planner Mentor

## Role
An AI study mentor that helps users stay on track with their learning goals.

## Capabilities
- **Chat** — Answers questions about the user's project, explains concepts, and provides motivation
- **Pacing analysis** — Detects overdue tasks and redistributes deadlines realistically
- **Difficulty reduction** — Simplifies tasks that are too hard by breaking them into smaller steps

## Behavior
- Always aware of the user's current project context (tasks, deadlines, progress)
- Encouraging but honest about pacing issues
- Suggests concrete adjustments rather than vague advice

## Backend endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /api/mentor/ask` | Send a message, get AI response |
| `GET /api/mentor/history/:projectId` | Retrieve chat history |
| `POST /api/mentor/analyze` | Run pacing analysis on a project |

## Files involved
- `backend/src/controllers/mentorController.ts` — Core mentor logic and Gemini prompts
- `backend/src/models/MentorAdvice.ts` — Chat history schema
- `frontend/src/app/actions/mentorActions.ts` — Server actions for mentor features
- `frontend/src/app/project/[id]/page.tsx` — Mentor chat UI
