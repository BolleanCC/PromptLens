import { z } from 'zod'

export const evaluationRequestSchema = z.object({
  userPrompt: z.string().min(5, 'Prompt must be at least 5 characters'),
  model: z.string().optional().default('gpt-4.1-mini'),
  taskType: z.string().optional().default('general'),
  evaluationMode: z.string().optional().default('balanced'),
})

export const graderResultSchema = z.object({
  score: z.number().min(0).max(100),
  grade: z.enum(['Poor', 'Fair', 'Good', 'Excellent']),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  improved_prompt: z.string(),
})

export type EvaluationRequest = z.infer<typeof evaluationRequestSchema>
export type GraderResult = z.infer<typeof graderResultSchema>
