import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth/session'

// Runs on the Edge — cannot use Prisma here.
// We check for the cookie's existence; the actual DB verification
// happens inside the dashboard page via getUser().
export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/evaluate/:path*', '/history/:path*'],
}
