import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { leadRepo } from '@/repositories/LeadRepository'
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
  const status = searchParams.get('status') || undefined
  const priority = searchParams.get('priority') || undefined
  const search = searchParams.get('search') || undefined

  const result = await leadRepo.findAll({ skip, take, status, priority, search })

  if (format === 'csv') {
    const csv = Papa.unparse(result.items.map(l => ({
      ID: l.id,
      Name: l.name || '',
      Email: l.email || '',
      Phone: l.phone || '',
      Company: l.company || '',
      Designation: l.designation || '',
      Industry: l.industry || '',
      'Interested In': l.interestedIn || '',
      Status: l.status,
      Priority: l.priority,
      Notes: l.notes || '',
      'Conversation Summary': l.conversation?.summary || '',
      Date: l.createdAt.toISOString(),
    })))
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="leads.csv"',
      },
    })
  }

  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest) {
  const admin = await authenticate(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json() as { id: string; status: string }
  const updated = await leadRepo.updateStatus(id, status)
  return NextResponse.json(updated)
}
