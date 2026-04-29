'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const gradeColors: Record<string, string> = {
  Poor: 'destructive',
  Fair: 'secondary',
  Good: 'default',
  Excellent: 'default',
}

interface ScoreCardProps {
  score: number
  grade: string
}

export function ScoreCard({ score, grade }: ScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Score
          <Badge variant={gradeColors[grade] as 'destructive' | 'secondary' | 'default' | 'outline'}>
            {grade}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-4xl font-bold">
          {score}
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <Progress value={score} className="h-3" />
      </CardContent>
    </Card>
  )
}
