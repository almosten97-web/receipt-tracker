'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NavBar({ email, tier }: { email: string; tier: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname.startsWith(href)
          ? 'text-stone-900'
          : 'text-stone-400 hover:text-stone-700'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-stone-100">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-1.5">
          <span className="text-lg">🧾</span>
          <span className="text-sm font-semibold text-stone-900 tracking-tight">ReceiptAI</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          {navLink('/dashboard', 'Upload')}
          {navLink('/export', 'Export')}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          {tier === 'paid' && (
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Paid
            </span>
          )}
          <span className="text-xs text-stone-400 hidden sm:block">{email}</span>
          <button
            onClick={signOut}
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
