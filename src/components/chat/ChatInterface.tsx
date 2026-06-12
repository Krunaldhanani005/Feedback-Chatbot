'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Plus, Trash2, MessageSquare, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { WelcomeScreen } from './WelcomeScreen'
import { FeedbackModal } from './FeedbackModal'
import type { ChatMessage, UserInfo, MessageMetadata } from '@/types/chat'

const SUGGESTED = [
  'Tell me about ALLBOTIX robots',
  'What is NTRA AI Vision?',
  'AV solutions for meeting rooms',
  'How to book a demo?',
  'Contact information',
  'Products for hospitality',
]

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string>()
  const [sessionToken, setSessionToken] = useState<string>()
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(SUGGESTED)
  const [showFeedback, setShowFeedback] = useState(false)
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>({})
  const [messageCount, setMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize session
  useEffect(() => {
    const stored = localStorage.getItem('session_token')
    if (stored) {
      setSessionToken(stored)
    } else {
      fetch('/api/session', { method: 'POST' })
        .then(r => r.json())
        .then(({ sessionToken: token }) => {
          setSessionToken(token)
          localStorage.setItem('session_token', token)
        })
        .catch(console.error)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping || !sessionToken) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setMessageCount(prev => prev + 1)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          conversationId,
          sessionToken,
          userInfo: Object.keys(userInfo).length > 0 ? userInfo : undefined,
        }),
      })

      const data = await res.json() as {
        message: string
        conversationId: string
        metadata?: MessageMetadata
        suggestedQuestions?: string[]
      }

      if (!conversationId) setConversationId(data.conversationId)

      const assistantMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.message,
        metadata: data.metadata,
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      if (data.suggestedQuestions) setSuggestedQuestions(data.suggestedQuestions)

      // Show feedback after 5 exchanges
      const newCount = messageCount + 1
      if (newCount === 10 && !showFeedback) {
        setTimeout(() => setShowFeedback(true), 2000)
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an issue. Please try again or contact us at contact@nantatech.com',
        createdAt: new Date(),
      }])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }, [conversationId, sessionToken, userInfo, isTyping, messageCount, showFeedback])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleNewConversation = () => {
    setMessages([])
    setConversationId(undefined)
    setSuggestedQuestions(SUGGESTED)
    setMessageCount(0)
    inputRef.current?.focus()
  }

  const handleFeedbackSubmit = async (data: { rating: number; interestedIn: string[]; comments: string }) => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, conversationId }),
    })
    setShowFeedback(false)
  }

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-dark-surface border-b border-dark-border glass">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-brand-red flex items-center justify-center">
              <MessageSquare size={18} className="text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-surface" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Nanta AI Assistant</h1>
            <p className="text-xs text-green-400">Online — Nanta Tech Limited</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFeedback(true)}
            className="hidden sm:flex"
          >
            <Star size={14} />
            Rate
          </Button>
          <Button variant="secondary" size="sm" onClick={handleNewConversation}>
            <Plus size={14} />
            New Chat
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <WelcomeScreen onTopicSelect={sendMessage} />
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onQuickAction={sendMessage}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length > 0 && !isTyping && suggestedQuestions.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {suggestedQuestions.slice(0, 4).map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-1.5 bg-dark-card border border-dark-border hover:border-brand-red/50 hover:text-brand-red rounded-full transition-colors shrink-0"
              >
                <ChevronRight size={10} />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 bg-dark-surface border-t border-dark-border">
        <div className="flex items-end gap-2 bg-dark-elevated border border-dark-border rounded-2xl px-4 py-3 focus-within:border-brand-red/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about our products, solutions, or anything..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-text-muted text-sm focus:outline-none resize-none max-h-32 leading-relaxed"
            style={{ height: 'auto' }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 128) + 'px'
            }}
          />
          <Button
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="shrink-0 rounded-xl"
          >
            <Send size={14} />
          </Button>
        </div>
        <p className="text-xs text-text-muted text-center mt-2">
          Powered by Nanta Tech Limited • Press Enter to send
        </p>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          conversationId={conversationId}
          onClose={() => setShowFeedback(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  )
}
