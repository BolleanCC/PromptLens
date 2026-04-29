import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export const SESSION_COOKIE = 'session_token'
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

export function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    expires: expiresAt,
    path: '/',
  }
}

// Use in server components and API routes to get the current user.
// Returns null instead of throwing on any error (DB down, expired session, etc.)
export async function getUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) return null

    return session.user
  } catch {
    return null
  }
}
