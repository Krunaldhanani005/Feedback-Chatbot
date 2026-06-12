import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { feedbackRepo } from '@/repositories/FeedbackRepository'
import * as Papa from 'papaparse'

async function authenticate(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  const admin = await authenticate(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format')
  const skip = parseInt(searchParams.get('skip') || '0')
  const take = parseInt(searchParams.get('take') || '50')
  const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined
  const resolved = searchParams.get('resolved') === 'true' ? true :
    searchParams.get('resolved') === 'false' ? false : undefined
  const search = searchParams.get('search') || undefined

  const result = await feedbackRepo.findAll({ skip, take, rating, resolved, search })

  if (format === 'csv') {
    const csv = Papa.unparse(result.items.map(f => ({
      ID: f.id,
      Rating: f.rating,
      Label: f.ratingLabel,
      Comments: f.comments || '',
      'Interested In': f.interestedIn || '',
      'User Name': f.conversation?.session?.visitorName || '',
      'User Email': f.conversation?.session?.visitorEmail || '',
      Company: f.conversation?.session?.visitorCompany || '',
      Resolved: f.resolved ? 'Yes' : 'No',
      Date: f.createdAt.toISOString(),
    })))
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="feedback.csv"',
      },
    })
  }

  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest) {
  const admin = await authenticate(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, resolved, notes } = await req.json() as { id: string; resolved: boolean; notes?: string }
  const updated = await feedbackRepo.markResolved(id, notes)
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const admin = await authenticate(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json() as { id: string }
  await feedbackRepo.delete(id)
  return NextResponse.json({ success: true })
}
