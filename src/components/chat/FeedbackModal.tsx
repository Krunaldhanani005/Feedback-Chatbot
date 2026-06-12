'use client'
import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FeedbackModalProps {
  conversationId?: string
  onClose: () => void
  onSubmit: (data: { rating: number; interestedIn: string[]; comments: string }) => Promise<void>
}

const ratingLabels = ['', 'Poor', 'Needs Improvement', 'Average', 'Good', 'Excellent']
const solutions = ['AI Solutions', 'AV Solutions', 'Robotics', 'Automation', 'Security', 'Other']

export function FeedbackModal({ onClose, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [interested, setInterested] = useState<string[]>([])
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleInterest = (s: string) => {
    setInterested(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSubmit = async () => {
    if (!rating) return
    setSubmitting(true)
    try {
      await onSubmit({ rating, interestedIn: interested, comments })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md animate-slide-up">
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🙏</div>
            <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-text-secondary mb-6">Your feedback means a lot to us.</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Rate Your Experience</h3>
              <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={
                      i <= (hovered || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-dark-border'
                    }
                  />
                </button>
              ))}
            </div>
            {(rating > 0 || hovered > 0) && (
              <p className="text-center text-sm text-text-secondary mb-6">
                {ratingLabels[hovered || rating]}
              </p>
            )}

            {/* Interested In */}
            <div className="mb-4">
              <p className="text-sm font-medium text-text-secondary mb-3">Which solutions interested you?</p>
              <div className="flex flex-wrap gap-2">
                {solutions.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleInterest(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      interested.includes(s)
                        ? 'bg-brand-red border-brand-red text-white'
                        : 'bg-dark-elevated border-dark-border text-text-secondary hover:border-brand-red/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="mb-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Additional Comments</p>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={3}
                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red text-sm resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Skip
              </Button>
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={!rating}
                className="flex-1"
              >
                Submit Feedback
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
