import { test, expect } from '@playwright/test'
import { NextRequest } from 'next/server'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { getIp, rateLimit } from '@/lib/auth/rate-limit'
import { kvCache } from '@/lib/auth/kv-cache'

test.describe('password hashing', () => {
  test('hashes and verifies a password', async () => {
    const hash = await hashPassword('correct-horse')

    expect(hash).not.toBe('correct-horse')
    expect(await verifyPassword('correct-horse', hash)).toBe(true)
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
  })
})

test.describe('kvCache', () => {
  test('returns stored values and expires them after the TTL', async () => {
    await kvCache.set('test:ttl', 'value', 1)
    expect(await kvCache.get('test:ttl')).toBe('value')

    await new Promise((resolve) => setTimeout(resolve, 1100))
    expect(await kvCache.get('test:ttl')).toBeNull()
  })
})

test.describe('getIp', () => {
  test('uses the first x-forwarded-for address', () => {
    const req = new NextRequest('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' },
    })
    expect(getIp(req)).toBe('203.0.113.5')
  })

  test('normalizes IPv4-mapped IPv6 addresses', () => {
    const req = new NextRequest('http://localhost', {
      headers: { 'x-real-ip': '::ffff:198.51.100.7' },
    })
    expect(getIp(req)).toBe('198.51.100.7')
  })

  test('falls back to localhost when no headers are present', () => {
    expect(getIp(new NextRequest('http://localhost'))).toBe('127.0.0.1')
  })
})

test.describe('rateLimit', () => {
  test('allows 5 sign-in attempts, then returns 429', async () => {
    // Unique identifier so tests don't share the in-memory window
    const id = `test-${Date.now()}-${Math.random()}`

    for (let i = 0; i < 5; i++) {
      expect(await rateLimit('sign-in', id)).toBeNull()
    }

    const blocked = await rateLimit('sign-in', id)
    expect(blocked?.status).toBe(429)
    expect(blocked?.headers.get('Retry-After')).toBeTruthy()
  })

  test('ignores endpoints without a configured limit', async () => {
    expect(await rateLimit('unknown-endpoint', 'anyone')).toBeNull()
  })
})
