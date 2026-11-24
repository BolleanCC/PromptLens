# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PromptLens is a full-stack prompt evaluation app. A user submits a prompt; the app runs it through a generator LLM, then sends the prompt + generated response to a grader LLM, which returns a score (0–100), grade label (Poor / Fair / Good / Excellent), summary, strengths, weaknesses, suggestions, and an improved prompt. Every evaluation is saved to the user's history. The goal is not only to score prompts but to explain *why* a prompt works or doesn't.

**Evaluation principle:** the grader must judge both the prompt and the response. A weak response is often caused by a vague prompt (e.g. `Write this better.` with no text, audience, or goal) — the grader should attribute blame to the prompt in that case, not just the output.

Keep code simple, clean, and readable. Do not over-engineer.

## Next.js Version Warning (from AGENTS.md)

This project uses **Next.js 16** with React 19. APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices.

## Commands

```bash
npm run dev          # start dev server on http://localhost:3000
npm run build        # prisma generate && next build
npm run lint         # eslint .
npx prisma db push   # sync prisma/schema.prisma to the database (no migrations dir is used)
npx prisma studio    # browse the DB
```

Tests use Playwright Test with two projects (see `playwright.config.ts`):

```bash
npm run test:unit                          # tests/unit — pure logic in Node, no browser/server/DB
npm run test:e2e                           # tests/e2e — starts `npm run dev`, signed-out smoke tests only
npx playwright test tests/unit/auth.spec.ts --project=unit   # single file
npx playwright test -g "rejects unknown" --project=unit      # single test by name
```

Unit tests import app code via the `@/` alias. Playwright has no module mocking, so functions that call the Anthropic API (`lib/llm/generate-response.ts`, `grade-response.ts`) aren't unit-tested; keep testable logic in separate pure modules (e.g. `lib/llm/parse-grader-output.ts`). `npm run test:e2e` needs Chromium first: `npx playwright install chromium`.

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, `npm run test:unit`, and `npm run build` on pushes to `main` and on PRs; none of these need env vars. Required env vars (in `.env`): `DATABASE_URL` (Neon Postgres) and `ANTHROPIC_API_KEY`.

## Architecture

### Evaluation pipeline (the core flow)

`components/prompt-eval-form.tsx` → `POST /api/evaluate` (`app/api/evaluate/route.ts`) → `lib/llm/generate-response.ts` → `lib/llm/grade-response.ts` → `prisma.promptEvaluation.create`.

- The API route **streams newline-delimited JSON** (`text/plain`), not a single JSON response. Each line is `{type: 'status', message}`, `{type: 'result', data}` (the saved `PromptEvaluation` row), or `{type: 'error', message}`. The form reads the body with `getReader()` and drives the progress UI (`components/evaluation/EvaluationProgressCard.tsx`) from status events. Any change to event shapes must be made on both sides.
- Auth/validation failures before streaming starts return normal JSON with 401/400.
- `userId` always comes from the server session (`getUser()`), never the client.
- The generator uses whatever `model` the client selected; the **grader is hard-coded** to `claude-haiku-4-5-20251001` with a rubric in `GRADER_SYSTEM_PROMPT` (Clarity 25, Context 20, Specificity 20, Output format 15, Constraint control 10, Response usefulness 10). The grader runs at `temperature: 0`. `evaluationMode` (`strict | balanced | lenient`, enforced by Zod) selects a block of grading rules from `MODE_INSTRUCTIONS` that is appended to the system prompt; `taskType` is passed as plain text in the user message.
- The grader is asked for raw JSON; `parseGraderOutput` (`lib/llm/parse-grader-output.ts`) strips markdown fences, `JSON.parse`s, then validates with `graderResultSchema` (`lib/validations/evaluation-schema.ts`). Note the grader's key is `improved_prompt` (snake_case) while the DB column is `improvedPrompt`.
- `strengths`, `weaknesses`, `suggestions` are stored as Prisma `Json` columns (string arrays).

Known inconsistencies to be aware of:
- Grade thresholds in `GRADER_SYSTEM_PROMPT` (Excellent 90+, Good 75–89, Fair 60–74, Poor <60) differ from the README (Good 70–89, Fair 50–69, Poor <50).
- `evaluationRequestSchema` defaults `model` to `gpt-4.1-mini`, which the Anthropic SDK can't serve; the form always sends a Claude model ID, so the default is only hit by raw API calls.
- The per-criterion bars (Clarity, Specificity, etc.) on the result card are derived from the total score in `components/prompt-eval-form.tsx`; the grader does not return per-criterion scores.

### Auth (custom, no auth library)

- Email + password (bcrypt) with DB-backed sessions: `User`, `Session` (random token, 7-day expiry), `Account` (`providerId: "credential"`, `passwordHash`). Session token lives in the HTTP-only cookie `session_token`.
- `middleware.ts` runs on the Edge and **only checks the cookie exists** for `/dashboard`, `/evaluate`, `/history` (Prisma can't run there). Real verification is `getUser()` from `lib/auth/session.ts`, which every protected page and API route must call itself.
- `lib/auth/rate-limit.ts` is a fixed-window limiter backed by an in-memory store (`kv-cache.ts`) — per-instance only, and it fails open. Sign-up returns fake success on duplicate emails; sign-in always runs bcrypt to avoid timing leaks — preserve both behaviors.

### Data & UI

- `lib/db.ts` exports a global Prisma singleton (`prisma`); import it rather than creating clients.
- History pages (`app/history`, `app/history/[id]`) are server components that query `PromptEvaluation` scoped to the current user.
- shadcn/ui is configured with the `base-nova` style, so `components/ui/*` are built on **Base UI (`@base-ui/react`), not Radix** — component APIs (e.g. `Select`'s `onValueChange` can pass `null`) differ from typical shadcn/Radix examples. See `.agents/skills/shadcn/rules/base-vs-radix.md`. Add components with `npx shadcn@latest add <name>`.
- Tailwind CSS v4 (config lives in `app/globals.css`, no `tailwind.config`). Path alias `@/*` maps to the repo root.
