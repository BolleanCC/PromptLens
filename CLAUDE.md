# CLAUDE.md

## Project Name

PromptLens

## Project Overview

PromptLens is a full-stack prompt evaluation app.

The app helps users improve prompts by running the prompt through an LLM, generating a response, grading the prompt and response, and returning a clear score with improvement suggestions.

The main workflow is:

1. User enters a prompt.
2. App sends the prompt to an LLM generator.
3. LLM generator returns a response.
4. App sends the original prompt and generated response to a grader LLM.
5. Grader returns a structured evaluation.
6. App displays:
   - Generated response
   - Score from 0 to 100
   - Grade label
   - Summary
   - Strengths
   - Weaknesses
   - Suggestions
   - Improved prompt
7. App saves the evaluation history.

The goal is not only to score prompts, but also to explain why a prompt works or does not work.

---

## Tech Stack

Use the following stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Prisma
- PostgreSQL
- OpenAI or Anthropic compatible LLM API

Use simple, clean, readable code.

Do not over-engineer.

---

## Core Product Requirements

PromptLens must allow users to:

1. Enter a prompt.
2. Select task type.
3. Select model.
4. Select evaluation mode.
5. Run evaluation.
6. View the generated LLM response.
7. View a score from 0 to 100.
8. View a grade label:
   - Poor
   - Fair
   - Good
   - Excellent
9. View reasons for the score.
10. View strengths of the prompt.
11. View weaknesses of the prompt.
12. View improvement suggestions.
13. View an improved version of the prompt.
14. Copy the improved prompt.
15. View previous evaluations in history.
16. Open a detail page for each evaluation.

---

## Important Evaluation Principle

The grader must evaluate both:

1. The quality of the user's prompt.
2. The quality of the generated LLM response.

Sometimes the response is weak because the prompt is vague.

Example:

```txt
Write this better.