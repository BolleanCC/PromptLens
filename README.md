# PromptLens

A full-stack prompt evaluation app for developers and prompt engineers. Submit any AI prompt, get a generated response, and receive a detailed score with strengths, weaknesses, and an improved version — all powered by Claude.

---

## What it does

1. User enters a prompt, selects a task type, model, and evaluation mode
2. The app sends the prompt to a Claude model and gets a response
3. A second Claude call grades both the prompt and the response
4. The app returns a score (0–100), grade label, summary, strengths, weaknesses, improvement suggestions, and a rewritten prompt
5. Every evaluation is saved to the user's history

---

## Tech stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Framework | Next.js 16 (App Router)                         |
| Language  | TypeScript                                      |
| Styling   | Tailwind CSS v4 + shadcn/ui                     |
| Forms     | React Hook Form + Zod                           |
| Database  | PostgreSQL (Neon) via Prisma                    |
| LLM       | Anthropic Claude (Haiku, Sonnet, Opus)          |
| Auth      | Custom — bcrypt, HTTP-only cookies, DB sessions |

---

## Project structure

```
app/
├── page.tsx                    # Public landing page
├── sign-in/page.tsx            # Sign-in page
├── sign-up/page.tsx            # Sign-up page
├── dashboard/page.tsx          # User dashboard (protected)
├── evaluate/page.tsx           # Prompt evaluation (protected)
├── history/
│   ├── page.tsx                # Evaluation history list (protected)
│   └── [id]/page.tsx           # Evaluation detail (protected)
└── api/
    ├── evaluate/route.ts       # POST — run a prompt evaluation
    └── auth/
        ├── sign-in/route.ts
        ├── sign-up/route.ts
        ├── sign-out/route.ts
        └── session/route.ts

components/
├── auth/
│   ├── sign-in-form.tsx
│   ├── sign-up-form.tsx
│   └── sign-out-button.tsx
├── ui/                         # shadcn/ui base components
├── prompt-eval-form.tsx
├── score-card.tsx
├── generated-response-card.tsx
├── eval-result-card.tsx
└── evaluation-history-table.tsx

lib/
├── db.ts                       # Prisma singleton
├── utils.ts                    # cn() helper
├── auth/
│   ├── session.ts              # getUser(), cookie helpers
│   ├── password.ts             # hashPassword(), verifyPassword()
│   ├── rate-limit.ts           # Fixed-window rate limiter
│   └── kv-cache.ts             # In-memory KV store (rate limiter backend)
├── llm/
│   ├── generate-response.ts    # Calls Claude to generate a response
│   └── grade-response.ts       # Calls Claude to score prompt + response
└── validations/
    └── evaluation-schema.ts    # Zod schemas for API input/output

prisma/
└── schema.prisma               # User, Session, Account, PromptEvaluation

middleware.ts                   # Edge middleware — protects /evaluate, /history, /dashboard
```

---

## Database schema

**User** — email, name, emailVerified  
**Session** — token, expiresAt, userId  
**Account** — providerId (`"credential"`), passwordHash, userId  
**PromptEvaluation** — prompt, response, score, grade, analysis fields, userId

---

## Auth

- Email + password with bcrypt (cost 12)
- HTTP-only, `SameSite=Lax` session cookie (7-day expiry)
- Rate limiting on all auth endpoints:
  - Sign-in: 5 attempts / 15 min (keyed on IP + email)
  - Sign-up: 10 attempts / hour (keyed on IP)
  - Sign-out: 10 attempts / min
- Email enumeration protection on sign-up (fake success on duplicate)
- Timing-attack protection on sign-in (bcrypt always runs)
- Middleware cookie check on the Edge + DB session verification inside each protected page

---

## Evaluation grading

The grader uses Claude Haiku with a structured rubric:

| Criterion           | Points |
|---------------------|--------|
| Clarity             | 25     |
| Context             | 20     |
| Specificity         | 20     |
| Output format       | 15     |
| Constraint control  | 10     |
| Response usefulness | 10     |

Grade labels: **Poor** (0–49) · **Fair** (50–69) · **Good** (70–89) · **Excellent** (90–100)

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone the repository

```bash
git clone https://github.com/BolleanCC/PromptLens.git
cd PromptLens
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

Create a `.env` file in the project root. See the [Environment variables](#environment-variables) section for the full list.

```env
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Push the database schema

```bash
npx prisma db push
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable            | Required | Description                       |
|---------------------|----------|-----------------------------------|
| `DATABASE_URL`      | Yes      | Neon PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Yes      | Anthropic API key for Claude      |

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add `DATABASE_URL` and `ANTHROPIC_API_KEY` in the Vercel environment variables settings
4. Deploy — `prisma generate` runs automatically via the `postinstall` and `build` scripts

The Neon database is a shared cloud service — no additional database setup is required for deployment since you already ran `prisma db push` during local setup.
