'use client'
import { ExternalLink, MessageCircle, Phone } from 'lucide-react'
import type { SolutionCard as SolutionCardType } from '@/types/chat'

interface SolutionCardProps {
  solution: SolutionCardType
  onBookDemo?: () => void
  onContactUs?: () => void
}

export function SolutionCard({ solution, onBookDemo, onContactUs }: SolutionCardProps) {
  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E4DF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
      }}>
      {/* Solution image */}
      {solution.image && (
        <div className="w-full h-36 bg-[#F8F7F4] flex items-center justify-center overflow-hidden"
          style={{ borderBottom: '1px solid #E5E4DF' }}>
          <img
            src={solution.image}
            alt={solution.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
          />
        </div>
      )}
      <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs text-brand-red font-semibold">{solution.company}</span>
      </div>
      <h4 className="font-bold text-sm text-text-primary mb-1">{solution.name}</h4>
      <p className="text-xs text-text-secondary mb-2.5 line-clamp-2 leading-relaxed">{solution.description}</p>

      {/* Features / Capabilities */}
      {solution.features && solution.features.length > 0 && (
        <ul className="space-y-1 mb-2.5">
          {solution.features.slice(0, 4).map((f, i) => (
            <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
              <span className="w-1 h-1 bg-brand-red rounded-full shrink-0 mt-1.5" />
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Industries */}
      {solution.industries && solution.industries.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {solution.industries.slice(0, 4).map((ind, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: '#F3F2EE', border: '1px solid #E5E4DF', color: '#6B6B67' }}>
              {ind}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-1.5">
        {solution.learnMoreUrl && (
          <a
            href={solution.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full text-xs px-3 py-2 rounded-lg transition-all"
            style={{ background: '#F8F7F4', border: '1px solid #E5E4DF', color: '#6B6B67' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0F0F0E'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.22)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6B6B67'; e.currentTarget.style.borderColor = '#E5E4DF' }}
          >
            <ExternalLink size={11} />
            Learn More
          </a>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onBookDemo}
            className="flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg transition-all"
            style={{ background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.20)', color: '#DC2626' }}
            onMouseEnter={e => { const t = e.currentTarget; t.style.background = '#DC2626'; t.style.color = 'white'; t.style.borderColor = '#DC2626' }}
            onMouseLeave={e => { const t = e.currentTarget; t.style.background = '#FEF2F2'; t.style.color = '#DC2626'; t.style.borderColor = 'rgba(220,38,38,0.20)' }}
          >
            <MessageCircle size={11} />
            Discuss
          </button>
          <button
            onClick={onContactUs}
            className="flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg transition-all"
            style={{ background: '#F0FDF4', border: '1px solid rgba(34,197,94,0.20)', color: '#16A34A' }}
            onMouseEnter={e => { const t = e.currentTarget; t.style.background = '#16A34A'; t.style.color = 'white' }}
            onMouseLeave={e => { const t = e.currentTarget; t.style.background = '#F0FDF4'; t.style.color = '#16A34A' }}
          >
            <Phone size={11} />
            Contact Us
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
