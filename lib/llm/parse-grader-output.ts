import { graderResultSchema, type GraderResult } from '../validations/evaluation-schema'

// Parse and validate the grader's raw text output.
// Kept separate from grade-response.ts so it can be tested without an API client.
export function parseGraderOutput(raw: string): GraderResult {
  // Strip markdown code fences if the model wraps the JSON
  const cleaned = raw.trim().replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('Grader returned invalid JSON.')
  }

  const result = graderResultSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`Grader response validation failed: ${result.error.message}`)
  }

  return result.data
}
