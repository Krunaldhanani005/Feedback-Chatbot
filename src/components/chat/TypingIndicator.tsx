export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)', boxShadow: '0 2px 8px rgba(220,38,38,0.20)' }}>
        AI
      </div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3"
        style={{
          background: '#F3F2EE',
          border: '1px solid #EEEDEA',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
        <div className="flex items-center gap-1">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}
