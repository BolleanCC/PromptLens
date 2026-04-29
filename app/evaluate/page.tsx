import { PromptEvalForm } from '@/components/prompt-eval-form'

export default function EvaluatePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Prompt Evaluation</h1>
          <p className="text-muted-foreground mt-1">Test and improve your AI prompts.</p>
        </div>
        <PromptEvalForm />
      </div>
    </main>
  )
}
