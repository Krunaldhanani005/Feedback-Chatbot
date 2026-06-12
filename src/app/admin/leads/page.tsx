'use client'
import { useEffect, useState } from 'react'
import { Mail, Phone, Building2, Download, Search, User, Star, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface SessionData {
  aiRating: number | null
  avRating: number | null
  roboticsRating: number | null
  automationRating: number | null
  experienceRating: number | null
  selectedInterests: string | null
}

interface ConvData {
  id: string
  summary: string | null
  userIntent: string | null
  topicsDiscussed: string | null
  sentiment: string | null
  leadScore: number | null
  messageCount: number
  session: SessionData | null
}

interface Lead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  company: string | null
  designation: string | null
  industry: string | null
  interestedIn: string | null
  notes: string | null
  status: string
  priority: string
  createdAt: string
  conversation: ConvData | null
}

const priorityColors: Record<string, string> = {
  high:   'text-red-700   bg-red-50    border-red-200',
  medium: 'text-amber-700 bg-amber-50  border-amber-200',
  low:    'text-slate-600 bg-slate-50  border-slate-200',
}
const statusColors: Record<string, string> = {
  new:       'text-blue-700   bg-blue-50   border-blue-200',
  contacted: 'text-green-700  bg-green-50  border-green-200',
  qualified: 'text-purple-700 bg-purple-50 border-purple-200',
  converted: 'text-amber-700  bg-amber-50  border-amber-200',
  lost:      'text-slate-500  bg-slate-50  border-slate-200',
}
const sentimentColors: Record<string, string> = {
  positive: 'text-green-700 bg-green-50',
  negative: 'text-red-700 bg-red-50',
  neutral:  'text-slate-600 bg-slate-50',
}

