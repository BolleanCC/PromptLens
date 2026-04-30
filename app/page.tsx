import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, Sparkles, Target, Zap } from 'lucide-react'

function ScoreRing({ value }: { value: number }) {
  const size = 96
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
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
          <div className="mt-1 text-[11px] font-medium text-muted-foreground">
            score
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  value,
}: {
  label: string
  value: number
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="truncate text-xs font-medium">{label}</div>
          <div className="text-xs tabular-nums text-muted-foreground">
            {clamped}%
          </div>
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

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(0,0,0,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(60%_60%_at_50%_15%,#000_40%,transparent_85%)]" />
      </div>

      <section className="max-w-6xl mx-auto px-4 pt-14 pb-10 sm:pt-20 sm:pb-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span className="inline-flex size-5 items-center justify-center rounded-full border bg-muted">
                <Sparkles className="size-3" aria-hidden="true" />
              </span>
              Prompt evaluation for developer workflows
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Better prompts, better results.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              PromptLens scores your prompts, pinpoints what&apos;s weak, and
              generates a stronger version you can ship.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href="/evaluate">Start Evaluating</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-foreground/70" aria-hidden="true" />
              Scores in seconds. Clear feedback. Copy-ready improved prompt.
            </div>
          </div>

          <div className="lg:justify-self-end">
            <Card className="w-full max-w-xl shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <CardTitle>Prompt Quality Score</CardTitle>
                    <CardDescription>
                      Evaluation summary for your latest prompt
                    </CardDescription>
                  </div>
                  <div className="shrink-0">
                    <ScoreRing value={86} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    Metrics
                  </div>
                  <div className="grid gap-4">
                    <MetricRow label="Clarity" value={84} />
                    <MetricRow label="Specificity" value={78} />
                    <MetricRow label="Context" value={91} />
                    <MetricRow label="Output Format" value={88} />
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      Improved Prompt
                    </div>
                    <div className="text-xs tabular-nums text-muted-foreground">
                      +12% overall
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="text-[11px] text-muted-foreground">
                      Preview
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                      You are a senior frontend engineer. Review this PR for
                      accessibility and performance. Return:
                      {"\n"}1) Top issues with file/line references
                      {"\n"}2) Suggested fixes
                      {"\n"}3) A quick risk summary
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg border bg-muted">
                  <Zap className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-sm">Score prompts instantly</CardTitle>
                  <CardDescription className="text-sm">
                    Fast, consistent scoring you can trust.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg border bg-muted">
                  <Target className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-sm">Explain what is weak</CardTitle>
                  <CardDescription className="text-sm">
                    Clarity, missing context, vague constraints.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg border bg-muted">
                  <Sparkles className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-sm">
                    Generate a stronger prompt
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Copy and paste an improved version.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>
    </main>
  )
}
