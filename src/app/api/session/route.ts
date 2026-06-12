import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateSessionToken } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const token = await generateSessionToken()
    const session = await prisma.session.create({
      data: {
        sessionToken: token,
        deviceType: req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      },
    })
    return NextResponse.json({ sessionToken: session.sessionToken })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
