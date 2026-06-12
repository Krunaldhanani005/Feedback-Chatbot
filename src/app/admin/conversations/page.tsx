import { conversationRepo } from '@/repositories/ConversationRepository'
import { prisma } from '@/lib/db/prisma'
import { format } from 'date-fns'
import { MessageSquare, User, Building2, Star } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; skip?: string }>
}) {
  const params = await searchParams
  const skip = parseInt(params?.skip || '0')
  const { total, items } = await conversationRepo.findAll({
    skip,
    take: 20,
    status: params?.status,
    search: params?.search,
  })

  const sessionIds = [...new Set(items.map(c => c.sessionId))]
  const sessions = await prisma.session.findMany({
    where: { id: { in: sessionIds } },
    select: {
      id: true, visitorName: true, visitorEmail: true, visitorCompany: true,
      visitorDesignation: true, visitorIndustry: true, selectedInterests: true,
      aiRating: true, avRating: true, roboticsRating: true, automationRating: true, experienceRating: true,
    },
  })
  const sessionMap = Object.fromEntries(sessions.map(s => [s.id, s]))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Visitor Sessions</h1>
          <p className="text-text-secondary text-sm mt-1">{total} total conversations</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(conv => {
          const s = sessionMap[conv.sessionId]
          let interests: string[] = []
          try { if (s?.selectedInterests) interests = JSON.parse(s.selectedInterests) } catch {}
          const ratings = s ? [s.aiRating, s.avRating, s.roboticsRating, s.automationRating, s.experienceRating].filter((v): v is number => v !== null) : []
          const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null

          return (
            <div key={conv.id} className="bg-dark-card border border-dark-border rounded-2xl p-5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-dark-elevated border border-dark-border flex items-center justify-center shrink-0">
                    <User size={16} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{s?.visitorName || 'Anonymous Visitor'}</p>
                    <p className="text-xs text-text-muted">{s?.visitorEmail || s?.visitorDesignation || 'No contact info'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {avgRating && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Star size={12} className="fill-current" />
                      {avgRating}
                    </div>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    conv.status === 'active'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {conv.status}
                  </span>
                  <span className="text-xs text-text-muted">{format(conv.createdAt, 'MMM d, HH:mm')}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-3">
                {s?.visitorCompany && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Building2 size={12} />
                    {s.visitorCompany}
                    {s.visitorIndustry && ` · ${s.visitorIndustry}`}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <MessageSquare size={12} />
                  {conv.messageCount} messages
                </div>
                {conv.userIntent && (
                  <span className="text-xs px-2 py-0.5 bg-brand-red-muted text-brand-red rounded-full border border-red-100">
                    {conv.userIntent}
                  </span>
                )}
              </div>

              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {interests.map(item => (
                    <span key={item} className="text-xs px-2 py-0.5 bg-dark-elevated text-text-secondary rounded-full border border-dark-border">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">No conversations yet.</div>
        )}
      </div>

      {total > 20 && (
        <div className="flex justify-between mt-4">
          {skip > 0 && (
            <Link href={`?skip=${skip - 20}`} className="text-sm text-brand-red hover:underline">← Previous</Link>
          )}
          {skip + 20 < total && (
            <Link href={`?skip=${skip + 20}`} className="text-sm text-brand-red hover:underline ml-auto">Next →</Link>
          )}
        </div>
      )}
    </div>
  )
}
