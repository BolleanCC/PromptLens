import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Better prompts, better results.
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        PromptLens scores your prompts, explains what works and what doesn&apos;t,
        and gives you an improved version instantly.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild size="lg">
          <Link href="/evaluate">Start Evaluating</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </main>
  )
}
