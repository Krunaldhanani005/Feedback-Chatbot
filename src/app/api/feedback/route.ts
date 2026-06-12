import { NextRequest, NextResponse } from 'next/server'
import { feedbackRepo } from '@/repositories/FeedbackRepository'
import type { FeedbackData } from '@/types/chat'

const ratingLabels: Record<number, string> = {
  5: 'excellent',
  4: 'good',
  3: 'average',
  2: 'needs_improvement',
  1: 'poor',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as FeedbackData

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    const feedback = await feedbackRepo.create({
      rating: body.rating,
      ratingLabel: body.ratingLabel || ratingLabels[body.rating] || 'average',
      interestedIn: body.interestedIn,
      comments: body.comments,
      conversationId: body.conversationId,
    })

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
