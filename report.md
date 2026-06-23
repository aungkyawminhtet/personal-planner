# Chapter 3 — Personal Project Report

**Repo:** [aungkyawminhtet/personal-planner](https://github.com/aungkyawminhtet/personal-planner)

## What I Built

An AI-powered personal planner and study mentor. Users describe a learning goal, and Google Gemini generates a structured roadmap with tasks and deadlines. The app tracks progress, detects overdue tasks, and provides an interactive AI mentor chat for guidance.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Zustand |
| Backend | Express 5, MongoDB, Mongoose, JWT |
| AI | Google Gemini API (`gemini-3.5-flash`) |
| Tools | Claude Code, TypeScript |

## Key Features

- **AI Plan Generation** — Describe a goal, get a full roadmap with tasks, deadlines, and difficulty ratings
- **AI Mentor Chat** — Context-aware conversational mentor that knows your project
- **Pacing Analysis** — AI detects overdue tasks and redistributes deadlines
- **Dashboard** — Analytics, daily missions, overdue alerts, accomplishments
- **Difficulty Reduction** — AI simplifies tasks that are too hard

## How I Used Claude Code

- Scaffolded the full project structure (backend + frontend)
- Generated Mongoose schemas and Express routes
- Built Next.js App Router pages with server actions
- Designed the Gemini prompt engineering for plan generation and mentor chat
- Iterated on UI components with Tailwind CSS

## Challenges

- Crafting effective Gemini prompts that return consistently structured JSON
- Managing auth flow between Next.js server actions and Express JWT
- Handling overdue task detection and deadline redistribution logic

## What I Learned

- How to integrate LLM APIs into a full-stack application
- Next.js App Router patterns (server actions, server components vs client components)
- State management with Zustand alongside React Context for auth
