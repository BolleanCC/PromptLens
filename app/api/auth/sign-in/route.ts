import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { rateLimit, getIp } from '@/lib/auth/rate-limit'
import { SESSION_COOKIE, SESSION_MAX_AGE, cookieOptions } from '@/lib/auth/session'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const INVALID = NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return INVALID

  const { email, password } = parsed.data

  // Rate limit keyed on IP + email to block credential stuffing
  const limited = await rateLimit('sign-in', `${getIp(req)}:${email}`)
  if (limited) return limited

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    })

    // Always run bcrypt to prevent timing-based user enumeration
    const dummyHash = '$2a$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    const hashToCompare = user?.accounts[0]?.passwordHash ?? dummyHash
    const valid = await verifyPassword(password, hashToCompare)

    if (!user || !valid) return INVALID

    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)
    const sessionToken = crypto.randomUUID()

    await prisma.session.create({
      data: { userId: user.id, token: sessionToken, expiresAt },
    })

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, sessionToken, cookieOptions(expiresAt))

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
