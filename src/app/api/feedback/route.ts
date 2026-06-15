import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { feedbackRepo } from '@/repositories/FeedbackRepository'
import { sendFeedbackEmail } from '@/lib/mail/mailer'
import type { FeedbackData } from '@/types/chat'

const ratingLabels: Record<number, string> = {
  5: 'Excellent',
  4: 'Good',
  3: 'Average',
  2: 'Needs Improvement',
  1: 'Poor',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as FeedbackData

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    const ratingLabel = body.ratingLabel || ratingLabels[body.rating] || 'Average'

    const feedback = await feedbackRepo.create({
      rating: body.rating,
      ratingLabel,
      interestedIn: body.interestedIn,
      comments: body.comments,
      conversationId: body.conversationId,
    })

    // Fetch visitor info from session for the email
    let visitorName: string | null = null
    let visitorCompany: string | null = null
    let visitorEmail: string | null = null
    if (body.conversationId) {
      const conv = await prisma.conversation.findUnique({
        where: { id: body.conversationId },
        include: { session: { select: { visitorName: true, visitorCompany: true, visitorEmail: true } } },
      })
      visitorName    = conv?.session?.visitorName    ?? null
      visitorCompany = conv?.session?.visitorCompany ?? null
      visitorEmail   = conv?.session?.visitorEmail   ?? null
    }

    // Send feedback email (fire-and-forget)
    sendFeedbackEmail({
      rating:        body.rating,
      ratingLabel,
      visitorName,
      visitorCompany,
      visitorEmail,
      interestedIn: body.interestedIn,
      comments:     body.comments,
    }).catch(err => console.error('[Feedback] Email failed:', err))

    return NextResponse.json({ success: true, feedbackId: feedback.id })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const stats = searchParams.get('stats')

  if (stats === 'true') {
    const data = await feedbackRepo.getStats()
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
