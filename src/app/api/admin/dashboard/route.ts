import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { conversationRepo } from '@/repositories/ConversationRepository'
import { feedbackRepo } from '@/repositories/FeedbackRepository'
import { leadRepo } from '@/repositories/LeadRepository'
import { prisma } from '@/lib/db/prisma'

async function authenticate(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  const admin = await authenticate(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [convStats, feedbackStats, leadStats, totalVisitors] = await Promise.all([
    conversationRepo.getDashboardStats(),
    feedbackRepo.getStats(),
    leadRepo.getStats(),
    prisma.session.count(),
  ])

  const interestedIn = await conversationRepo.getInterestedInStats()

  return NextResponse.json({
    totalVisitors,
    totalConversations: convStats.total,
    totalFeedback: feedbackStats.total,
    totalLeads: leadStats.total,
    averageRating: feedbackStats.average,
    feedbackDistribution: feedbackStats.distribution,
    interestedIn,
    leadStats,
  })
}
