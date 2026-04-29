import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { rateLimit, getIp } from '@/lib/auth/rate-limit'
import { SESSION_COOKIE, SESSION_MAX_AGE, cookieOptions } from '@/lib/auth/session'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const limited = await rateLimit('sign-up', getIp(req))
  if (limited) return limited

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { email, password, name } = parsed.data

  // Hash before the DB insert so timing is consistent whether or not the email exists
  const passwordHash = await hashPassword(password)
  const userId = crypto.randomUUID()
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  try {
    await prisma.$transaction([
      prisma.user.create({ data: { id: userId, email, name: name ?? null } }),
      prisma.account.create({
        data: { userId, providerId: 'credential', passwordHash },
      }),
      prisma.session.create({
        data: { userId, token: sessionToken, expiresAt },
      }),
    ])
  } catch (err) {
    // Duplicate email — return a fake success so attackers cannot enumerate emails
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const fakeExpiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, crypto.randomUUID(), cookieOptions(fakeExpiresAt))
      return NextResponse.json({
        user: { id: crypto.randomUUID(), email, name: name ?? null },
      })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionToken, cookieOptions(expiresAt))

  return NextResponse.json({
    user: { id: userId, email, name: name ?? null },
  })
}
