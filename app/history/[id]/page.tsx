export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScoreCard } from '@/components/score-card'
import { GeneratedResponseCard } from '@/components/generated-response-card'
import { EvalResultCard } from '@/components/eval-result-card'

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const { id } = await params

  // Filter by both id and userId — prevents accessing another user's evaluation
  const evaluation = await prisma.promptEvaluation.findFirst({
    where: { id, userId: user.id },
  })

  if (!evaluation) notFound()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evaluation Detail</h1>
            <p className="text-muted-foreground mt-1">
              {new Date(evaluation.createdAt).toLocaleString()}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/history">← Back to History</Link>
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Original Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{evaluation.userPrompt}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge variant="outline">{evaluation.model}</Badge>
                <Badge variant="outline">{evaluation.taskType ?? 'general'}</Badge>
                <Badge variant="outline">{evaluation.evaluationMode ?? 'balanced'}</Badge>
              </div>
            </CardContent>
          </Card>

          <ScoreCard score={evaluation.score} grade={evaluation.grade} />
          <GeneratedResponseCard response={evaluation.generatedResponse} />
          <EvalResultCard
            summary={evaluation.summary}
            strengths={evaluation.strengths as string[]}
            weaknesses={evaluation.weaknesses as string[]}
            suggestions={evaluation.suggestions as string[]}
            improvedPrompt={evaluation.improvedPrompt}
          />
        </div>
      </div>
    </main>
  )
}
