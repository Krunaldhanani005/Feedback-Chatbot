import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'

export class FeedbackRepository {
  async create(data: {
    conversationId?: string
    rating: number
    ratingLabel: string
    interestedIn?: string[]
    comments?: string
  }) {
    return prisma.feedback.create({
      data: {
        ...data,
        interestedIn: data.interestedIn ? JSON.stringify(data.interestedIn) : undefined,
      },
    })
  }

  async findAll(options?: {
    skip?: number
    take?: number
    rating?: number
    resolved?: boolean
    search?: string
  }) {
    const where: Prisma.FeedbackWhereInput = {}
    if (options?.rating !== undefined) where.rating = options.rating
    if (options?.resolved !== undefined) where.resolved = options.resolved
    if (options?.search) {
      where.comments = { contains: options.search }
    }

    const [total, items] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          conversation: {
            select: {
              id: true,
              session: { select: { visitorName: true, visitorCompany: true, visitorEmail: true } },
            },
          },
        },
      }),
    ])

    return { total, items }
  }

  async markResolved(id: string, notes?: string) {
    return prisma.feedback.update({
      where: { id },
      data: { resolved: true, adminNotes: notes, updatedAt: new Date() },
    })
  }

  async delete(id: string) {
    return prisma.feedback.delete({ where: { id } })
  }

  async getStats() {
    const feedbacks = await prisma.feedback.findMany({
      select: { rating: true, interestedIn: true },
    })

    const total = feedbacks.length
    if (total === 0) return { total: 0, average: 0, distribution: {}, interestedIn: {} }

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0)
    const average = Math.round((sum / total) * 10) / 10

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const f of feedbacks) {
      distribution[f.rating] = (distribution[f.rating] || 0) + 1
    }

    const interestedIn: Record<string, number> = {}
    for (const f of feedbacks) {
      if (!f.interestedIn) continue
      try {
        const arr = JSON.parse(f.interestedIn) as string[]
        for (const item of arr) {
          interestedIn[item] = (interestedIn[item] || 0) + 1
        }
      } catch {}
    }

    return { total, average, distribution, interestedIn }
  }
}

export const feedbackRepo = new FeedbackRepository()
