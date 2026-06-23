# 🎯 Personal Planner — AI Study Mentor

An AI-powered personal planner that turns your learning goals into structured roadmaps. Define a goal, get a step-by-step plan from Google Gemini, track your progress, and chat with an AI mentor that keeps you on track.

## ✨ Features

- **AI Plan Generation** — Describe a goal, get a full roadmap with tasks, deadlines, and difficulty ratings
- **AI Mentor Chat** — Context-aware conversational mentor that knows your project
- **Pacing Analysis** — AI detects overdue tasks and redistributes deadlines automatically
- **Dashboard** — Analytics, daily missions, overdue alerts, and accomplishments tracking
- **Difficulty Reduction** — AI simplifies tasks that are too hard by breaking them down
- **Task Notes** — Add personal notes to any task
- **Notifications** — Overdue task alerts and system messages

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Zustand, React Hook Form, Zod |
| Backend | Express 5, MongoDB, Mongoose, JWT, bcryptjs |
| AI | Google Gemini API (`gemini-3.5-flash`) |
| Language | TypeScript (full stack) |

## 📁 Project Structure

```
personal-planner/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── controllers/      # Route handlers (auth, ai, project, task, mentor, analytics, notification)
│   │   ├── models/           # Mongoose schemas (User, Project, Task, MentorAdvice, Notification)
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/       # JWT auth middleware
│   │   ├── dbs/              # MongoDB connection
│   │   └── index.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── actions/      # Server actions (auth, plan, project, analytics, mentor, notification)
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   ├── login/        # Login page
│   │   │   ├── register/     # Registration page
│   │   │   └── project/[id]/ # Project detail page with task checklist + AI mentor
│   │   ├── components/       # Shared components (AppLayout)
│   │   ├── context/          # AuthContext (React Context)
│   │   └── store/            # Zustand store (notifications)
│   ├── package.json
│   └── tsconfig.json
├── slides/                   # Pitch deck
├── report.md                 # Chapter 3 report
├── CLAUDE.md                 # Claude Code guidance
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** running locally (or a remote connection string)
- **Google Gemini API key** — get one at [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the repo

```bash
git clone git@github.com:aungkyawminhtet/personal-planner.git
cd personal-planner
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5001
MONGO_URI=mongodb://admin:tour2026@localhost:27017/vibe_code_tour_db
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ Replace `GEMINI_API_KEY` with your actual key. Update `MONGO_URI` if your MongoDB setup differs.

Start the backend:

```bash
npm run dev
```

The API server runs at `http://localhost:5001`. On startup, it seeds a demo user:

- **Email:** `mentor@example.com`
- **Password:** `password123`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000) and register a new account, or log in with the demo credentials above.

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (auth required) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects with task counts |
| GET | `/api/projects/:id` | Get project with tasks |
| PATCH | `/api/projects/:id/complete` | Mark project as completed |
| DELETE | `/api/projects/:id` | Delete project and its tasks |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/overdue` | Get overdue tasks |
| PUT | `/api/tasks/:id` | Update task details |
| PATCH | `/api/tasks/:id/toggle` | Toggle task completion |
| PATCH | `/api/tasks/:id/reschedule` | Reschedule task deadline |
| PATCH | `/api/tasks/:id/notes` | Add/update task notes |
| PATCH | `/api/tasks/:id/reduce-difficulty` | AI simplifies the task |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-plan` | Generate a roadmap from a goal |

### Mentor
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mentor/ask` | Send message to AI mentor |
| GET | `/api/mentor/history/:projectId` | Get chat history |
| POST | `/api/mentor/analyze` | Run pacing analysis |

### Analytics & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Dashboard analytics data |
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications/read` | Mark all notifications read |
| POST | `/api/notifications/check-overdue` | Scan and create overdue notifications |

## 🔑 Pages

| Route | Description |
|-------|-------------|
| `/` | Goal creation form — describe what you want to learn |
| `/dashboard` | Overview with analytics, today's missions, notifications |
| `/project/[id]` | Project detail with task checklist and AI mentor chat |
| `/login` | Login page |
| `/register` | Registration page |

## 🛠️ Development Commands

### Backend (from `backend/`)

```bash
npm run dev      # Start dev server with nodemon (port 5001)
npm run build    # Compile TypeScript to dist/
npm start        # Run production build
```

### Frontend (from `frontend/`)

```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build
npm start        # Run production server
npm run lint     # Run ESLint
```

## 📄 License

This project was built as part of the Vibe Code Tour — Chapter 3.
