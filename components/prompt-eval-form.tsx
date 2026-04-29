'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ScoreCard } from './score-card'
import { GeneratedResponseCard } from './generated-response-card'
import { EvalResultCard } from './eval-result-card'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EvaluationResult | null>(null)

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

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Evaluation failed')
        return
      }

      setResult(data.evaluation)
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

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          <ScoreCard score={result.score} grade={result.grade} />
          <GeneratedResponseCard response={result.generatedResponse} />
          <EvalResultCard
            summary={result.summary}
            strengths={result.strengths}
            weaknesses={result.weaknesses}
            suggestions={result.suggestions}
            improvedPrompt={result.improvedPrompt}
          />
        </div>
      )}
    </div>
  )
}
