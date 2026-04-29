import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function DashboardPage() {
  const user = await getUser()

  // Double-check: middleware blocks the route, but getUser() verifies the DB session
  if (!user) redirect('/sign-in')

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back{user.name ? `, ${user.name}` : ''}!
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-2">
        <h2 className="font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Email: </span>
          {user.email}
        </p>
        {user.name && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Name: </span>
            {user.name}
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-semibold">PromptLens</h2>
        <p className="text-sm text-muted-foreground">
          Evaluate and improve your AI prompts with instant scoring and suggestions.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">New Evaluation</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/history">View History</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
