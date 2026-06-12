import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getAIProviderWithFallback } from '@/lib/ai/factory'
import { messageRepo } from '@/repositories/MessageRepository'

export async function POST(req: NextRequest) {
  try {
    const { conversationId, sessionToken } = await req.json() as {
      conversationId?: string
      sessionToken?: string
    }

    if (!conversationId) return NextResponse.json({ ok: true })

    // Get all messages for this conversation
    const messages = await messageRepo.findByConversation(conversationId)
    const userMessages = messages.filter(m => m.role === 'user')

    if (userMessages.length === 0) return NextResponse.json({ ok: true })

    // Build a compact transcript for the AI to summarize
    const transcript = messages
      .map(m => `${m.role === 'user' ? 'Visitor' : 'AI'}: ${m.content}`)
      .join('\n')
      .substring(0, 3000) // keep prompt under limit

    // Generate summary using AI
    let summary = ''
    try {
      const provider = getAIProviderWithFallback()
      const result = await provider.generateResponse(
        [{ role: 'user', content: transcript }],
        'You are a CRM assistant summarizing a kiosk visitor chat. Write 2 short sentences: (1) what the visitor was interested in, (2) any specific requirement or question they had. Be concrete — mention product names or topics. No filler words.',
      )
      summary = result.content?.trim() || ''
    } catch { /* use fallback */ }

    if (!summary) {
      // Fallback: build summary from topics in conversation
      const conv = await prisma.conversation.findUnique({ where: { id: conversationId } })
      let topics: string[] = []
      try { if (conv?.topicsDiscussed) topics = JSON.parse(conv.topicsDiscussed) } catch {}
      summary = topics.length > 0
        ? `Visitor discussed: ${topics.slice(0, 5).join(', ')}. ${userMessages.length} messages exchanged.`
        : `${userMessages.length} messages exchanged during the session.`
    }

    // Update conversation summary
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { summary, updatedAt: new Date() },
    })

    // Update Lead — store summary if not already a requirements note
    const lead = await prisma.lead.findUnique({ where: { conversationId } })
    if (lead && !lead.notes?.includes('[Requirement]')) {
      await prisma.lead.update({
        where: { conversationId },
        data: {
          notes: `[Chat Summary]: ${summary}`,
          updatedAt: new Date(),
        },
      })
    }

    // If session had visitor info, also link session token for reference
    if (sessionToken) {
      await prisma.session.updateMany({
        where: { sessionToken },
        data: { updatedAt: new Date() },
      })
    }

    return NextResponse.json({ ok: true, summary })
  } catch (error) {
    console.error('Chat complete error:', error)
    return NextResponse.json({ ok: true }) // non-critical — don't block the UI
  }
}
