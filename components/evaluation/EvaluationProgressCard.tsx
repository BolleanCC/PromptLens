'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'

export interface EvaluationProgressCardProps {
  messages: string[]
}

export function EvaluationProgressCard({ messages }: EvaluationProgressCardProps) {
  const items = messages.length > 0 ? messages : ['Starting evaluation...']
  const activeIndex = Math.max(0, items.length - 1)

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b">
        <CardTitle>Evaluation in Progress</CardTitle>
        <CardDescription>PromptLens is analyzing your prompt.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          {items.map((m, i) => {
            const isActive = i === activeIndex
            const isDone = i < activeIndex

            return (
              <div key={`${i}-${m}`} className="flex items-start gap-2 text-sm">
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="size-4 text-foreground/70" aria-hidden="true" />
                  ) : isActive ? (
                    <Loader2 className="size-4 animate-spin text-foreground/70" aria-hidden="true" />
                  ) : (
                    <div className="size-4 rounded-full border border-foreground/15" aria-hidden="true" />
                  )}
                </div>
                <div className={isDone ? 'text-muted-foreground' : 'text-foreground'}>{m}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

