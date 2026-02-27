'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchTaxSummary, type TaxSummary } from '@/lib/api'
import NavBar from '@/components/NavBar'
import TaxSummaryComponent from '@/components/TaxSummary'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

export default function ExportPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<string>('free')
  const [token, setToken] = useState<string>('')
  const [year, setYear] = useState(CURRENT_YEAR)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<TaxSummary | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth')
        return
      }
      setEmail(session.user.email ?? '')
      setToken(session.access_token)
      const t =
        session.user.user_metadata?.tier ??
        session.user.app_metadata?.tier ??
        'free'
      setTier(t)
    })
  }, [router])

  async function generate() {
    setError(null)
    setSummary(null)
    setLoading(true)
    try {
      const data = await fetchTaxSummary(year, token)
      if ('error' in data && data.error) {
        setError(String(data.error))
      } else {
        setSummary(data)
      }
    } catch {
      setError('Network error — is n8n running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <NavBar email={email} tier={tier} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-base font-semibold text-stone-900">Tax Summary</h1>

          <div className="flex items-center gap-3">
            <select
              value={year}
              onChange={(e) => { setYear(Number(e.target.value)); setSummary(null) }}
              className="px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={generate}
              disabled={loading || !token}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Loading…' : 'Generate'}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <svg
              className="animate-spin h-7 w-7 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-stone-400">Fetching your data…</p>
          </div>
        )}

        {summary && <TaxSummaryComponent data={summary} />}

        {!summary && !loading && !error && (
          <div className="text-center py-16">
            <p className="text-sm text-stone-400">
              Select a year and click Generate to build your tax summary.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
