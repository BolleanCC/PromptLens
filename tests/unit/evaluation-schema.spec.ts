import { test, expect } from '@playwright/test'
import {
  evaluationRequestSchema,
  graderResultSchema,
} from '@/lib/validations/evaluation-schema'

const validGraderResult = {
  score: 82,
  grade: 'Good',
  summary: 'Clear task with minor gaps.',
  strengths: ['Clear goal'],
  weaknesses: ['No output format'],
  suggestions: ['Specify the format'],
  improved_prompt: 'Write a 3-paragraph email...',
}

test.describe('evaluationRequestSchema', () => {
  test('applies defaults for optional fields', () => {
    const result = evaluationRequestSchema.parse({ userPrompt: 'Write an email to my boss' })

    expect(result.taskType).toBe('general')
    expect(result.evaluationMode).toBe('balanced')
  })

  test('rejects prompts shorter than 5 characters', () => {
    const result = evaluationRequestSchema.safeParse({ userPrompt: 'hi' })
    expect(result.success).toBe(false)
  })

  for (const mode of ['strict', 'balanced', 'lenient']) {
    test(`accepts evaluation mode "${mode}"`, () => {
      const result = evaluationRequestSchema.safeParse({
        userPrompt: 'Write an email to my boss',
        evaluationMode: mode,
      })
      expect(result.success).toBe(true)
    })
  }

  test('rejects unknown evaluation modes', () => {
    const result = evaluationRequestSchema.safeParse({
      userPrompt: 'Write an email to my boss',
      evaluationMode: 'super-strict',
    })
    expect(result.success).toBe(false)
  })
})

test.describe('graderResultSchema', () => {
  test('accepts a valid grader result', () => {
    expect(graderResultSchema.safeParse(validGraderResult).success).toBe(true)
  })

  test('rejects scores outside 0-100', () => {
    expect(graderResultSchema.safeParse({ ...validGraderResult, score: 101 }).success).toBe(false)
    expect(graderResultSchema.safeParse({ ...validGraderResult, score: -1 }).success).toBe(false)
  })

  test('rejects unknown grade labels', () => {
    const result = graderResultSchema.safeParse({ ...validGraderResult, grade: 'Great' })
    expect(result.success).toBe(false)
  })

  test('rejects results missing improved_prompt', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { improved_prompt, ...rest } = validGraderResult
    expect(graderResultSchema.safeParse(rest).success).toBe(false)
  })
})
