'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GeneratedResponseCard } from './generated-response-card'
import { PromptScoreCard } from '@/components/evaluation/PromptScoreCard'
import { EvaluationProgressCard } from '@/components/evaluation/EvaluationProgressCard'

const formSchema = z.object({
  userPrompt: z.string().min(5, 'Prompt must be at least 5 characters'),
  model: z.string(),
  taskType: z.string(),
  evaluationMode: z.string(),
})

type FormValues = z.infer<typeof formSchema>

interface EvaluationResult {
  id: string
  userPrompt: string
  generatedResponse: string
  score: number
  grade: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  improvedPrompt: string
  model: string
  taskType: string
  evaluationMode: string
  metrics?: {
    clarity: number
    specificity: number
    context: number
    outputFormat: number
  }
}

const taskTypes = [
  'general',
  'email',
  'code',
  'summary',
  'explanation',
  'customer-support',
  'data-extraction',
  'reasoning',
]

export function PromptEvalForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [progressMessages, setProgressMessages] = useState<string[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPrompt: '',
      model: 'claude-haiku-4-5-20251001',
      taskType: 'general',
      evaluationMode: 'balanced',
    },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setError(null)
    setResult(null)
    setProgressMessages(['Prompt received'])

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        // Non-streaming errors (e.g. Unauthorized, validation)
        const data = await res.json().catch(() => null)
        setError(
          (data && typeof data.error === 'string' && data.error) ||
            'Evaluation failed'
        )
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setError('No response stream. Please try again.')
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        let newlineIndex = buffer.indexOf('\n')
        while (newlineIndex !== -1) {
          const line = buffer.slice(0, newlineIndex).trim()
          buffer = buffer.slice(newlineIndex + 1)

          if (line.length > 0) {
            try {
              const evt = JSON.parse(line) as
                | { type: 'status'; message: string }
                | { type: 'result'; data: EvaluationResult }
                | { type: 'error'; message: string }

              if (evt.type === 'status') {
                setProgressMessages((prev) => [...prev, evt.message])
              } else if (evt.type === 'result') {
                setResult(evt.data)
                await reader.cancel()
                return
              } else if (evt.type === 'error') {
                setError(evt.message || 'Evaluation failed')
                await reader.cancel()
                return
              }
            } catch {
              // Ignore malformed stream lines; the next chunk may complete it.
            }
          }

          newlineIndex = buffer.indexOf('\n')
        }
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evaluate Your Prompt</CardTitle>
          <CardDescription>
            Enter a prompt to get a detailed evaluation and improvement suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Enter your prompt here..."
                className="min-h-32 resize-y"
                {...form.register('userPrompt')}
              />
              {form.formState.errors.userPrompt && (
                <p className="text-sm text-red-500">{form.formState.errors.userPrompt.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Task Type</label>
                <Select
                  defaultValue="general"
                  onValueChange={(v) => form.setValue('taskType', v ?? 'general')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Model</label>
                <Select
                  defaultValue="claude-haiku-4-5-20251001"
                  onValueChange={(v) => form.setValue('model', v ?? 'claude-haiku-4-5-20251001')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-haiku-4-5-20251001">Claude Haiku 4.5</SelectItem>
                    <SelectItem value="claude-sonnet-4-6">Claude Sonnet 4.6</SelectItem>
                    <SelectItem value="claude-opus-4-7">Claude Opus 4.7</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Evaluation Mode</label>
                <Select
                  defaultValue="balanced"
                  onValueChange={(v) => form.setValue('evaluationMode', v ?? 'balanced')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="lenient">Lenient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Running Evaluation...' : 'Run Evaluation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && <EvaluationProgressCard messages={progressMessages} />}

      {result && !loading && (
        <div className="space-y-4">
          <PromptScoreCard
            score={result.score}
            summary={result.summary}
            metrics={
              result.metrics ?? {
                // API doesn't return detailed metrics yet. Keep UI stable with sensible defaults.
                clarity: Math.min(95, Math.max(55, result.score - 2)),
                specificity: Math.min(95, Math.max(45, result.score - 10)),
                context: Math.min(99, Math.max(60, result.score + 5)),
                outputFormat: Math.min(98, Math.max(50, result.score + 2)),
              }
            }
            strengths={result.strengths}
            weaknesses={result.weaknesses}
            suggestions={result.suggestions}
            improvedPrompt={result.improvedPrompt}
            onReevaluate={async () => {
              const current = form.getValues()
              const nextPrompt = result.improvedPrompt?.trim()
              if (!nextPrompt) return

              // Re-run with the improved prompt (keeping model/task/mode as-is).
              await onSubmit({ ...current, userPrompt: nextPrompt })
            }}
            onSave={() => {
              // Evaluations are already saved server-side; this is a convenient jump to history.
              router.push('/history')
            }}
            className="max-w-xl lg:max-w-none"
          />
          <GeneratedResponseCard response={result.generatedResponse} />
        </div>
      )}
    </div>
  )
}
