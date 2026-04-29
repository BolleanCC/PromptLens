import { NextRequest, NextResponse } from 'next/server'
import { kvCache } from './kv-cache'

interface RateLimitConfig {
  windowSeconds: number
  max: number
}

const LIMITS: Record<string, RateLimitConfig> = {
  'sign-in': { windowSeconds: 15 * 60, max: 5 },   // 5 attempts per 15 min
  'sign-up': { windowSeconds: 60 * 60, max: 10 },   // 10 attempts per hour
  'sign-out': { windowSeconds: 60, max: 10 },
}

export function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : (req.headers.get('x-real-ip') ?? '127.0.0.1')
  return ip.replace(/^::ffff:/, '') // normalize IPv4-mapped IPv6
}

export async function rateLimit(
  endpoint: string,
  identifier: string
): Promise<NextResponse | null> {
  const config = LIMITS[endpoint]
  if (!config) return null

  const key = `rl:${endpoint}:${identifier}`

  try {
    const raw = await kvCache.get(key)

    if (!raw) {
      await kvCache.set(
        key,
        JSON.stringify({ count: 1, windowStart: Date.now() }),
        config.windowSeconds
      )
      return null
    }

    const { count, windowStart } = JSON.parse(raw) as {
      count: number
      windowStart: number
    }

    if (count >= config.max) {
      const retryAfter = Math.max(
        1,
        config.windowSeconds - Math.floor((Date.now() - windowStart) / 1000)
      )
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    // Increment but preserve the original window expiry
    const remainingTtl = Math.max(
      1,
      config.windowSeconds - Math.floor((Date.now() - windowStart) / 1000)
    )
    await kvCache.set(
      key,
      JSON.stringify({ count: count + 1, windowStart }),
      remainingTtl
    )

    return null
  } catch {
    // Fail open — if the KV store is unavailable, allow the request
    return null
  }
}
