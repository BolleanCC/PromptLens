import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { rateLimit, getIp } from '@/lib/auth/rate-limit'
import { SESSION_COOKIE } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const limited = await rateLimit('sign-out', getIp(req))
  if (limited) return limited

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (token) {
      await prisma.session.deleteMany({ where: { token } })
      cookieStore.delete(SESSION_COOKIE)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
