import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Evaluation {
  id: string
  userPrompt: string
  score: number
  grade: string
  taskType: string | null
  model: string
  createdAt: Date
}

function gradeVariant(grade: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (grade === 'Excellent') return 'default'
  if (grade === 'Good') return 'secondary'
  if (grade === 'Fair') return 'outline'
  return 'destructive'
}

export function EvaluationHistoryTable({ evaluations }: { evaluations: Evaluation[] }) {
  if (evaluations.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No evaluations yet. Run your first evaluation!
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prompt</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Date</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.map((ev) => (
          <TableRow key={ev.id}>
            <TableCell className="max-w-xs truncate">{ev.userPrompt}</TableCell>
            <TableCell className="font-semibold">{ev.score}</TableCell>
            <TableCell>
              <Badge variant={gradeVariant(ev.grade)}>{ev.grade}</Badge>
            </TableCell>
            <TableCell className="capitalize">{ev.taskType ?? 'general'}</TableCell>
            <TableCell>{ev.model}</TableCell>
            <TableCell>{new Date(ev.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button asChild variant="outline" size="sm">
                <Link href={`/history/${ev.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
