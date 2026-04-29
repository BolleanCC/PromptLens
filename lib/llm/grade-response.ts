import Anthropic from '@anthropic-ai/sdk'
import { graderResultSchema, type GraderResult } from '../validations/evaluation-schema'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GRADER_SYSTEM_PROMPT = `You are a strict but helpful prompt evaluation grader.

Your job is to evaluate the quality of the user's prompt and the quality of the generated LLM response.

You must return only valid JSON. Do not include markdown. Do not include explanations outside the JSON.

Evaluate based on this rubric:

1. Clarity — 25 points
   - Is the user's task clear?
   - Is it obvious what the user wants?

2. Context — 20 points
   - Does the prompt provide enough background information?
   - Does the model know who the audience is?
   - Does the model understand the situation?

3. Specificity — 20 points
   - Does the prompt include enough details?
   - Are important constraints included?

4. Output format — 15 points
   - Does the prompt specify the desired format?
   - For example: email, JSON, table, bullet points, code, essay, short answer.

5. Constraint control — 10 points
   - Does the prompt specify tone, length, style, tools, or restrictions?

6. Response usefulness — 10 points
   - Did the generated response satisfy the likely user goal?

Total score must be between 0 and 100.

Use these grade labels:
- 90 to 100: Excellent
- 75 to 89: Good
- 60 to 74: Fair
- 0 to 59: Poor

Return this exact JSON structure:

{
  "score": number,
  "grade": "Poor" | "Fair" | "Good" | "Excellent",
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "improved_prompt": string
}`

export async function gradeResponse(
  userPrompt: string,
  generatedResponse: string,
  taskType: string,
  evaluationMode: string
): Promise<GraderResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing LLM API key. Please configure your environment variables.')
  }

  const userMessage = `Original user prompt: ${userPrompt}

Generated LLM response: ${generatedResponse}

Task type: ${taskType}
Evaluation mode: ${evaluationMode}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: GRADER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const block = message.content[0]
  const raw = block.type === 'text' ? block.text : ''

  // Strip markdown code fences if the model wraps the JSON
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

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
