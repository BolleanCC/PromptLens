'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SignOutButtonProps {
  variant?: 'nav' | 'button'
}

export function SignOutButton({ variant = 'button' }: SignOutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await fetch('/api/auth/sign-out', { method: 'POST' })
    router.push('/sign-in')
    router.refresh()
  }

  if (variant === 'nav') {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Signing out…' : 'Sign out'}
      </button>
    )
  }

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={loading}>
      {loading ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
