import { NextRequest, NextResponse } from 'next/server'
import { evaluationRequestSchema } from '@/lib/validations/evaluation-schema'
import { generateResponse } from '@/lib/llm/generate-response'
import { gradeResponse } from '@/lib/llm/grade-response'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  // Auth check — userId comes from the server session, never from the client
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = evaluationRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { userPrompt, model, taskType, evaluationMode } = parsed.data

  let generatedResponse: string
  try {
    generatedResponse = await generateResponse(userPrompt, model)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate response'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  let graderResult: Awaited<ReturnType<typeof gradeResponse>>
  try {
    graderResult = await gradeResponse(
      userPrompt,
      generatedResponse,
      taskType ?? 'general',
      evaluationMode ?? 'balanced'
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to grade response'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  let evaluation
  try {
    evaluation = await prisma.promptEvaluation.create({
      data: {
        userId: user.id,
        userPrompt,
        generatedResponse,
        score: graderResult.score,
        grade: graderResult.grade,
        summary: graderResult.summary,
        strengths: graderResult.strengths,
        weaknesses: graderResult.weaknesses,
        suggestions: graderResult.suggestions,
        improvedPrompt: graderResult.improved_prompt,
        model: model ?? 'claude-haiku-4-5-20251001',
        taskType: taskType ?? 'general',
        evaluationMode: evaluationMode ?? 'balanced',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Evaluation completed, but saving failed.', result: graderResult, generatedResponse },
      { status: 500 }
    )
  }

  return NextResponse.json({ evaluation })
}
