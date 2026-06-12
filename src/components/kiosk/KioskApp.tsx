'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, Sparkles } from 'lucide-react'
import { WelcomeStep } from './WelcomeStep'
import { DepartmentRatingStep } from './DepartmentRatingStep'
import { InterestStep } from './InterestStep'
import { VisitorDetailsStep } from './VisitorDetailsStep'
import { ChatStep } from './ChatStep'

type Step = 'welcome' | 'ratings' | 'interests' | 'details' | 'chat' | 'thankyou'

interface SessionState {
  token: string
  conversationId?: string
}

const STEP_ORDER: Step[] = ['welcome', 'ratings', 'interests', 'details', 'chat']

export function KioskApp() {
  const [step, setStep] = useState<Step>('welcome')
  const [session, setSession] = useState<SessionState | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('kiosk_session')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SessionState
        setSession(parsed)
      } catch { /* ignore */ }
    }
  }, [])

  const getOrCreateSession = async (): Promise<SessionState> => {
    if (session) return session
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'init' }),
    })
    const data = await res.json() as { sessionToken: string }
    const newSession: SessionState = { token: data.sessionToken }
    setSession(newSession)
    sessionStorage.setItem('kiosk_session', JSON.stringify(newSession))
    return newSession
  }

  const handleWelcomeNext = async () => {
    await getOrCreateSession()
    setStep('ratings')
  }

  const handleRatingsNext = async (ratingData: { ai: number; av: number; robotics: number; automation: number; experience: number }) => {
    const s = await getOrCreateSession()
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'ratings', sessionToken: s.token, ratings: ratingData }),
    })
    setStep('interests')
  }

  const handleInterestsNext = async (interests: string[]) => {
    const s = await getOrCreateSession()
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'interests', sessionToken: s.token, interests }),
    })
    setStep('details')
  }

  const saveDetails = async (details: Record<string, string>) => {
    const s = await getOrCreateSession()
    if (Object.keys(details).length > 0) {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'details', sessionToken: s.token, details }),
      }).catch(() => {})
    }
    return s
  }

  const handleChatWithAgent = async (details: Record<string, string>) => {
    const s = await saveDetails(details)
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'complete', sessionToken: s.token }),
    })
    const data = await res.json() as { sessionToken: string; conversationId?: string }
    const updated: SessionState = { token: s.token, conversationId: data.conversationId }
    setSession(updated)
    sessionStorage.setItem('kiosk_session', JSON.stringify(updated))
    setStep('chat')
  }

  const handleFinish = async (details: Record<string, string>) => {
    const s = await saveDetails(details)
    // Create lead record even for Finish (no-chat) path
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'complete', sessionToken: s.token }),
    }).catch(() => {})
    // VisitorDetailsStep shows its own Thank You overlay; no step change needed
  }

  const handleReset = () => {
    sessionStorage.removeItem('kiosk_session')
    setSession(null)
    setStep('welcome')
  }

  const isChat    = step === 'chat'
  const isWelcome = step === 'welcome'
  const isThankyou = step === 'thankyou'

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden">

      {/* Subtle background texture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full blur-[120px]"
          style={{ background: 'rgba(220,38,38,0.04)' }} />
      </div>

      <div className={`relative w-full z-10 flex flex-col ${
        isChat
          ? 'max-w-2xl lg:max-w-3xl h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)]'
          : 'max-w-sm sm:max-w-md lg:max-w-lg'
      }`}>

        {/* Step progress dots */}
        {!isWelcome && !isChat && !isThankyou && (
          <div className="flex items-center justify-center gap-2.5 mb-5">
            {(['ratings', 'interests', 'details'] as const).map((s, i) => {
              const done = STEP_ORDER.indexOf(step) - 1 >= i
              return (
                <div key={s} className={`h-1 rounded-full transition-all duration-500 ${done ? 'bg-brand-red w-10' : 'bg-dark-border w-5'}`} />
              )
            })}
          </div>
        )}

        {/* Main card */}
        <div className={`
          relative overflow-hidden border border-dark-border animate-scale-in bg-dark-surface
          ${isChat
            ? 'flex-1 flex flex-col rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5'
            : isWelcome
            ? 'rounded-[24px] sm:rounded-[28px]'
            : 'rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8'
          }
        `}
          style={{
            boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 24px 64px rgba(0,0,0,0.06), 0 0 0 1px rgba(229,228,223,0.6)',
            minHeight: isWelcome ? 530 : undefined,
          }}
        >
          {/* Subtle top border highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dark-border-light to-transparent" />

          {step === 'welcome'   && <WelcomeStep onNext={handleWelcomeNext} />}
          {step === 'ratings'   && <DepartmentRatingStep onNext={handleRatingsNext} onBack={() => setStep('welcome')} />}
          {step === 'interests' && <InterestStep onNext={handleInterestsNext} onBack={() => setStep('ratings')} />}
          {step === 'details'   && (
            <VisitorDetailsStep
              onChatWithAgent={handleChatWithAgent}
              onFinish={handleFinish}
              onReset={handleReset}
              onBack={() => setStep('interests')}
            />
          )}
          {step === 'chat' && session && (
            <ChatStep sessionToken={session.token} initialConversationId={session.conversationId} onReset={handleReset} />
          )}
          {step === 'thankyou' && (
            <div className="flex flex-col items-center justify-center h-full py-10 px-6 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                style={{ background: '#F0FDF4', border: '2px solid rgba(34,197,94,0.28)' }}>
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-brand-red" />
                <p className="text-xs font-semibold text-brand-red tracking-[0.22em] uppercase">Thank You</p>
                <Sparkles size={16} className="text-brand-red" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                See you again!
              </h2>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-xs mb-8">
                Thank you for visiting the Nanta Tech Experience Days. Your feedback helps us grow. We hope to see you at our next event!
              </p>
              <button
                onClick={handleReset}
                className="px-8 py-4 text-white font-semibold rounded-2xl transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                  boxShadow: '0 6px 20px rgba(220,38,38,0.24)',
                }}
              >
                Start New Session
              </button>
            </div>
          )}
        </div>

        {!isChat && !isThankyou && (
          <p className="text-center text-xs text-text-muted mt-4">
            Powered by <span className="text-text-secondary font-medium">Nanta Tech Limited</span>
          </p>
        )}
      </div>
    </div>
  )
}
