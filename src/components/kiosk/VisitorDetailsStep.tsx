'use client'
import { useState } from 'react'
import { ArrowLeft, User, Mail, Phone, Building2, Briefcase, Globe, MessageCircle, CheckCircle, Sparkles } from 'lucide-react'

interface Details {
  company: string
  name: string
  designation: string
  phone: string
  email: string
  industry: string
}

interface Props {
  onChatWithAgent: (details: Partial<Details>) => void
  onFinish: (details: Partial<Details>) => void
  onReset: () => void
  onBack: () => void
}

const INDUSTRIES = [
  'Healthcare', 'Hospitality', 'Retail', 'Manufacturing',
  'Education', 'Government', 'Real Estate', 'Finance', 'Other',
]

const STARS = [
  { left: '10%', top: '10%', delay: '0s',    color: '#DC2626', size: 26 },
  { left: '28%', top: '6%',  delay: '0.10s', color: '#F59E0B', size: 20 },
  { left: '48%', top: '4%',  delay: '0.18s', color: '#EF4444', size: 24 },
  { left: '65%', top: '8%',  delay: '0.08s', color: '#F59E0B', size: 18 },
  { left: '80%', top: '14%', delay: '0.25s', color: '#DC2626', size: 16 },
  { left: '88%', top: '28%', delay: '0.32s', color: '#FBBF24', size: 20 },
  { left: '5%',  top: '28%', delay: '0.14s', color: '#F59E0B', size: 14 },
  { left: '18%', top: '22%', delay: '0.22s', color: '#DC2626', size: 12 },
  { left: '72%', top: '22%', delay: '0.28s', color: '#EF4444', size: 14 },
  { left: '55%', top: '18%', delay: '0.36s', color: '#DC2626', size: 18 },
  { left: '38%', top: '14%', delay: '0.05s', color: '#FBBF24', size: 22 },
  { left: '92%', top: '42%', delay: '0.40s', color: '#DC2626', size: 12 },
  { left: '3%',  top: '46%', delay: '0.30s', color: '#F59E0B', size: 16 },
  { left: '82%', top: '52%', delay: '0.45s', color: '#FBBF24', size: 10 },
  { left: '12%', top: '55%', delay: '0.20s', color: '#EF4444', size: 12 },
]

