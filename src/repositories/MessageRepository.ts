import { prisma } from '@/lib/db/prisma'

export class MessageRepository {
  async create(data: {
    conversationId: string
    role: string
    content: string
    metadata?: string | null
  }) {
    return prisma.message.create({ data })
  }

  async findByConversation(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async getRecentMessages(conversationId: string, limit = 10) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }
}

export const messageRepo = new MessageRepository()
