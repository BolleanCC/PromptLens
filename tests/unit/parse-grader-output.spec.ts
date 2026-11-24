import { test, expect } from '@playwright/test'
import { parseGraderOutput } from '@/lib/llm/parse-grader-output'

const graderJson = JSON.stringify({
  score: 45,
  grade: 'Poor',
  summary: 'The prompt is too vague.',
  strengths: [],
  weaknesses: ['No context', 'No target text'],
  suggestions: ['Include the text to rewrite'],
  improved_prompt: 'Rewrite the following paragraph for a professional audience: ...',
})

test.describe('parseGraderOutput', () => {
  test('parses plain JSON', () => {
    const result = parseGraderOutput(graderJson)

    expect(result.score).toBe(45)
    expect(result.grade).toBe('Poor')
    expect(result.weaknesses).toHaveLength(2)
  })

  test('strips ```json code fences', () => {
    const result = parseGraderOutput('```json\n' + graderJson + '\n```')
    expect(result.score).toBe(45)
  })

  test('strips bare ``` code fences and surrounding whitespace', () => {
    const result = parseGraderOutput('\n  ```\n' + graderJson + '\n```  \n')
    expect(result.score).toBe(45)
  })

  test('throws on non-JSON output', () => {
    expect(() => parseGraderOutput('Here is my evaluation: great prompt!')).toThrow(
      'Grader returned invalid JSON.'
    )
  })

  test('throws on truncated JSON', () => {
    expect(() => parseGraderOutput(graderJson.slice(0, 40))).toThrow(
      'Grader returned invalid JSON.'
    )
  })

  test('throws when JSON does not match the schema', () => {
    const bad = JSON.stringify({ score: 'high', grade: 'Poor' })
    expect(() => parseGraderOutput(bad)).toThrow('Grader response validation failed')
  })
})
