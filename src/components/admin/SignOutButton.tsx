'use client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-red-400 hover:bg-red-900/10 transition-colors"
    >
      <LogOut size={16} />
      Sign Out
    </button>
  )
}
