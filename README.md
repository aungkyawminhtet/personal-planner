# 🎯 Personal Planner — AI Study Mentor

An AI-powered personal planner that turns your learning goals into structured roadmaps. Describe a goal, get a step-by-step roadmap from Google Gemini, track your progress on a gamified curved path, and consult an AI mentor to stay on pace.

Built as a streamlined, **frontend-only Next.js application** utilizing client-side persistence and API routes for AI integration. No complex database setups or external backend servers required.

---

## ✨ Features

- **🗺️ Gamified Missions Roadmap** — A Duolingo-style winding road timeline with smooth cubic-bezier SVG curved path lines connecting circular milestones. Alternate toggle lets you view a traditional detail checklist instantly.
- **⚡ AI Plan Generation** — Describe what you want to learn, and the app builds a multi-step roadmap with tasks, estimated durations, and difficulty levels.
- **🎓 Task Study Assistant** — Click any mission circle or card to open study help. Engage in a context-aware chat drawer for individual tasks to get step-by-step guides, code examples, or quick explanations.
- **💬 AI Mentor Chat** — Conversational project mentor that analyzes your pacing, notices overdue steps, and suggests plan adjustments.
- **🛡️ Resilient Gemini Fallback Engine** — Multi-model failover wrapper that catches quota limits (429), model missing (404), or server overload (503) errors and transparently switches to secondary active models in real-time.
- **📝 Task Notes** — Add and update personal markdown notes on any milestone to track references and links.
- **📊 Interactive Dashboard** — Clean visual analytics, daily missions list, overdue task reminders, and accomplishments history.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| **State & Persistence** | Zustand (automatically persisted to LocalStorage) |
| **API / AI Integration** | `@google/generative-ai` with multi-model failover |
| **Validation** | React Hook Form, Zod |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```text
personal-planner/
├── frontend/                 # Streamlined Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/          # Next.js Route Handlers (API endpoints for Gemini AI)
│   │   │   │   ├── generate-plan/
│   │   │   │   ├── mentor/
│   │   │   │   └── tasks/
│   │   │   ├── dashboard/    # Analytics, Daily Missions, & Overdue Alerts
│   │   │   ├── project/[id]/ # Roadmap details with Map Path & Checklist views + AI Mentor
│   │   │   └── page.tsx      # Root route: Goal Generation Form
│   │   ├── components/       # Shared UI components (TaskChatDrawer, AppLayout)
│   │   ├── lib/              # AI SDK wrapper & multi-model fallback list
│   │   ├── store/            # Client-side Zustand state store (PlannerStore)
│   │   └── types/            # TypeScript definitions
│   ├── package.json
│   └── tsconfig.json
├── docs/                     # Design document assets
├── report.md                 # Project design report
├── CLAUDE.md                 # Guidelines and build rules
└── README.md                 # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Google Gemini API key** — obtain one at [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Setup Environment

Create a `.env` file inside the `frontend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ Replace `your_gemini_api_key_here` with your actual Google AI Studio API key.

### 2. Install & Start Development Server

```bash
# Navigate to frontend folder
cd frontend

# Install package dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Application Routes

* **`/` (Generate Goal)**: Root landing page. Input your learning target, daily available time, current experience level, and preferred speed.
* **`/dashboard`**: Unified landing dashboard tracking daily missions, visual task progress gauges, overdue warnings, and completed achievements.
* **`/project/[id]`**: Core roadmap explorer. Features:
  * Toggle between **🗺️ Map Path** (winding timeline) and **📋 Checklist** views.
  * Interactive task details popovers with rescheduling, note attachments, difficulty simplification, and Study Help triggers.
  * Sidebar AI Mentor chat container.

---

## 🛠️ Development & Build Tasks

From the `frontend/` directory:

```bash
npm run dev      # Start Next.js development server (port 3000)
npm run build    # Build optimized production bundle & check TypeScript types
npm run start    # Start built production server
```
