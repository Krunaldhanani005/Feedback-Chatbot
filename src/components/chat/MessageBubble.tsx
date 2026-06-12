'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import type { ChatMessage } from '@/types/chat'
import { ProductCard } from './ProductCard'
import { SolutionCard } from './SolutionCard'
import { cn } from '@/lib/utils/cn'
import { Bot } from 'lucide-react'

interface MessageBubbleProps {
  message: ChatMessage
  onQuickAction?: (value: string) => void
  onBookDemo?: () => void
  onContactUs?: () => void
  showReplies?: boolean
}

export function MessageBubble({ message, onQuickAction, onBookDemo, onContactUs, showReplies = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const { metadata } = message
  const quickReplies = message.quickReplies || metadata?.quickReplies

  return (
    <div className={cn('flex items-start gap-2.5 chat-message', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold',
        isUser ? 'text-text-secondary' : 'text-white'
      )}
        style={isUser
          ? { background: '#F0EFEB', border: '1px solid #E5E4DF', color: '#6B6B67' }
          : { background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)', boxShadow: '0 2px 8px rgba(220,38,38,0.20)' }
        }>
        {isUser ? 'You' : <Bot size={14} />}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col gap-2 min-w-0', isUser ? 'items-end max-w-[82%]' : 'flex-1')}>

        {/* Bubble */}
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={isUser ? {
            background: 'linear-gradient(135deg, #DC2626 0%, #C82020 100%)',
            color: 'white',
            borderRadius: '16px 16px 4px 16px',
            boxShadow: '0 2px 10px rgba(220,38,38,0.18)',
          } : {
            background: '#F3F2EE',
            border: '1px solid #EEEDEA',
            color: '#0F0F0E',
            borderRadius: '4px 16px 16px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Quick reply chips — only on last assistant message */}
        {!isUser && showReplies && quickReplies && quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-0.5">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => onQuickAction?.(reply)}
                className="text-sm px-3.5 py-2 rounded-xl transition-all active:scale-95 font-medium"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E4DF',
                  color: '#6B6B67',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  const t = e.currentTarget
                  t.style.borderColor = 'rgba(220,38,38,0.30)'
                  t.style.color = '#0F0F0E'
                  t.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                }}
                onMouseLeave={e => {
                  const t = e.currentTarget
                  t.style.borderColor = '#E5E4DF'
                  t.style.color = '#6B6B67'
                  t.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Product cards */}
        {metadata?.products && metadata.products.length > 0 && (
          <div className="flex flex-col gap-2.5 w-full">
            {metadata.products.map((product, i) => (
              <ProductCard
                key={i}
                product={product}
                onBookDemo={onBookDemo}
                onContactUs={onContactUs}
              />
            ))}
          </div>
        )}

        {/* Solution cards */}
        {metadata?.solutions && metadata.solutions.length > 0 && (
          <div className="flex flex-col gap-2.5 w-full">
            {metadata.solutions.map((solution, i) => (
              <SolutionCard
                key={i}
                solution={solution}
                onBookDemo={onBookDemo}
                onContactUs={onContactUs}
              />
            ))}
          </div>
        )}

        {/* Contact info panel */}
        {metadata?.showContactInfo && (
          <div className="w-full rounded-2xl p-4 text-sm space-y-2"
            style={{
              background: '#FEF2F2',
              border: '1px solid rgba(220,38,38,0.16)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
            <p className="font-semibold text-brand-red">📞 Contact Nanta Tech</p>
            <p className="text-text-primary">📧 <a href="mailto:contact@nantatech.com" className="text-brand-red hover:underline">contact@nantatech.com</a></p>
            <p className="text-text-primary">📱 <a href="https://wa.me/919909041675" className="text-green-600 hover:underline">+91 99090 41675</a></p>
            <p className="text-text-primary">📱 <a href="https://wa.me/919909041678" className="text-green-600 hover:underline">+91 99090 41678</a></p>
            <p className="text-text-muted text-xs">🕐 Mon–Fri, 10 AM – 7 PM IST</p>
            <p className="text-text-muted text-xs">📍 Shivalik Sharda Harmony, Ambawadi, Ahmedabad 380015</p>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-text-muted">
          {format(message.createdAt, 'HH:mm')}
        </span>
      </div>
    </div>
  )
}
