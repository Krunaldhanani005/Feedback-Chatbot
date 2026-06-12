'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, CheckCircle, X, Mail, Phone, MapPin, Clock, Sparkles, ChevronUp, ChevronDown } from 'lucide-react'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { BookDemoForm } from './BookDemoForm'
import type { ChatMessage, MessageMetadata } from '@/types/chat'

const QUICK_ACCESS = [
  { label: '🤖 ALLBOTIX',          prompt: 'Tell me about ALLBOTIX robots' },
  { label: '🧠 AI Solutions',       prompt: 'Show AI Solutions' },
  { label: '📺 AV Products',        prompt: 'Show AV Products' },
  { label: '📡 AV Solutions',       prompt: 'Tell me about AV technology products' },
  { label: '🤝 Discuss Requirements', prompt: '__DISCUSS__' },
  { label: '📞 Contact Us',         prompt: '__CONTACT_US__' },
]

interface Props {
  sessionToken: string
  initialConversationId?: string
  onReset: () => void
}

export function ChatStep({ sessionToken, initialConversationId, onReset }: Props) {
  const [messages, setMessages]         = useState<ChatMessage[]>([])
  const [input, setInput]               = useState('')
  const [isTyping, setIsTyping]         = useState(false)
  const [isWelcoming, setIsWelcoming]   = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId)
  const [showDemoForm, setShowDemoForm]   = useState(false)
  const [showContact, setShowContact]     = useState(false)
  const [showThankYou, setShowThankYou]   = useState(false)
  const [quickOpen, setQuickOpen]         = useState(false)
  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLTextAreaElement>(null)
  const welcomeFetched  = useRef(false)

  useEffect(() => {
    if (!initialConversationId || !sessionToken || welcomeFetched.current) return
    welcomeFetched.current = true
    setIsWelcoming(true)
    fetch('/api/chat/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, conversationId: initialConversationId }),
    })
      .then(r => r.json())
      .then((data: { message: string; quickReplies?: string[] }) => {
        setConversationId(initialConversationId)
        setMessages([{
          id: `welcome_${Date.now()}`,
          role: 'assistant',
          content: data.message,
          quickReplies: data.quickReplies,
          createdAt: new Date(),
        }])
      })
      .catch(() => {
        setMessages([{
          id: `welcome_${Date.now()}`,
          role: 'assistant',
          content: "Hey there! 👋 How was your experience at the Nanta Tech Experience Days today?",
          quickReplies: ['😊 Excellent', '🙂 Good', '😐 Average', '😕 Needs Improvement', '😞 Poor'],
          createdAt: new Date(),
        }])
      })
      .finally(() => setIsWelcoming(false))
  }, [initialConversationId, sessionToken])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping || isWelcoming) return

    if (content === '__BOOK_DEMO__' || content === '__DISCUSS__') { setShowDemoForm(true); return }
    if (content === '__CONTACT_US__') { setShowContact(true); return }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`, role: 'user', content: content.trim(), createdAt: new Date(),
    }

    setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, quickReplies: undefined } : m))
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content.trim(), conversationId, sessionToken }),
      })
      const data = await res.json() as {
        message: string; conversationId: string; metadata?: MessageMetadata; quickReplies?: string[]
      }
      if (!conversationId) setConversationId(data.conversationId)
      setMessages(prev => [...prev, {
        id: `ai_${Date.now()}`, role: 'assistant',
        content: data.message, metadata: data.metadata, quickReplies: data.quickReplies,
        createdAt: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`, role: 'assistant',
        content: "I'm having a brief issue. Could you try again?",
        quickReplies: ['Try again', 'Contact Us'], createdAt: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }, [conversationId, sessionToken, isTyping, isWelcoming])

  const handleDemoSubmit = async (details: Record<string, string>) => {
    if (Object.keys(details).length > 0) {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'details', sessionToken, details }),
      }).catch(() => {})
    }
    setShowDemoForm(false)
    await sendMessage('I submitted a demo request')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const lastAssistantIdx = messages.reduceRight(
    (found, m, i) => found === -1 && m.role === 'assistant' ? i : found, -1
  )

  const inputActive = input.trim() && !isTyping && !isWelcoming

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b shrink-0 border-dark-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(220,38,38,0.28)',
                boxShadow: '0 2px 8px rgba(220,38,38,0.14)',
              }}>
              <img src="/nanta-logo.png" alt="Nanta" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-text-primary">Nanta AI</p>
              <Sparkles size={11} className="text-brand-red" />
            </div>
            <p className="text-xs text-green-600 font-medium">Online · Feedback & Discovery</p>
          </div>
        </div>
        <button
          onClick={() => setShowThankYou(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold transition-all"
          style={{ background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.22)', color: '#DC2626' }}
        >
          <CheckCircle size={11} /> Finish
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0 scrollbar-hide">
        {messages.length === 0 && isWelcoming ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <img src="/nanta-logo.png" alt="Nanta" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              <span>Preparing your experience…</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onQuickAction={sendMessage}
                onBookDemo={() => setShowDemoForm(true)}
                onContactUs={() => setShowContact(true)}
                showReplies={idx === lastAssistantIdx && !isTyping}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick access bar ── */}
      <div className="shrink-0 pb-2">

        {/* Mobile: collapsible — toggle arrow + 2-col grid */}
        <div className="sm:hidden">
          <button
            onClick={() => setQuickOpen(o => !o)}
            className="w-full flex items-center justify-center gap-1.5 py-2 mb-1 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ background: '#F8F7F4', border: '1px solid #E5E4DF', color: '#6B6B67' }}
          >
            {quickOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            {quickOpen ? 'Hide Quick Actions' : 'Quick Actions'}
          </button>
          {quickOpen && (
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACCESS.map((action, i) => {
                const isDiscuss = action.prompt === '__DISCUSS__'
                const isContact = action.prompt === '__CONTACT_US__'
                return (
                  <button
                    key={i}
                    onClick={() => { sendMessage(action.prompt); setQuickOpen(false) }}
                    className="text-xs px-3 py-3 rounded-xl transition-all active:scale-95 font-semibold text-center min-h-[44px]"
                    style={{
                      background: isDiscuss ? '#FEF2F2' : isContact ? '#F0FDF4' : '#F8F7F4',
                      border: isDiscuss ? '1px solid rgba(220,38,38,0.22)' : isContact ? '1px solid rgba(34,197,94,0.22)' : '1px solid #E5E4DF',
                      color: isDiscuss ? '#DC2626' : isContact ? '#16A34A' : '#6B6B67',
                    }}
                  >
                    {action.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Tablet/Desktop: wrapping rows always visible */}
        <div className="hidden sm:flex flex-wrap gap-1.5">
          {QUICK_ACCESS.map((action, i) => {
            const isDiscuss = action.prompt === '__DISCUSS__'
            const isContact = action.prompt === '__CONTACT_US__'
            return (
              <button
                key={i}
                onClick={() => sendMessage(action.prompt)}
                className="text-xs whitespace-nowrap px-4 py-2.5 rounded-xl transition-all active:scale-95 font-semibold"
                style={{
                  background: isDiscuss ? '#FEF2F2' : isContact ? '#F0FDF4' : '#F8F7F4',
                  border: isDiscuss ? '1px solid rgba(220,38,38,0.22)' : isContact ? '1px solid rgba(34,197,94,0.22)' : '1px solid #E5E4DF',
                  color: isDiscuss ? '#DC2626' : isContact ? '#16A34A' : '#6B6B67',
                }}
              >
                {action.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Input area ── */}
      <div className="shrink-0">
        <div className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E4DF',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or tap a button above…"
            rows={1}
            className="flex-1 bg-transparent text-text-primary text-sm focus:outline-none resize-none max-h-24 leading-relaxed"
            style={{ color: '#0F0F0E' }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 96) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!inputActive}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: inputActive
                ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
                : '#F0EFEB',
              color: inputActive ? 'white' : '#C4C4C0',
              boxShadow: inputActive ? '0 4px 14px rgba(220,38,38,0.26)' : 'none',
              cursor: !inputActive ? 'not-allowed' : 'pointer',
            }}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-xs text-center mt-2 text-text-muted">
          Powered by <span className="text-text-secondary font-medium">Nanta Tech Limited</span>
        </p>
      </div>

      {/* ── Book Demo Modal ── */}
      {showDemoForm && (
        <BookDemoForm
          sessionToken={sessionToken}
          conversationId={conversationId}
          onClose={() => setShowDemoForm(false)}
          onSubmit={handleDemoSubmit}
        />
      )}

      {/* ── Contact Overlay ── */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md rounded-3xl p-6 animate-slide-up relative"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E4DF',
              boxShadow: '0 32px 80px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)',
            }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Contact Us</h2>
                <p className="text-xs text-text-muted mt-0.5">Nanta Tech Limited · Ahmedabad</p>
              </div>
              <button onClick={() => setShowContact(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
                style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Email */}
              <a href="mailto:contact@nantatech.com"
                className="flex items-center gap-3 p-3.5 rounded-2xl transition-all group"
                style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.18)' }}>
                  <Mail size={16} className="text-brand-red" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm text-text-primary font-medium group-hover:text-brand-red transition-colors">
                    contact@nantatech.com
                  </p>
                </div>
              </a>

              {/* WhatsApp numbers */}
              <div className="grid grid-cols-2 gap-2.5">
                {['+91 99090 41675', '+91 99090 41678'].map(num => (
                  <a key={num} href={`https://wa.me/${num.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl transition-all group"
                    style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: '#F0FDF4', border: '1px solid rgba(34,197,94,0.20)' }}>
                      <Phone size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">WhatsApp</p>
                      <p className="text-xs text-text-primary font-medium group-hover:text-green-600 transition-colors">{num}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl"
                style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#EEEDEA', border: '1px solid #E5E4DF' }}>
                  <MapPin size={16} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Office</p>
                  <p className="text-sm text-text-primary font-medium">Shivalik Sharda Harmony</p>
                  <p className="text-xs text-text-secondary">Ambawadi, Ahmedabad, Gujarat 380015</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background: '#F8F7F4', border: '1px solid #E5E4DF' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#EEEDEA', border: '1px solid #E5E4DF' }}>
                  <Clock size={16} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Working Hours</p>
                  <p className="text-sm text-text-primary font-medium">Mon – Fri, 10 AM – 7 PM IST</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setShowContact(false); setShowDemoForm(true) }}
              className="w-full mt-5 py-4 text-white font-semibold rounded-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                boxShadow: '0 6px 20px rgba(220,38,38,0.24)',
              }}
            >
              Discuss Your Requirements
            </button>
          </div>
        </div>
      )}

      {/* ── Thank You overlay ── */}
      {showThankYou && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(15,15,14,0.72)', backdropFilter: 'blur(16px)' }}>

          {/* Falling stars */}
          <style>{`
            @keyframes starFall {
              0%   { opacity: 0; transform: translateY(-40px) scale(0) rotate(0deg); }
              15%  { opacity: 1; transform: translateY(0px) scale(1.2) rotate(20deg); }
              60%  { opacity: 1; transform: translateY(30px) scale(1) rotate(-10deg); }
              100% { opacity: 0; transform: translateY(90px) scale(0.4) rotate(30deg); }
            }
            @keyframes centerBurst {
              0%   { opacity: 0; transform: scale(0.4); }
              40%  { opacity: 1; transform: scale(1.08); }
              65%  { transform: scale(0.96); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}</style>

          {[
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
          ].map((s, i) => (
            <div key={i} className="fixed pointer-events-none"
              style={{
                left: s.left, top: s.top,
                animation: `starFall 1.6s ${s.delay} ease-out forwards`,
                fontSize: s.size,
                color: s.color,
                zIndex: 51,
                lineHeight: 1,
              }}>
              ★
            </div>
          ))}

          {/* Card */}
          <div className="relative mx-4 w-full max-w-sm rounded-[28px] p-8 text-center"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10)',
              animation: 'centerBurst 0.55s ease-out forwards',
            }}>

            {/* Star icon */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 100%)', border: '2px solid rgba(220,38,38,0.18)' }}>
                <span style={{ fontSize: 40 }}>🌟</span>
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
                Continue Chat
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
