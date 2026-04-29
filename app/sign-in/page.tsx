import { SignInForm } from '@/components/auth/sign-in-form'

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back to PromptLens
          </p>
        </div>
        <SignInForm />
      </div>
    </main>
  )
}
