'use client'
import { useState } from 'react'
import { X, Send, CheckCircle } from 'lucide-react'

const SOLUTIONS = [
  'ALLBOTIX Robotics',
  'AI Solutions (Computer Vision)',
  'AV Products',
  'AV Integrations',
  'Automation',
  'Smart Surveillance',
  'Meeting Room Solutions',
  'All Solutions',
]

const TIMELINES = [
  'Immediately',
  'Within 1 month',
  '1–3 months',
  '3–6 months',
  'Just exploring',
]

interface FormFields {
  name: string
  email: string
  phone: string
  company: string
  solution: string
  requirements: string
  timeline: string
}

interface Props {
  sessionToken: string
  conversationId?: string
  onClose: () => void
  onSubmit: (details: Partial<FormFields>) => void
}

const iStyle = {
  width: '100%',
  background: '#FFFFFF',
  border: '1px solid #E5E4DF',
  borderRadius: 14,
  padding: '13px 16px',
  color: '#0F0F0E',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = 'rgba(220,38,38,0.38)'
  e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.06)'
}
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = '#E5E4DF'
  e.target.style.boxShadow = 'none'
}

export function BookDemoForm({ onClose, onSubmit }: Props) {
  const [fields, setFields] = useState<FormFields>({
    name: '', email: '', phone: '', company: '', solution: '', requirements: '', timeline: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const set = (k: keyof FormFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = () => {
    const filled = Object.fromEntries(Object.entries(fields).filter(([, v]) => v.trim() !== ''))
    onSubmit(filled)
    setSubmitted(true)
  }

  const backdrop = { background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(14px)' } as const

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={backdrop}>
        <div className="w-full max-w-md rounded-[28px] p-8 text-center animate-slide-up"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E4DF',
            boxShadow: '0 32px 80px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)',
          }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#F0FDF4', border: '1px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Request Submitted!</h2>
          <p className="text-text-secondary text-sm mb-6">Our team will reach out shortly to discuss your requirements.</p>
          <button onClick={onClose} className="w-full py-4 text-white font-semibold rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
              boxShadow: '0 6px 20px rgba(220,38,38,0.24)',
            }}>
            Continue Conversation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4" style={backdrop}>
      <div className="w-full max-w-md rounded-[24px] p-5 sm:p-6 animate-slide-up relative overflow-y-auto max-h-[90svh]"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E4DF',
          boxShadow: '0 32px 80px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)',
        }}>

        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary">Discuss Your Requirements</h2>
            <p className="text-xs text-text-muted mt-0.5">All fields optional — fill what you can</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary transition-all shrink-0"
            style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}>
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {/* Row 1: Name + Phone */}
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Your Name" value={fields.name}
              onChange={set('name')} style={iStyle} onFocus={onFocus} onBlur={onBlur}
              className="placeholder-text-muted" />
            <input type="tel" placeholder="Phone/WhatsApp" value={fields.phone}
              onChange={set('phone')} style={iStyle} onFocus={onFocus} onBlur={onBlur}
              className="placeholder-text-muted" />
          </div>

          {/* Row 2: Email + Company */}
          <div className="grid grid-cols-2 gap-2">
            <input type="email" placeholder="Email Address" value={fields.email}
              onChange={set('email')} style={iStyle} onFocus={onFocus} onBlur={onBlur}
              className="placeholder-text-muted" />
            <input type="text" placeholder="Company Name" value={fields.company}
              onChange={set('company')} style={iStyle} onFocus={onFocus} onBlur={onBlur}
              className="placeholder-text-muted" />
          </div>

          {/* Interested Solution */}
          <select value={fields.solution} onChange={set('solution')}
            style={{
              ...iStyle,
              appearance: 'none',
              cursor: 'pointer',
              color: fields.solution ? '#0F0F0E' : '#A0A09C',
            }}
            onFocus={onFocus} onBlur={onBlur}>
            <option value="">Interested Solution (optional)</option>
            {SOLUTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Timeline */}
          <select value={fields.timeline} onChange={set('timeline')}
            style={{
              ...iStyle,
              appearance: 'none',
              cursor: 'pointer',
              color: fields.timeline ? '#0F0F0E' : '#A0A09C',
            }}
            onFocus={onFocus} onBlur={onBlur}>
            <option value="">Timeline (optional)</option>
            {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Requirement Details */}
          <textarea
            placeholder="Describe your requirement (optional)"
            value={fields.requirements}
            onChange={set('requirements')}
            rows={3}
            style={{ ...iStyle, resize: 'none' }}
            onFocus={onFocus}
            onBlur={onBlur}
            className="placeholder-text-muted"
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="px-4 py-3.5 rounded-2xl text-text-secondary hover:text-text-primary transition-all text-sm font-medium shrink-0"
            style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}>
            Skip
          </button>
          <button onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold rounded-2xl text-sm"
            style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
              boxShadow: '0 6px 20px rgba(220,38,38,0.24)',
            }}>
            <Send size={14} /> Submit Request
          </button>
        </div>
      </div>
    </div>
  )
}
