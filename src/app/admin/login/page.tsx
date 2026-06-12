'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, Zap } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (data.success) {
        router.push('/admin')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap size={28} className="text-brand-red" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Portal</h1>
          <p className="text-text-secondary text-sm mt-1">Nanta AI — Nanta Tech Limited</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@nantatech.com"
              required
              className="w-full pl-11 pr-4 py-3 bg-dark-elevated border border-dark-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/50 text-sm transition-all"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-11 pr-12 py-3 bg-dark-elevated border border-dark-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/50 text-sm transition-all"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-red hover:bg-brand-red-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ boxShadow: '0 4px 16px rgba(220,38,38,0.22)' }}
          >
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