function RatingDots({ value, label }: { value: number | null; label: string }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={10}
            className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-600">{value}/5</span>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [skip, setSkip] = useState(0)
  const [exportDate, setExportDate] = useState('')

  const fetchLeads = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('skip', String(skip))
    params.set('take', '20')
    if (search)   params.set('search', search)
    if (priority) params.set('priority', priority)
    if (status)   params.set('status', status)
    const res = await fetch(`/api/admin/leads?${params}`)
    const data = await res.json() as { total: number; items: Lead[] }
    setLeads(data.items || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [skip, priority, status])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSkip(0)
    fetchLeads()
  }

  const handleExport = () => {
    const params = new URLSearchParams({ format: 'excel' })
    if (exportDate) {
      params.set('date', exportDate)
    }
    window.open(`/api/admin/leads?${params}`, '_blank')
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    fetchLeads()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
          <p className="text-text-secondary text-sm mt-1">{total} total visitors captured</p>
        </div>

        {/* Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-dark-border rounded-xl px-3 py-2">
            <span className="text-xs text-text-muted">Day:</span>
            <input
              type="date"
              value={exportDate}
              onChange={e => setExportDate(e.target.value)}
              className="text-xs text-text-primary bg-transparent outline-none"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-dark-elevated border border-dark-border hover:border-brand-red/40 text-text-secondary hover:text-text-primary rounded-xl text-sm transition-colors"
          >
            <Download size={14} />
            {exportDate ? `Export ${exportDate}` : 'Export All'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-dark-border rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, company..."
            className="text-sm text-text-primary bg-transparent outline-none w-full"
          />
        </form>
        <select value={priority} onChange={e => { setPriority(e.target.value); setSkip(0) }}
          className="text-sm px-3 py-2 bg-white border border-dark-border rounded-xl text-text-secondary outline-none">
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setSkip(0) }}
          className="text-sm px-3 py-2 bg-white border border-dark-border rounded-xl text-text-secondary outline-none">
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
        <button onClick={() => { setSkip(0); fetchLeads() }}
          className="px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl hover:border-brand-red/40 transition-colors">
          <RefreshCw size={14} className="text-text-muted" />
        </button>
      </div>

      {/* Lead Cards */}
      {loading ? (
        <div className="py-16 text-center text-text-muted text-sm">Loading...</div>
      ) : leads.length === 0 ? (
        <div className="py-16 text-center text-text-muted text-sm">No leads found.</div>
      ) : (
        <div className="space-y-4">
          {leads.map(lead => {
            let interests: string[] = []
            try { if (lead.interestedIn) interests = JSON.parse(lead.interestedIn) } catch {}

            let topics: string[] = []
            try { if (lead.conversation?.topicsDiscussed) topics = JSON.parse(lead.conversation.topicsDiscussed) } catch {}

            const session = lead.conversation?.session
            const hasRatings = session && (session.aiRating || session.avRating || session.roboticsRating || session.automationRating || session.experienceRating)

            return (
              <div key={lead.id} className="bg-white border border-dark-border rounded-2xl p-5 space-y-4"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

                {/* Row 1: Name + badges + date */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-text-primary">{lead.name || 'Anonymous'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColors[lead.priority]}`}>
                          {lead.priority}
                        </span>
                        <select
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.id, e.target.value)}
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium cursor-pointer outline-none ${statusColors[lead.status]}`}
                        >
                          {['new','contacted','qualified','converted','lost'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {lead.conversation?.sentiment && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sentimentColors[lead.conversation.sentiment] || sentimentColors.neutral}`}>
                            {lead.conversation.sentiment}
                          </span>
                        )}
                      </div>
                      {lead.designation && <p className="text-xs text-slate-500 mt-0.5">{lead.designation}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-text-muted shrink-0">{format(new Date(lead.createdAt), 'MMM d, yyyy · HH:mm')}</p>
                </div>

                {/* Row 2: Contact info */}
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {lead.company && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                      <Building2 size={13} className="text-slate-400" />
                      {lead.company}
                    </span>
                  )}
                  {lead.industry && (
                    <span className="text-sm text-slate-500">{lead.industry}</span>
                  )}
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                      <Mail size={13} />
                      {lead.email}
                    </a>
                  )}
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                      <Phone size={13} />
                      {lead.phone}
                    </a>
                  )}
                </div>

                {/* Row 3: Department Ratings */}
                {hasRatings && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Department Ratings</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
                      <RatingDots value={session!.aiRating}         label="AI Solutions"  />
                      <RatingDots value={session!.avRating}         label="AV Technology" />
                      <RatingDots value={session!.roboticsRating}   label="Robotics"      />
                      <RatingDots value={session!.automationRating} label="Automation"    />
                      <RatingDots value={session!.experienceRating} label="Experience"    />
                      {lead.conversation?.leadScore !== null && lead.conversation?.leadScore !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500 w-20 shrink-0">Lead Score</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            lead.conversation.leadScore >= 70 ? 'bg-green-100 text-green-700' :
                            lead.conversation.leadScore >= 40 ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>{lead.conversation.leadScore}/100</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Row 4: Interests + Topics */}
                {(interests.length > 0 || topics.length > 0) && (
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map(item => (
                      <span key={item} className="text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-100 font-medium">{item}</span>
                    ))}
                    {topics.filter(t => !interests.includes(t)).slice(0, 4).map(t => (
                      <span key={t} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">{t}</span>
                    ))}
                  </div>
                )}

                {/* Row 5: Conversation Summary — only when actual chat happened (messageCount > 0) */}
                {lead.conversation?.summary && (lead.conversation.messageCount ?? 0) > 0 && lead.notes?.includes('[Chat Summary]') && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-blue-600 mb-0.5">Chat Summary</p>
                    <p className="text-sm text-slate-700">{lead.conversation.summary}</p>
                    <p className="text-xs text-blue-400 mt-1">{lead.conversation.messageCount} messages exchanged</p>
                  </div>
                )}

                {/* Row 6: Requirements — red, shown when visitor used Discuss Requirements */}
                {lead.notes && lead.notes.includes('[Requirement]') && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-red-600 mb-0.5">📋 Requirement</p>
                    <p className="text-sm text-red-900 whitespace-pre-line font-medium">
                      {lead.notes.replace(/\[Requirement\]: ?/g, '').replace(/\[Chat Summary\]: ?/g, '').trim()}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-between mt-6">
          {skip > 0 && (
            <button onClick={() => setSkip(skip - 20)}
              className="text-sm text-brand-red hover:underline">← Previous</button>
          )}
          <span className="text-xs text-text-muted mx-auto">{skip + 1}–{Math.min(skip + 20, total)} of {total}</span>
          {skip + 20 < total && (
            <button onClick={() => setSkip(skip + 20)}
              className="text-sm text-brand-red hover:underline ml-auto">Next →</button>
          )}
        </div>
      )}
    </div>
  )
}
