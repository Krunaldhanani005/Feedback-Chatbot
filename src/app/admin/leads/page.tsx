import { leadRepo } from '@/repositories/LeadRepository'
import { format } from 'date-fns'
import { Mail, Phone, Building2, Download } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const priorityColors: Record<string, string> = {
  high:   'text-red-700   bg-red-50    border-red-200',
  medium: 'text-amber-700 bg-amber-50  border-amber-200',
  low:    'text-green-700 bg-green-50  border-green-200',
}

const statusColors: Record<string, string> = {
  new:       'text-blue-700   bg-blue-50   border-blue-200',
  contacted: 'text-green-700  bg-green-50  border-green-200',
  qualified: 'text-purple-700 bg-purple-50 border-purple-200',
  converted: 'text-amber-700  bg-amber-50  border-amber-200',
  lost:      'text-text-muted bg-dark-elevated border-dark-border',
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ skip?: string; priority?: string; status?: string }>
}) {
  const params = await searchParams
  const skip = parseInt(params?.skip || '0')
  const stats = await leadRepo.getStats()
  const { total, items } = await leadRepo.findAll({
    skip, take: 20,
    priority: params?.priority,
    status: params?.status,
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
          <p className="text-text-secondary text-sm mt-1">{stats.total} total — {stats.high} high priority</p>
        </div>
        <a
          href="/api/admin/leads?format=csv"
          className="flex items-center gap-2 px-4 py-2 bg-dark-elevated border border-dark-border hover:border-brand-red/40 text-text-secondary hover:text-text-primary rounded-xl text-sm transition-colors"
        >
          <Download size={14} />
          Export CSV
        </a>
      </div>

      <div className="space-y-3">
        {items.map(lead => {
          let interests: string[] = []
          try { if (lead.interestedIn) interests = JSON.parse(lead.interestedIn) } catch {}

          return (
            <div key={lead.id} className="bg-dark-card border border-dark-border rounded-2xl p-5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-text-primary">{lead.name || 'Anonymous'}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColors[lead.priority]}`}>
                      {lead.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </div>
                  {lead.designation && <p className="text-xs text-text-muted">{lead.designation}</p>}
                </div>
                <p className="text-xs text-text-muted shrink-0">{format(lead.createdAt, 'MMM d, HH:mm')}</p>
              </div>
              <div className="flex flex-wrap gap-4 mb-3">
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-brand-red transition-colors">
                    <Mail size={12} />
                    {lead.email}
                  </a>
                )}
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-brand-red transition-colors">
                    <Phone size={12} />
                    {lead.phone}
                  </a>
                )}
                {lead.company && (
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Building2 size={12} />
                    {lead.company}
                  </span>
                )}
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {interests.map(item => (
                    <span key={item} className="text-xs px-2 py-0.5 bg-brand-red-muted text-brand-red rounded-full border border-red-100">{item}</span>
                  ))}
                </div>
              )}
              {lead.conversation?.summary && (
                <p className="text-xs text-text-muted mt-2 line-clamp-2">{lead.conversation.summary}</p>
              )}
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">No leads yet.</div>
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
