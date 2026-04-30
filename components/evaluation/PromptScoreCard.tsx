'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Copy, RefreshCw, Save } from 'lucide-react'

export interface PromptScoreMetrics {
  clarity: number
  specificity: number
  context: number
  outputFormat: number
}

export interface PromptScoreCardProps {
  score: number
  summary: string
  metrics: PromptScoreMetrics
  improvedPrompt: string
  strengths?: string[]
  weaknesses?: string[]
  suggestions?: string[]
  onCopy?: (improvedPrompt: string) => void | Promise<void>
  onReevaluate?: () => void | Promise<void>
  onSave?: () => void | Promise<void>
  className?: string
}

function clamp01to100(n: number) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function ScoreRing({ value }: { value: number }) {
  const size = 96
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = clamp01to100(value)
  const dash = (clamped / 100) * c

  return (
    <div className="relative grid place-items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="text-foreground"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="text-2xl font-semibold tabular-nums">{clamped}</div>
          <div className="mt-1 text-[11px] font-medium text-muted-foreground">score</div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: number }) {
  const clamped = clamp01to100(value)
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="truncate text-xs font-medium">{label}</div>
          <div className="text-xs tabular-nums text-muted-foreground">{clamped}%</div>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-foreground/80"
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function PromptScoreCard({
  score,
  summary,
  metrics,
  improvedPrompt,
  onCopy,
  onReevaluate,
  onSave,
  className,
}: PromptScoreCardProps) {
  const [copying, setCopying] = React.useState(false)

  async function handleCopy() {
    setCopying(true)
    try {
      if (onCopy) {
        await onCopy(improvedPrompt)
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(improvedPrompt)
      }
    } finally {
      setCopying(false)
    }
  }

  return (
    <Card className={cn('w-full shadow-sm', className)}>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <CardTitle>Prompt Quality Score</CardTitle>
            <CardDescription>{summary}</CardDescription>
          </div>
          <div className="shrink-0">
            <ScoreRing value={score} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <div className="text-xs font-medium text-muted-foreground">Metrics</div>
          <div className="grid gap-4">
            <MetricRow label="Clarity" value={metrics.clarity} />
            <MetricRow label="Specificity" value={metrics.specificity} />
            <MetricRow label="Context" value={metrics.context} />
            <MetricRow label="Output Format" value={metrics.outputFormat} />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-medium text-muted-foreground">Improved Prompt</div>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="text-[11px] text-muted-foreground">Preview</div>
            <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
              {improvedPrompt}
            </pre>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleCopy}
          disabled={copying || improvedPrompt.trim().length === 0}
        >
          <Copy className="mr-2 size-4" aria-hidden="true" />
          {copying ? 'Copying...' : 'Copy improved prompt'}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onReevaluate}
          disabled={!onReevaluate}
        >
          <RefreshCw className="mr-2 size-4" aria-hidden="true" />
          Re-evaluate
        </Button>
        <Button className="w-full sm:w-auto" onClick={onSave} disabled={!onSave}>
          <Save className="mr-2 size-4" aria-hidden="true" />
          Save to history
        </Button>
      </CardFooter>
    </Card>
  )
}
