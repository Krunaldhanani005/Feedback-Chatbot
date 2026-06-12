import Link from 'next/link'
import { LayoutDashboard, MessageSquare, Star, Users, BookOpen, Bot, ExternalLink } from 'lucide-react'
import { SignOutButton } from '@/components/admin/SignOutButton'

const navItems = [
  { href: '/admin',               label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/admin/conversations', label: 'Visitor Sessions', icon: MessageSquare   },
  { href: '/admin/feedback',      label: 'Feedback',         icon: Star            },
  { href: '/admin/leads',         label: 'Leads',            icon: Users           },
  { href: '/admin/knowledge',     label: 'Knowledge Base',   icon: BookOpen        },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex flex-col shrink-0 bg-dark-surface border-r border-dark-border">

        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-border">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-brand-sm overflow-hidden"
            style={{ background: '#FFFFFF', border: '1px solid #E5E4DF' }}>
            <img src="/nanta-logo.png" alt="Nanta Tech" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Nanta AI</p>
            <p className="text-xs text-text-muted">Admin Panel</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-dark-elevated transition-all group"
            >
              <Icon size={16} className="shrink-0 group-hover:text-brand-red transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-dark-border space-y-0.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-dark-elevated transition-all"
          >
            <Bot size={16} className="shrink-0" />
            View Kiosk
            <ExternalLink size={11} className="ml-auto opacity-50" />
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto bg-dark-bg">
        {children}
      </main>
    </div>
  )
}
