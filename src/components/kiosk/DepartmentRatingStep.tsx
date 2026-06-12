'use client'
import { useState } from 'react'
import { Star, Bot, Volume2, Zap, Settings, Users, ArrowRight, ArrowLeft } from 'lucide-react'

interface Ratings {
  ai: number
  av: number
  robotics: number
  automation: number
  experience: number
}

interface Props {
  onNext: (ratings: Ratings) => void
  onBack: () => void
}

const departments = [
  { key: 'ai'         as keyof Ratings, label: 'AI Solutions',       subtitle: 'Computer Vision & Analytics', icon: Bot,      accent: '#3B82F6' },
  { key: 'av'         as keyof Ratings, label: 'AV Technology',       subtitle: 'Displays & Smart Rooms',      icon: Volume2,  accent: '#A855F7' },
  { key: 'robotics'   as keyof Ratings, label: 'Robotics',            subtitle: 'Service & Delivery Robots',   icon: Zap,      accent: '#D97706' },
  { key: 'automation' as keyof Ratings, label: 'Automation',          subtitle: 'Smart Infrastructure',        icon: Settings, accent: '#16A34A' },
  { key: 'experience' as keyof Ratings, label: 'Overall Experience',  subtitle: 'Visit Quality & Service',     icon: Users,    accent: '#DB2777' },
]

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

function hexToRgb(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '0,0,0'
}

function StarRating({ value, onChange, size = 26 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{ minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            size={size}
            className="transition-all duration-150"
            style={{
              fill: star <= (hover || value) ? '#D97706' : 'transparent',
              color: star <= (hover || value) ? '#D97706' : '#D1D0CB',
              filter: star <= (hover || value) ? 'drop-shadow(0 1px 3px rgba(217,119,6,0.28))' : 'none',
            }}
          />
        </button>
      ))}
    </div>
  )
}

export function DepartmentRatingStep({ onNext, onBack }: Props) {
  const [ratings, setRatings] = useState<Ratings>({ ai: 0, av: 0, robotics: 0, automation: 0, experience: 0 })
  const setRating = (key: keyof Ratings, value: number) => setRatings(prev => ({ ...prev, [key]: value }))
  const hasAnyRating = Object.values(ratings).some(v => v > 0)

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <p className="text-xs font-semibold text-brand-red tracking-[0.22em] uppercase mb-2">Step 1 of 3</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Rate Your Experience</h2>
        <p className="text-text-secondary text-sm mt-1">How was each area of the experience center?</p>
      </div>

      {/* Rating cards */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {departments.map(({ key, label, subtitle, icon: Icon, accent }) => {
          const rating = ratings[key]
          const rated = rating > 0
          const rgb = hexToRgb(accent)
          return (
            <div
              key={key}
              className="rounded-2xl border transition-all duration-200 p-3 sm:p-4"
              style={{
                background: rated ? `rgba(${rgb}, 0.04)` : '#FFFFFF',
                borderColor: rated ? `rgba(${rgb}, 0.25)` : '#E5E4DF',
                boxShadow: rated
                  ? `0 2px 8px rgba(${rgb}, 0.08), 0 1px 3px rgba(0,0,0,0.03)`
                  : '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              {/* ── Mobile (< sm): 2-row layout ── */}
              <div className="sm:hidden">
                {/* Row 1: icon + label */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `rgba(${rgb}, 0.09)`, border: `1px solid rgba(${rgb}, 0.18)` }}>
                    <Icon size={17} style={{ color: accent }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary text-sm leading-tight">{label}</p>
                    <p className="text-xs text-text-muted leading-tight mt-0.5">{subtitle}</p>
                  </div>
                </div>
                {/* Row 2: stars + rating label */}
                <div className="flex items-center justify-between">
                  <StarRating value={rating} onChange={v => setRating(key, v)} size={24} />
                  <span className="text-xs font-semibold shrink-0 ml-2"
                    style={{ color: rated ? '#D97706' : '#D1D0CB', minWidth: 48, textAlign: 'right' }}>
                    {rated ? ratingLabels[rating] : '— —'}
                  </span>
                </div>
              </div>

              {/* ── Tablet / Desktop (sm+): original single-row layout ── */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `rgba(${rgb}, 0.09)`, border: `1px solid rgba(${rgb}, 0.18)` }}>
                  <Icon size={20} style={{ color: accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm">{label}</p>
                  <p className="text-xs text-text-muted">{subtitle}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StarRating value={rating} onChange={v => setRating(key, v)} size={26} />
                  <span className="text-xs font-medium h-4"
                    style={{ color: rated ? '#D97706' : 'transparent' }}>
                    {ratingLabels[rating]}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Buttons */}
      <div className="mt-4">
        <div className="flex gap-2.5 mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-4 rounded-2xl text-text-secondary hover:text-text-primary transition-all text-sm shrink-0"
            style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <button
            onClick={() => onNext(ratings)}
            disabled={!hasAnyRating}
            className="flex-1 flex items-center justify-center gap-2 py-4 font-semibold rounded-2xl transition-all text-sm"
            style={{
              background: hasAnyRating ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' : '#F8F7F4',
              border: hasAnyRating ? 'none' : '1px solid #E5E4DF',
              color: hasAnyRating ? 'white' : '#A0A09C',
              boxShadow: hasAnyRating ? '0 4px 16px rgba(220,38,38,0.22)' : 'none',
              cursor: hasAnyRating ? 'pointer' : 'not-allowed',
            }}
          >
            Continue <ArrowRight size={15} />
          </button>
        </div>
        <button
          onClick={() => onNext(ratings)}
          className="w-full text-xs text-text-muted py-1 transition-colors hover:text-text-secondary"
        >
          Skip ratings →
        </button>
      </div>
    </div>
  )
}