export function VisitorDetailsStep({ onChatWithAgent, onFinish, onReset, onBack }: Props) {
  const [details, setDetails] = useState<Details>({
    company: '', name: '', designation: '', phone: '', email: '', industry: '',
  })
  const [errors, setErrors] = useState<{ company?: boolean; name?: boolean }>({})
  const [showThankYou, setShowThankYou] = useState(false)

  const set = (key: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDetails(prev => ({ ...prev, [key]: e.target.value }))

  const getFilledDetails = () =>
    Object.fromEntries(Object.entries(details).filter(([, v]) => v.trim() !== ''))

  const validate = () => {
    const errs: { company?: boolean; name?: boolean } = {}
    if (!details.company.trim()) errs.company = true
    if (!details.name.trim()) errs.name = true
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChat = () => {
    if (!validate()) return
    onChatWithAgent(getFilledDetails())
  }

  const handleFinish = () => {
    if (!validate()) return
    onFinish(getFilledDetails())
    setShowThankYou(true)
  }

  const inputBase = {
    width: '100%',
    background: '#FFFFFF',
    border: '1px solid #E5E4DF',
    borderRadius: 14,
    padding: '14px 14px 14px 44px',
    color: '#0F0F0E',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const onFocusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(220,38,38,0.38)'
    e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.06)'
  }
  const onBlurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#E5E4DF'
    e.target.style.boxShadow = 'none'
  }

  const fields = [
    { key: 'company'     as const, icon: Building2, type: 'text',  placeholder: 'Company Name *',                   required: true  },
    { key: 'name'        as const, icon: User,       type: 'text',  placeholder: 'Your Name *',                      required: true  },
    { key: 'designation' as const, icon: Briefcase,  type: 'text',  placeholder: 'e.g. CEO, IT Manager (optional)',  required: false },
    { key: 'phone'       as const, icon: Phone,      type: 'tel',   placeholder: '+91 99000 00000 (optional)',        required: false },
    { key: 'email'       as const, icon: Mail,       type: 'email', placeholder: 'john@company.com (optional)',       required: false },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-5">
        <p className="text-xs font-semibold text-brand-red tracking-[0.22em] uppercase mb-2">Step 3 of 3</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Your Details</h2>
        <p className="text-text-secondary text-sm mt-1.5">
          Company &amp; Name required · others optional
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
        {fields.map(({ key, icon: Icon, type, placeholder, required }) => (
          <div key={key} className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: errors[key as keyof typeof errors] ? '#DC2626' : '#A0A09C' }}>
              <Icon size={16} />
            </div>
            <input
              type={type}
              placeholder={placeholder}
              value={details[key]}
              onChange={set(key)}
              style={{
                ...inputBase,
                borderColor: errors[key as keyof typeof errors] ? 'rgba(220,38,38,0.50)' : '#E5E4DF',
                boxShadow: errors[key as keyof typeof errors] ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none',
              }}
              onFocus={e => { setErrors(p => ({ ...p, [key]: false })); onFocusInput(e) }}
              onBlur={onBlurInput}
            />
            {errors[key as keyof typeof errors] && (
              <p className="text-xs text-brand-red mt-1 ml-1">{required ? 'This field is required' : ''}</p>
            )}
          </div>
        ))}

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <Globe size={16} />
          </div>
          <select
            value={details.industry}
            onChange={set('industry')}
            style={{
              ...inputBase,
              cursor: 'pointer',
              appearance: 'none',
              color: details.industry ? '#0F0F0E' : '#A0A09C',
            }}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
          >
            <option value="">Industry (optional)</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2 mt-5">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleFinish}
            className="flex items-center justify-center gap-1.5 py-4 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: '#FEF2F2',
              border: '1.5px solid rgba(220,38,38,0.30)',
              color: '#DC2626',
            }}
          >
            <CheckCircle size={15} />
            Finish
          </button>
          <button
            onClick={handleChat}
            className="flex items-center justify-center gap-1.5 py-4 text-white font-semibold rounded-2xl transition-all text-sm active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
              boxShadow: '0 4px 16px rgba(220,38,38,0.22)',
            }}
          >
            <MessageCircle size={15} />
            Chat with Agent
          </button>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-text-secondary hover:text-text-primary transition-all text-sm"
          style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Thank You overlay — identical to ChatStep Finish overlay */}
      {showThankYou && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(15,15,14,0.72)', backdropFilter: 'blur(16px)' }}>

          <style>{`
            @keyframes vdStarFall {
              0%   { opacity: 0; transform: translateY(-50px) scale(0) rotate(0deg); }
              18%  { opacity: 1; transform: translateY(10px) scale(1.3) rotate(25deg); }
              55%  { opacity: 1; transform: translateY(30px) scale(1) rotate(-12deg); }
              100% { opacity: 0; transform: translateY(100px) scale(0.3) rotate(40deg); }
            }
            @keyframes vdCardIn {
              0%   { opacity: 0; transform: scale(0.5) translateY(20px); }
              55%  { opacity: 1; transform: scale(1.04) translateY(-4px); }
              80%  { transform: scale(0.98) translateY(2px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {STARS.map((s, i) => (
            <div key={i} className="fixed pointer-events-none"
              style={{
                left: s.left, top: s.top,
                animation: `vdStarFall 1.6s ${s.delay} ease-out forwards`,
                fontSize: s.size,
                color: s.color,
                zIndex: 51,
                lineHeight: 1,
              }}>
              ★
            </div>
          ))}

          <div className="relative mx-4 w-full max-w-sm rounded-[28px] p-8 text-center"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10)',
              animation: 'vdCardIn 0.6s ease-out forwards',
            }}>

            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 100%)', border: '2px solid rgba(220,38,38,0.18)' }}>
                <span style={{ fontSize: 42 }}>🌟</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Sparkles size={13} className="text-brand-red" />
              <p className="text-xs font-bold text-brand-red tracking-[0.22em] uppercase">Nanta Tech</p>
              <Sparkles size={13} className="text-brand-red" />
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-2">Thank You!</h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Thank you for visiting the <strong>Nanta Tech Experience Days</strong>. We hope you loved exploring the future of AI, Robotics &amp; AV. See you at our next event!
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowThankYou(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all"
                style={{ background: '#F8F7F4', border: '1px solid #E5E4DF', color: '#6B6B67' }}
              >
                Continue
              </button>
              <button
                onClick={onReset}
                className="flex-1 py-3 text-white font-semibold rounded-2xl transition-all text-sm"
                style={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                  boxShadow: '0 4px 14px rgba(220,38,38,0.28)',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
