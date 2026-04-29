export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth/session'
import { EvaluationHistoryTable } from '@/components/evaluation-history-table'
import { Button } from '@/components/ui/button'

export default async function HistoryPage() {
  const user = await getUser()
  // Middleware handles the redirect, but getUser() does the real DB check
  if (!user) redirect('/sign-in')

  const evaluations = await prisma.promptEvaluation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userPrompt: true,
      score: true,
      grade: true,
      taskType: true,
      model: true,
      createdAt: true,
    },
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evaluation History</h1>
            <p className="text-muted-foreground mt-1">Your previous prompt evaluations.</p>
          </div>
          <Button asChild>
            <Link href="/evaluate">New Evaluation</Link>
          </Button>
        </div>
        <EvaluationHistoryTable evaluations={evaluations} />
      </div>
    </main>
  )
}
