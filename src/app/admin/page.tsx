import { conversationRepo } from '@/repositories/ConversationRepository'
import { feedbackRepo } from '@/repositories/FeedbackRepository'
import { leadRepo } from '@/repositories/LeadRepository'
import { prisma } from '@/lib/db/prisma'
import {
  Users, MessageSquare, Star, UserCheck, TrendingUp,
  Bot, Volume2, Zap, Settings, User, CheckCircle2, BarChart3,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

function RatingBar({ value }: { value: number | null }) {
  const pct = value ? (value / 5) * 100 : 0
  const color = value && value >= 4 ? 'bg-green-500' : value && value >= 3 ? 'bg-amber-500' : 'bg-brand-red'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-dark-elevated rounded-full overflow-hidden border border-dark-border">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-text-primary w-8 text-right">
        {value ? `${value}` : '—'}
      </span>
    </div>
  )
}

function SentimentBadge({ value }: { value: string | null }) {
  const map: Record<string, string> = {
    positive: 'text-green-700 bg-green-50 border-green-200',
    negative: 'text-red-700   bg-red-50   border-red-200',
    neutral:  'text-amber-700 bg-amber-50  border-amber-200',
  }
  const label = value || 'neutral'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${map[label] || map.neutral}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  )
}

export default async function AdminDashboard() {
  const [convStats, feedbackStats, leadStats, totalVisitors, interestedIn, deptRatings] = await Promise.all([
    conversationRepo.getDashboardStats(),
    feedbackRepo.getStats(),
    leadRepo.getStats(),
    prisma.session.count(),
    conversationRepo.getInterestedInStats(),
    conversationRepo.getDepartmentRatingAverages(),
  ])

  const { items: recentConvs } = await conversationRepo.findAll({ take: 5 })

  const statCards = [
    { title: 'Total Visitors',       value: totalVisitors,                           icon: Users,        color: 'text-blue-600' },
    { title: 'Conversations',        value: convStats.total,                          icon: MessageSquare,color: 'text-purple-600' },
    { title: 'Leads Captured',       value: leadStats.total,                          icon: UserCheck,    color: 'text-green-700' },
    { title: 'High Priority Leads',  value: leadStats.high,                           icon: TrendingUp,   color: 'text-brand-red' },
    { title: 'Chat Feedback',        value: feedbackStats.total,                      icon: Star,         color: 'text-amber-600' },
    { title: 'Avg. Chat Rating',     value: feedbackStats.average ? `${feedbackStats.average}/5` : 'N/A', icon: Star, color: 'text-amber-600' },
  ]

  const deptItems = [
    { key: 'ai'         as const, label: 'AI Solutions',         icon: Bot      },
    { key: 'av'         as const, label: 'AV Technology',         icon: Volume2  },
    { key: 'robotics'   as const, label: 'Robotics',              icon: Zap      },
    { key: 'automation' as const, label: 'Automation',            icon: Settings },
    { key: 'experience' as const, label: 'Customer Experience',   icon: User     },
  ]

  const ratingDistribution = feedbackStats.distribution || {}
  const maxRating = Math.max(...Object.values(ratingDistribution), 1)

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Nanta Experience Days Kiosk — Real-time visitor analytics</p>
      </div>

      {/* Benefits Banner */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <BarChart3 size={20} className="text-brand-red" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text-primary mb-1">
              AI can collect customer feedback instantly and provide meaningful analysis.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              {[
                { icon: CheckCircle2, label: 'Faster feedback collection' },
                { icon: CheckCircle2, label: 'No manual data entry' },
                { icon: CheckCircle2, label: 'Instant reporting' },
                { icon: CheckCircle2, label: 'Better customer understanding' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={14} className="text-brand-red shrink-0" />
                  <span className="text-sm text-text-secondary">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="bg-dark-card border border-dark-border rounded-2xl p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-text-secondary">{title}</p>
              <Icon size={18} className={color} />
            </div>
            <p className="text-3xl font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department Ratings */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 className="font-semibold text-text-primary mb-1">Department Ratings</h3>
          <p className="text-xs text-text-muted mb-4">Average visitor ratings from kiosk onboarding</p>
          <div className="space-y-4">
            {deptItems.map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={14} className="text-text-muted" />
                  <span className="text-sm text-text-secondary">{label}</span>
                </div>
                <RatingBar value={deptRatings[key]} />
              </div>
            ))}
          </div>
        </div>

        {/* Interest Areas */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 className="font-semibold text-text-primary mb-1">Visitor Interest Areas</h3>
          <p className="text-xs text-text-muted mb-4">Selected during onboarding</p>
          {Object.keys(interestedIn).length === 0 ? (
            <p className="text-text-muted text-sm py-4">No data yet — visitors will be tracked as they use the kiosk.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(interestedIn)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([label, count]) => {
                  const maxCount = Math.max(...Object.values(interestedIn))
                  const pct = Math.round((count / maxCount) * 100)
                  return (
                    <div key={label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-text-primary">{label}</span>
                        <span className="text-sm font-semibold text-brand-red">{count}</span>
                      </div>
                      <div className="h-1.5 bg-dark-elevated border border-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-brand-red rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 className="font-semibold text-text-primary mb-4">Recent Visitor Conversations</h3>
        {recentConvs.length === 0 ? (
          <p className="text-text-muted text-sm">No conversations yet.</p>
        ) : (
          <div className="space-y-3">
            {recentConvs.map(conv => {
              const session = (conv as unknown as { session?: { visitorName?: string | null; selectedInterests?: string | null } }).session
              let topics: string[] = []
              try {
                if (conv.topicsDiscussed) topics = JSON.parse(conv.topicsDiscussed)
              } catch { /* ignore */ }

              return (
                <div key={conv.id} className="flex items-center gap-4 py-3 border-b border-dark-border last:border-0">
                  <div className="w-9 h-9 rounded-full bg-dark-elevated border border-dark-border flex items-center justify-center shrink-0">
                    <User size={14} className="text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {session?.visitorName || 'Anonymous Visitor'}
                      </p>
                      {conv.sentiment && <SentimentBadge value={conv.sentiment} />}
                    </div>
                    {topics.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {topics.slice(0, 3).map(t => (
                          <span key={t} className="text-xs px-2 py-0.5 bg-dark-elevated text-text-muted rounded-full border border-dark-border">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {conv.leadScore !== null && (
                      <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        conv.leadScore >= 70 ? 'bg-green-50 text-green-700 border border-green-200' :
                        conv.leadScore >= 40 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-dark-elevated text-text-muted border border-dark-border'
                      }`}>
                        Lead: {conv.leadScore}
                      </div>
                    )}
                    <p className="text-xs text-text-muted mt-1">{conv.messageCount} msgs</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chat Feedback Distribution */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 className="font-semibold text-text-primary mb-4">Chat Feedback Distribution</h3>
          {feedbackStats.total === 0 ? (
            <p className="text-text-muted text-sm">No chat feedback yet.</p>
          ) : (
            Object.entries({ 5: 'Excellent', 4: 'Good', 3: 'Average', 2: 'Needs Improvement', 1: 'Poor' }).map(([num, label]) => {
              const count = ratingDistribution[parseInt(num)] || 0
              const pct = maxRating > 0 ? Math.round((count / maxRating) * 100) : 0
              return (
                <div key={num} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-text-secondary w-28 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-dark-elevated border border-dark-border rounded-full overflow-hidden">
                    <div className="h-full bg-brand-red rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-text-secondary w-6 text-right">{count}</span>
                </div>
              )
            })
          )}
        </div>

        {/* Lead Pipeline */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 className="font-semibold text-text-primary mb-4">Lead Pipeline</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'High Priority',   value: leadStats.high,      color: 'text-red-700'   },
              { label: 'Medium Priority', value: leadStats.medium,    color: 'text-amber-700' },
              { label: 'Low Priority',    value: leadStats.low,       color: 'text-green-700' },
              { label: 'Contacted',       value: leadStats.contacted, color: 'text-blue-700'  },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-3 bg-dark-elevated border border-dark-border rounded-xl">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
