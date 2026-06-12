'use client'
import { useState } from 'react'
import { Check, ArrowRight, ArrowLeft, Bot, Volume2, Zap, Settings, Shield, Building2, Scan, Car, Monitor, Ellipsis } from 'lucide-react'

const INTERESTS = [
  { label: 'AI Solutions',      icon: Bot,       accent: '#3B82F6' },
  { label: 'AV Technology',     icon: Volume2,   accent: '#A855F7' },
  { label: 'Robotics',          icon: Zap,       accent: '#D97706' },
  { label: 'Automation',        icon: Settings,  accent: '#16A34A' },
  { label: 'Security',          icon: Shield,    accent: '#DC2626' },
  { label: 'Smart Cities',      icon: Building2, accent: '#0891B2' },
  { label: 'Face Recognition',  icon: Scan,      accent: '#EA580C' },
  { label: 'Vehicle Detection', icon: Car,       accent: '#0D9488' },
  { label: 'Smart Reception',   icon: Monitor,   accent: '#6366F1' },
  { label: 'Other',             icon: Ellipsis,  accent: '#6B7280' },
]

interface Props {
  onNext: (interests: string[]) => void
  onBack: () => void
}

function hexToRgb(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '0,0,0'
}

export function InterestStep({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [otherText, setOtherText] = useState('')

  const toggle = (label: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  const handleContinue = () => {
    const arr = Array.from(selected)
    if (selected.has('Other') && otherText.trim()) {
      const idx = arr.indexOf('Other')
      arr[idx] = otherText.trim()
    }
    onNext(arr)
  }

  const otherSelected = selected.has('Other')

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-5">
        <p className="text-xs font-semibold text-brand-red tracking-[0.22em] uppercase mb-2">Step 2 of 3</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Areas of Interest</h2>
        <p className="text-text-secondary text-sm mt-1.5">Select everything that interests you</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2.5">
          {INTERESTS.map(({ label, icon: Icon, accent }) => {
            const sel = selected.has(label)
            const rgb = hexToRgb(accent)
            return (
              <button
                key={label}
                onClick={() => toggle(label)}
                className="relative flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all text-center active:scale-95"
                style={{
                  background: sel ? `rgba(${rgb}, 0.06)` : '#FFFFFF',
                  border: `1px solid ${sel ? `rgba(${rgb}, 0.30)` : '#E5E4DF'}`,
                  boxShadow: sel
                    ? `0 2px 12px rgba(${rgb}, 0.10), 0 1px 3px rgba(0,0,0,0.04)`
                    : '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                {sel && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: accent }}>
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                )}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `rgba(${rgb}, 0.09)`,
                    border: `1px solid rgba(${rgb}, 0.18)`,
                  }}>
                  <Icon size={21} style={{ color: accent }} />
                </div>
                <span className="text-xs font-semibold leading-tight"
                  style={{ color: sel ? '#0F0F0E' : '#6B6B67' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {/* "Other" text field — only visible when Other is selected */}
        {otherSelected && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Please describe your interest…"
              value={otherText}
              onChange={e => setOtherText(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid rgba(107,114,128,0.35)',
                borderRadius: 14,
                padding: '13px 16px',
                color: '#0F0F0E',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(220,38,38,0.38)'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.06)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(107,114,128,0.35)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-4 rounded-2xl text-text-secondary hover:text-text-primary transition-all text-sm"
          style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 flex items-center justify-center gap-2 py-4 text-white font-semibold rounded-2xl transition-all text-sm"
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
            boxShadow: '0 4px 16px rgba(220,38,38,0.22)',
          }}
        >
          {selected.size > 0 ? `Continue (${selected.size} selected)` : 'Skip'}
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
