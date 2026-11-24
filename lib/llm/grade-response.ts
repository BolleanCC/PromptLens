import Anthropic from '@anthropic-ai/sdk'
import {
  graderResultSchema,
  type EvaluationMode,
  type GraderResult,
} from '../validations/evaluation-schema'

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

const MODE_INSTRUCTIONS: Record<EvaluationMode, string> = {
  strict: `Evaluation mode: STRICT
- Do not give the benefit of the doubt. If a criterion is not explicitly addressed in the prompt, award 0 points for it.
- Treat anything implied but not stated (audience, format, length, tone) as missing.
- A score of 90 or above requires every criterion to be explicitly and fully satisfied.
- List every weakness you find, including minor ones.`,

  balanced: `Evaluation mode: BALANCED
- Award partial credit when a criterion is partly addressed or reasonably implied by the task.
- Judge the prompt against what a typical user would need for this task type.
- Focus weaknesses and suggestions on the issues that most affect the response quality.`,

  lenient: `Evaluation mode: LENIENT
- Give the benefit of the doubt: if missing details can be reasonably inferred from the task, award most of the points for that criterion.
- Do not penalize missing output format or constraints for simple, casual tasks where defaults are acceptable.
- Limit weaknesses and suggestions to the 1-2 most impactful improvements, phrased encouragingly.`,
}

export async function gradeResponse(
  userPrompt: string,
  generatedResponse: string,
  taskType: string,
  evaluationMode: EvaluationMode
): Promise<GraderResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing LLM API key. Please configure your environment variables.')
  }

  const userMessage = `Original user prompt: ${userPrompt}

Generated LLM response: ${generatedResponse}

Task type: ${taskType}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    temperature: 0,
    system: `${GRADER_SYSTEM_PROMPT}\n\n${MODE_INSTRUCTIONS[evaluationMode]}`,
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
