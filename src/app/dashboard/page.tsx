'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadDocument, type UploadResult } from '@/lib/api'
import NavBar from '@/components/NavBar'
import UploadZone from '@/components/UploadZone'
import DocumentCard from '@/components/DocumentCard'

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<string>('free')
  const [token, setToken] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<UploadResult[]>([])

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

  const handleUpload = useCallback(
    async (file: File, type: 'receipt' | 'invoice') => {
      setError(null)
      setLoading(true)
      try {
        const result = await uploadDocument(file, type, token)
        if (!result.success) {
          setError(result.message ?? result.error ?? 'Upload failed')
        } else {
          setResults((prev) => [result, ...prev])
        }
      } catch {
        setError('Network error — is n8n running?')
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <NavBar email={email} tier={tier} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Upload section */}
        <section>
          <h1 className="text-base font-semibold text-stone-900 mb-4">Upload Document</h1>
          <UploadZone isPaid={tier === 'paid'} onUpload={handleUpload} loading={loading} />
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
        </section>

        {/* Results section */}
        {results.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-stone-900 mb-4">
              Processed This Session
            </h2>
            <div className="space-y-3">
              {results.map((r, i) => (
                <DocumentCard key={i} result={r} />
              ))}
            </div>
          </section>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-sm text-stone-400">
              Uploaded documents will appear here after processing.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
