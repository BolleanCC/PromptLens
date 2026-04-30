import { NextRequest, NextResponse } from 'next/server'
import { evaluationRequestSchema } from '@/lib/validations/evaluation-schema'
import { generateResponse } from '@/lib/llm/generate-response'
import { gradeResponse } from '@/lib/llm/grade-response'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth/session'

type StreamEvent =
  | { type: 'status'; message: string }
  | { type: 'result'; data: unknown }
  | { type: 'error'; message: string }

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

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: StreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(evt) + '\n'))
      }

      try {
        send({ type: 'status', message: 'Prompt received' })
        send({ type: 'status', message: 'Analyzing prompt structure' })

        send({ type: 'status', message: 'Generating a sample response' })
        const generatedResponse = await generateResponse(userPrompt, model)

        send({ type: 'status', message: 'Evaluating clarity and specificity' })
        send({ type: 'status', message: 'Generating improvement suggestions' })
        const graderResult = await gradeResponse(
          userPrompt,
          generatedResponse,
          taskType ?? 'general',
          evaluationMode ?? 'balanced'
        )

        send({ type: 'status', message: 'Building final score card' })

        const evaluation = await prisma.promptEvaluation.create({
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

        send({ type: 'result', data: evaluation })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Evaluation failed'
        send({ type: 'error', message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      // Helps some reverse proxies avoid buffering.
      'X-Accel-Buffering': 'no',
    },
  })
}

