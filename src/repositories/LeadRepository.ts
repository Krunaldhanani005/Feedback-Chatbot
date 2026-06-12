import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'

export class LeadRepository {
  async createOrUpdate(data: {
    conversationId: string
    name?: string
    email?: string
    phone?: string
    company?: string
    designation?: string
    industry?: string
    interestedIn?: string | string[]
    notes?: string
    priority?: string
  }) {
    const existing = await prisma.lead.findUnique({
      where: { conversationId: data.conversationId },
    })

    const interestedIn = Array.isArray(data.interestedIn)
      ? JSON.stringify(data.interestedIn)
      : data.interestedIn

    const payload = { ...data, interestedIn }

    if (existing) {
      return prisma.lead.update({
        where: { conversationId: data.conversationId },
        data: { ...payload, updatedAt: new Date() },
      })
    }

    const priority = this.calculatePriority(data)
    return prisma.lead.create({ data: { ...payload, priority } })
  }

  private calculatePriority(data: { email?: string; phone?: string; company?: string; interestedIn?: string | string[] }): string {
    let score = 0
    if (data.email) score += 2
    if (data.phone) score += 2
    if (data.company) score += 1
    if (data.interestedIn && (Array.isArray(data.interestedIn) ? data.interestedIn.length > 0 : true)) score += 1
    if (score >= 5) return 'high'
    if (score >= 3) return 'medium'
    return 'low'
  }

  async findAll(options?: {
    skip?: number
    take?: number
    status?: string
    priority?: string
    search?: string
  }) {
    const where: Prisma.LeadWhereInput = {}
    if (options?.status) where.status = options.status
    if (options?.priority) where.priority = options.priority
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search } },
        { email: { contains: options.search } },
        { company: { contains: options.search } },
        { phone: { contains: options.search } },
      ]
    }

    const [total, items] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          conversation: {
            select: { summary: true, userIntent: true },
          },
        },
      }),
    ])

    return { total, items }
  }

  async updateStatus(id: string, status: string) {
    return prisma.lead.update({ where: { id }, data: { status, updatedAt: new Date() } })
  }

  async getStats() {
    const [total, high, medium, low, contacted] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { priority: 'high' } }),
      prisma.lead.count({ where: { priority: 'medium' } }),
      prisma.lead.count({ where: { priority: 'low' } }),
      prisma.lead.count({ where: { status: 'contacted' } }),
    ])
    return { total, high, medium, low, contacted }
  }
}

export const leadRepo = new LeadRepository()
