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
  const format      = searchParams.get('format')
  const skip        = parseInt(searchParams.get('skip') || '0')
  const take        = parseInt(searchParams.get('take') || '50')
  const status      = searchParams.get('status') || undefined
  const priority    = searchParams.get('priority') || undefined
  const search      = searchParams.get('search') || undefined
  const date        = searchParams.get('date') || undefined   // YYYY-MM-DD for day-wise export
  const intent      = searchParams.get('intent') || undefined  // 'discuss_requirements' for discuss export

  // Day-wise date range
  let dateFrom: Date | undefined
  let dateTo:   Date | undefined
  if (date) {
    dateFrom = new Date(`${date}T00:00:00.000Z`)
    dateTo   = new Date(`${date}T23:59:59.999Z`)
  }

  if (format === 'excel') {
    // Fetch all for export (no skip, large take)
    const allLeads = intent === 'discuss_requirements'
      ? (await leadRepo.findRequirements({ skip: 0, take: 5000 })).items
      : (await leadRepo.findAll({ skip: 0, take: 5000, status, priority, search, dateFrom, dateTo })).items

    const rows = allLeads.map((item) => {
      // Handle both Lead items and Conversation items (from findRequirements)
      const isConv = 'session' in item && !('name' in item)

      if (isConv) {
        // Conversation item from findRequirements
        const conv = item as Awaited<ReturnType<typeof leadRepo.findRequirements>>['items'][0]
        let interests: string[] = []
        try { if (conv.session?.selectedInterests) interests = JSON.parse(conv.session.selectedInterests) } catch {}
        const requirement = conv.lead?.notes?.replace(/\[Requirement\]: ?/g, '').trim() || conv.summary || ''
        return {
          Date:        conv.updatedAt.toISOString().split('T')[0],
          Time:        conv.updatedAt.toISOString().split('T')[1].substring(0, 5),
          Name:        conv.session?.visitorName    || '',
          Company:     conv.session?.visitorCompany || '',
          Designation: conv.session?.visitorDesignation || '',
          Email:       conv.session?.visitorEmail   || '',
          Phone:       conv.session?.visitorPhone   || '',
          Interests:   interests.join(', '),
          Requirement: requirement,
          Status:      conv.lead?.status || 'new',
        }
      }

      // Lead item from findAll
      const lead = item as Awaited<ReturnType<typeof leadRepo.findAll>>['items'][0]
      let interests: string[] = []
      try { if (lead.interestedIn) interests = JSON.parse(lead.interestedIn) } catch {}
      const session = lead.conversation?.session

      return {
        Date:              lead.createdAt.toISOString().split('T')[0],
        Time:              lead.createdAt.toISOString().split('T')[1].substring(0, 5),
        Name:              lead.name        || '',
        Company:           lead.company     || '',
        Designation:       lead.designation || '',
        Email:             lead.email       || '',
        Phone:             lead.phone       || '',
        Industry:          lead.industry    || '',
        'Interested In':   interests.join(', '),
        Status:            lead.status,
        Priority:          lead.priority,
        'AI Rating':       session?.aiRating         ?? '',
        'AV Rating':       session?.avRating         ?? '',
        'Robotics Rating': session?.roboticsRating   ?? '',
        'Automation Rating': session?.automationRating ?? '',
        'Experience Rating': session?.experienceRating ?? '',
        'Lead Score':      lead.conversation?.leadScore ?? '',
        'Conversation Summary': lead.conversation?.summary || '',
        Requirements:      lead.notes?.replace(/\[Requirement\]: ?/g, '').trim() || '',
        'Topics Discussed': (() => {
          try { return lead.conversation?.topicsDiscussed ? JSON.parse(lead.conversation.topicsDiscussed).join(', ') : '' } catch { return '' }
        })(),
      }
    })

    const csv = Papa.unparse(rows)
    const filename = date
      ? `leads_${date}.csv`
      : intent === 'discuss_requirements'
      ? 'requirements.csv'
      : 'leads_all.csv'

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  // JSON response for the UI
  const result = await leadRepo.findAll({ skip, take, status, priority, search, dateFrom, dateTo })
  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest) {
  const admin = await authenticate(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json() as { id: string; status: string }
  const updated = await leadRepo.updateStatus(id, status)
  return NextResponse.json(updated)
}
