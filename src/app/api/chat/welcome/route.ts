import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { messageRepo } from '@/repositories/MessageRepository'

const EXPERIENCE_BUTTONS = ['😊 Excellent', '🙂 Good', '😐 Average', '😕 Needs Improvement', '😞 Poor']

export async function POST(req: NextRequest) {
  try {
    const { sessionToken, conversationId } = await req.json() as {
      sessionToken: string
      conversationId: string
    }

    if (!sessionToken || !conversationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Don't double-greet
    const existing = await prisma.message.findFirst({
      where: { conversationId, role: 'assistant' },
    })
    if (existing) {
      return NextResponse.json({
        message: existing.content,
        quickReplies: EXPERIENCE_BUTTONS,
        alreadyGreeted: true,
      })
    }

    // Get session data for personalization
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      select: {
        visitorName: true,
        selectedInterests: true,
        aiRating: true, avRating: true, roboticsRating: true,
        automationRating: true, experienceRating: true,
      },
    })

    // Build personalized greeting text (always short)
    const welcomeText = buildWelcomeText(session)

    // Save as assistant message
    await messageRepo.create({
      conversationId,
      role: 'assistant',
      content: welcomeText,
      metadata: null,
    })

    return NextResponse.json({
      message: welcomeText,
      quickReplies: EXPERIENCE_BUTTONS,
    })
  } catch (error) {
    console.error('Welcome API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

function buildWelcomeText(session: {
  visitorName?: string | null
  selectedInterests?: string | null
  aiRating?: number | null
  roboticsRating?: number | null
  avRating?: number | null
  automationRating?: number | null
  experienceRating?: number | null
} | null): string {
  if (!session) {
    return "Hey there! 👋 How was your experience at the Nanta Tech Experience Days today?"
  }

  const firstName = session.visitorName?.split(' ')[0]
  const greeting = firstName ? `Hey ${firstName}! 👋` : 'Hey there! 👋'

  // Find highest-rated department for personalization
  const ratings: Record<string, number> = {}
  if (session.aiRating) ratings['AI Solutions'] = session.aiRating
  if (session.avRating) ratings['AV Technology'] = session.avRating
  if (session.roboticsRating) ratings['Robotics'] = session.roboticsRating
  if (session.automationRating) ratings['Automation'] = session.automationRating
  if (session.experienceRating) ratings['Customer Experience'] = session.experienceRating

  const topRated = Object.entries(ratings).sort(([, a], [, b]) => b - a)[0]

  if (topRated && topRated[1] >= 4) {
    return `${greeting} I see you were impressed by our ${topRated[0]}! How would you describe your overall experience today?`
  }

  return `${greeting} How was your experience at the Nanta Tech Experience Days today?`
}
