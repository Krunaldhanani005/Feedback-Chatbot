'use client'
import { Sparkles, ArrowRight, Calendar, Clock } from 'lucide-react'

interface Props {
  onNext: () => void
}

export function WelcomeStep({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 sm:px-8 sm:py-10 text-center relative overflow-hidden">

      {/* Subtle warm glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full blur-[60px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(220,38,38,0.06) 0%, transparent 70%)' }} />

      {/* Logo icon */}
      <div className="mb-6 relative">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28">
          <div className="absolute inset-0 rounded-3xl animate-pulse-slow"
            style={{ border: '1px solid rgba(220,38,38,0.12)' }} />
          <div className="w-full h-full rounded-3xl flex items-center justify-center"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(229,228,223,0.9)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)',
            }}>
            <img src="/nanta-logo.png" alt="Nanta Tech" style={{ width: 52, height: 52, objectFit: 'contain' }} />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md"
            style={{ border: '2px solid #FFFFFF' }}>
            <Sparkles size={13} className="text-white" />
          </div>
        </div>
      </div>

      {/* Brand label */}
      <p className="text-xs font-semibold text-brand-red tracking-[0.28em] uppercase mb-3">
        Nanta Tech Limited
      </p>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-1 text-text-primary">
        Nanta Tech
      </h1>
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-1 text-gradient">
        Experience Days
      </h1>

      {/* Date & Time badges */}
      <div className="flex items-center gap-2.5 mt-3 mb-4 flex-wrap justify-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: '#FEF2F2',
            border: '1px solid rgba(220,38,38,0.22)',
            color: '#DC2626',
          }}>
          <Calendar size={11} />
          18 – 20 June 2026
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary"
          style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}>
          <Clock size={11} />
          9:00 AM – 8:00 PM
        </div>
      </div>

      {/* Thank you subtitle */}
      <p className="text-text-secondary text-sm sm:text-base mb-7 max-w-xs sm:max-w-sm leading-relaxed">
        Thank you for joining us today. We're thrilled to have you experience the future of AI, Robotics & AV innovation.
      </p>

      {/* CTA */}
      <button
        onClick={onNext}
        className="group flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 text-white text-base sm:text-lg font-semibold rounded-2xl transition-all duration-200 active:scale-95 hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
          boxShadow: '0 8px 24px rgba(220,38,38,0.28), 0 2px 6px rgba(220,38,38,0.14)',
        }}
      >
        Begin Experience
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <p className="mt-5 text-xs text-text-muted">
        Tap to start · Session is private &amp; secure
      </p>

      {/* Decorative bottom dots */}
      <div className="absolute bottom-6 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-red" />
        <div className="w-2 h-2 rounded-full bg-dark-border" />
        <div className="w-2 h-2 rounded-full bg-dark-border" />
        <div className="w-2 h-2 rounded-full bg-dark-border" />
      </div>
    </div>
  )
}
