import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.ADMIN_SECRET_KEY || 'fallback-secret-key-change-in-production'
)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect all /admin/* routes EXCEPT /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    try {
      await jwtVerify(token, secret)
    } catch {
      const response = NextResponse.redirect(new URL('/admin/login', req.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === '/admin/login') {
    const token = req.cookies.get('admin_token')?.value
    if (token) {
      try {
        await jwtVerify(token, secret)
        return NextResponse.redirect(new URL('/admin', req.url))
      } catch {
        // token invalid, let through to login
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
