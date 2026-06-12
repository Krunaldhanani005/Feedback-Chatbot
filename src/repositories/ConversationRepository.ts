import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'

export class ConversationRepository {
  async create(data: { sessionId: string; title?: string }) {
    return prisma.conversation.create({ data })
  }

  async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        session: true,
      },
    })
  }

  async updateAnalytics(id: string, data: {
    summary?: string
    userIntent?: string
    sentiment?: string
    leadScore?: number
    topicsDiscussed?: string[]
    status?: string
    title?: string
  }) {
    return prisma.conversation.update({
      where: { id },
      data: {
        ...data,
        topicsDiscussed: data.topicsDiscussed ? JSON.stringify(data.topicsDiscussed) : undefined,
        updatedAt: new Date(),
      },
    })
  }

  async incrementMessageCount(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { messageCount: { increment: 1 }, updatedAt: new Date() },
    })
  }

  async findAll(options?: {
    skip?: number
    take?: number
    status?: string
    search?: string
  }) {
    const where: Prisma.ConversationWhereInput = {}
    if (options?.status) where.status = options.status
    if (options?.search) {
      where.OR = [
        { session: { visitorName: { contains: options.search } } },
        { session: { visitorEmail: { contains: options.search } } },
        { session: { visitorCompany: { contains: options.search } } },
        { summary: { contains: options.search } },
      ]
    }

    const [total, items] = await Promise.all([
      prisma.conversation.count({ where }),
      prisma.conversation.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          session: { select: { visitorName: true, visitorEmail: true, visitorCompany: true, selectedInterests: true } },
        },
      }),
    ])

    return { total, items }
  }

  async getDashboardStats() {
    const [total, withLeads, withFeedback] = await Promise.all([
      prisma.conversation.count(),
      prisma.conversation.count({ where: { lead: { isNot: null } } }),
      prisma.conversation.count({ where: { feedback: { isNot: null } } }),
    ])
    return { total, withLeads, withFeedback }
  }

  async getInterestedInStats() {
    const sessions = await prisma.session.findMany({
      where: { selectedInterests: { not: null } },
      select: { selectedInterests: true },
    })

    const counts: Record<string, number> = {}
    for (const s of sessions) {
      if (!s.selectedInterests) continue
      try {
        const arr = JSON.parse(s.selectedInterests) as string[]
        for (const item of arr) {
          counts[item] = (counts[item] || 0) + 1
        }
      } catch {}
    }
    return counts
  }

  async getDepartmentRatingAverages() {
    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          { aiRating: { not: null } },
          { avRating: { not: null } },
          { roboticsRating: { not: null } },
          { automationRating: { not: null } },
          { experienceRating: { not: null } },
        ],
      },
      select: {
        aiRating: true, avRating: true, roboticsRating: true,
        automationRating: true, experienceRating: true,
      },
    })

    const sums = { ai: 0, av: 0, robotics: 0, automation: 0, experience: 0 }
    const counts = { ai: 0, av: 0, robotics: 0, automation: 0, experience: 0 }

    for (const s of sessions) {
      if (s.aiRating) { sums.ai += s.aiRating; counts.ai++ }
      if (s.avRating) { sums.av += s.avRating; counts.av++ }
      if (s.roboticsRating) { sums.robotics += s.roboticsRating; counts.robotics++ }
      if (s.automationRating) { sums.automation += s.automationRating; counts.automation++ }
      if (s.experienceRating) { sums.experience += s.experienceRating; counts.experience++ }
    }

    return {
      ai: counts.ai ? Math.round((sums.ai / counts.ai) * 10) / 10 : null,
      av: counts.av ? Math.round((sums.av / counts.av) * 10) / 10 : null,
      robotics: counts.robotics ? Math.round((sums.robotics / counts.robotics) * 10) / 10 : null,
      automation: counts.automation ? Math.round((sums.automation / counts.automation) * 10) / 10 : null,
      experience: counts.experience ? Math.round((sums.experience / counts.experience) * 10) / 10 : null,
    }
  }
}

export const conversationRepo = new ConversationRepository()
