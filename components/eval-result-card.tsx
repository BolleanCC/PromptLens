'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Lightbulb, Copy, Check } from 'lucide-react'

interface EvalResultCardProps {
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  improvedPrompt: string
}

export function EvalResultCard({
  summary,
  strengths,
  weaknesses,
  suggestions,
  improvedPrompt,
}: EvalResultCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(improvedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-green-500">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-red-500">•</span>
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-blue-500">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Improved Prompt</CardTitle>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-3" />
          <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{improvedPrompt}</p>
        </CardContent>
      </Card>
    </div>
  )
}
