import { leadRepo } from '@/repositories/LeadRepository'
import { format } from 'date-fns'
import { Mail, Phone, Building2, MessageCircleQuestion, User, Download } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  new:       'text-blue-700   bg-blue-50   border-blue-200',
  contacted: 'text-green-700  bg-green-50  border-green-200',
  qualified: 'text-purple-700 bg-purple-50 border-purple-200',
  converted: 'text-amber-700  bg-amber-50  border-amber-200',
}

export default async function DiscussPage({
  searchParams,
}: {
  searchParams: Promise<{ skip?: string }>
}) {
  const params = await searchParams
  const skip = parseInt(params?.skip || '0')
  const { total, items } = await leadRepo.findRequirements({ skip, take: 20 })

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageCircleQuestion size={20} className="text-brand-red" />
            <h1 className="text-2xl font-bold text-text-primary">Discuss Requirements</h1>
          </div>
          <p className="text-text-secondary text-sm">
            {total} visitor{total !== 1 ? 's' : ''} submitted requirements — ready for sales followup
          </p>
        </div>
        <a
          href="/api/admin/leads?format=excel&intent=discuss_requirements"
          className="flex items-center gap-2 px-4 py-2 bg-dark-elevated border border-dark-border hover:border-brand-red/40 text-text-secondary hover:text-text-primary rounded-xl text-sm transition-colors"
        >
          <Download size={14} />
          Export Requirements
        </a>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <MessageCircleQuestion size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-text-muted text-sm">No requirements submitted yet.</p>
          <p className="text-text-muted text-xs mt-1">When visitors click &quot;Discuss Requirements&quot; and describe their needs, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(conv => {
            const session = conv.session
            const lead = conv.lead
            let interests: string[] = []
            try {
              if (session?.selectedInterests) interests = JSON.parse(session.selectedInterests)
            } catch {}

            const requirementText = lead?.notes?.replace(/\[Requirement\]: ?/g, '').trim()

            return (
              <div key={conv.id} className="bg-white border border-dark-border rounded-2xl p-5 space-y-3"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

                {/* Header */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <User size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-text-primary">{session?.visitorName || 'Anonymous Visitor'}</p>
                        {lead?.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[lead.status] || statusColors.new}`}>
                            {lead.status}
                          </span>
                        )}
                        {lead?.priority === 'high' && (
                          <span className="text-xs px-2 py-0.5 rounded-full border font-medium text-red-700 bg-red-50 border-red-200">high priority</span>
                        )}
                      </div>
                      {session?.visitorDesignation && (
                        <p className="text-xs text-slate-500 mt-0.5">{session.visitorDesignation}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-text-muted shrink-0">{format(conv.updatedAt, 'MMM d, yyyy · HH:mm')}</p>
                </div>

                {/* Contact */}
                {(session?.visitorCompany || session?.visitorEmail || session?.visitorPhone) && (
                  <div className="flex flex-wrap gap-x-5 gap-y-1">
                    {session?.visitorCompany && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                        <Building2 size={13} className="text-slate-400" />
                        {session.visitorCompany}
                      </span>
                    )}
                    {session?.visitorEmail && (
                      <a href={`mailto:${session.visitorEmail}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                        <Mail size={13} />
                        {session.visitorEmail}
                      </a>
                    )}
                    {session?.visitorPhone && (
                      <a href={`tel:${session.visitorPhone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                        <Phone size={13} />
                        {session.visitorPhone}
                      </a>
                    )}
                  </div>
                )}

                {/* Interests */}
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map(item => (
                      <span key={item} className="text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-100 font-medium">{item}</span>
                    ))}
                  </div>
                )}

                {/* Requirement */}
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1.5">
                    📋 Requirement
                  </p>
                  {requirementText ? (
                    <p className="text-sm text-red-900 leading-relaxed whitespace-pre-line font-medium">{requirementText}</p>
                  ) : conv.summary ? (
                    <p className="text-sm text-red-900 leading-relaxed font-medium">{conv.summary}</p>
                  ) : (
                    <p className="text-sm text-red-400 italic">Visitor clicked Discuss Requirements but has not yet described their needs.</p>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-between mt-6">
          {skip > 0 && <Link href={`?skip=${skip - 20}`} className="text-sm text-brand-red hover:underline">← Previous</Link>}
          <span className="text-xs text-text-muted mx-auto">{skip + 1}–{Math.min(skip + 20, total)} of {total}</span>
          {skip + 20 < total && <Link href={`?skip=${skip + 20}`} className="text-sm text-brand-red hover:underline ml-auto">Next →</Link>}
        </div>
      )}
    </div>
  )
}
