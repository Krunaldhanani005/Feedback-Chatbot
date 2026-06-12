import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { conversationRepo } from '@/repositories/ConversationRepository'

async function authenticate(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  const admin = await authenticate(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const skip = parseInt(searchParams.get('skip') || '0')
  const take = parseInt(searchParams.get('take') || '20')
  const status = searchParams.get('status') || undefined
  const search = searchParams.get('search') || undefined

  const result = await conversationRepo.findAll({ skip, take, status, search })
  return NextResponse.json(result)
}
