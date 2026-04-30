import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { getUser } from '@/lib/auth/session'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { Button } from '@/components/ui/button'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PromptLens',
  description: 'Evaluate and improve your AI prompts',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b bg-background">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              {/* Lens icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="6" />
                <circle cx="9" cy="9" r="2.25" opacity="0.55" />
                <path d="M13.5 13.5 17 17" />
              </svg>
              PromptLens
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              {user ? (
                <>
                  <Link
                    href="/evaluate"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Evaluate
                  </Link>
                  <Link
                    href="/history"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    History
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <SignOutButton variant="nav" />
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign in
                  </Link>
                  <Button asChild size="sm" className="rounded-lg">
                    <Link href="/sign-up">Sign up</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  )
}
