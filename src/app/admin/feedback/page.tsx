import { feedbackRepo } from '@/repositories/FeedbackRepository'
import { format } from 'date-fns'
import { Star, CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const ratingColors: Record<number, string> = {
  5: 'text-green-700',
  4: 'text-blue-700',
  3: 'text-amber-700',
  2: 'text-orange-700',
  1: 'text-red-700',
}

const ratingStarColors: Record<number, string> = {
  5: 'text-green-500',
  4: 'text-blue-500',
  3: 'text-amber-500',
  2: 'text-orange-500',
  1: 'text-red-500',
}

const ratingLabels: Record<number, string> = {
  5: 'Excellent',
  4: 'Good',
  3: 'Average',
  2: 'Needs Improvement',
  1: 'Poor',
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ skip?: string; rating?: string }>
}) {
  const params = await searchParams
  const skip = parseInt(params?.skip || '0')
  const rating = params?.rating ? parseInt(params.rating) : undefined
  const stats = await feedbackRepo.getStats()
  const { total, items } = await feedbackRepo.findAll({ skip, take: 20, rating })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Chat Feedback</h1>
          <p className="text-text-secondary text-sm mt-1">{stats.total} total | Avg: {stats.average || 0}/5</p>
        </div>
        <a
          href="/api/admin/feedback?format=csv"
          className="flex items-center gap-2 px-4 py-2 bg-dark-elevated border border-dark-border hover:border-brand-red/40 text-text-secondary hover:text-text-primary rounded-xl text-sm transition-colors"
        >
          <Download size={14} />
          Export CSV
        </a>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link href="/admin/feedback"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !rating
              ? 'bg-brand-red border-brand-red text-white'
              : 'bg-dark-card border-dark-border text-text-secondary hover:text-text-primary'
          }`}>
          All
        </Link>
        {[5, 4, 3, 2, 1].map(r => (
          <Link key={r} href={`?rating=${r}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              rating === r
                ? 'bg-brand-red border-brand-red text-white'
                : 'bg-dark-card border-dark-border text-text-secondary hover:text-text-primary'
            }`}>
            {'★'.repeat(r)}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {items.map(fb => {
          const visitor = fb.conversation?.session
          let interests: string[] = []
          try { if (fb.interestedIn) interests = JSON.parse(fb.interestedIn) } catch {}

          return (
            <div key={fb.id} className="bg-dark-card border border-dark-border rounded-2xl p-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={14} className={i < fb.rating
                          ? `fill-current ${ratingStarColors[fb.rating]}`
                          : 'text-dark-border'} />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${ratingColors[fb.rating]}`}>{ratingLabels[fb.rating]}</span>
                    {fb.resolved && <CheckCircle size={14} className="text-green-600" />}
                  </div>
                  {visitor?.visitorName && (
                    <p className="text-sm font-medium text-text-primary mb-1">
                      {visitor.visitorName}
                      {visitor.visitorCompany && <span className="text-text-secondary font-normal"> · {visitor.visitorCompany}</span>}
                    </p>
                  )}
                  {fb.comments && <p className="text-sm text-text-secondary mb-2">{fb.comments}</p>}
                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {interests.map(item => (
                        <span key={item} className="text-xs px-2 py-0.5 bg-brand-red-muted text-brand-red rounded-full border border-red-100">{item}</span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-muted shrink-0">{format(fb.createdAt, 'MMM d, HH:mm')}</p>
              </div>
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">No feedback yet.</div>
        )}
      </div>

      {total > 20 && (
        <div className="flex justify-between mt-4">
          {skip > 0 && <Link href={`?skip=${skip - 20}`} className="text-sm text-brand-red hover:underline">← Previous</Link>}
          {skip + 20 < total && <Link href={`?skip=${skip + 20}`} className="text-sm text-brand-red hover:underline ml-auto">Next →</Link>}
        </div>
      )}
    </div>
  )
}
