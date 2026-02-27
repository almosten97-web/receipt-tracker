'use client'

import { useCallback, useRef, useState } from 'react'

type DocType = 'receipt' | 'invoice'

interface UploadZoneProps {
  isPaid: boolean
  onUpload: (file: File, type: DocType) => void
  loading: boolean
}

export default function UploadZone({ isPaid, onUpload, loading }: UploadZoneProps) {
  const [docType, setDocType] = useState<DocType>('receipt')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file) return
      onUpload(file, docType)
    },
    [docType, onUpload]
  )

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so the same file can be re-uploaded
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all px-8 py-12 text-center select-none ${
          dragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
        } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={onInputChange}
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-8 w-8 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-stone-500">Processing with AI…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700">
                Drag & drop or <span className="text-indigo-600">browse</span>
              </p>
              <p className="text-xs text-stone-400 mt-0.5">JPEG, PNG, WebP or PDF</p>
            </div>
          </div>
        )}
      </div>

      {/* Type toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-400 font-medium">Type:</span>
        <div className="flex rounded-lg border border-stone-200 bg-white overflow-hidden">
          <button
            onClick={() => setDocType('receipt')}
            className={`px-4 py-1.5 text-xs font-medium transition-colors ${
              docType === 'receipt'
                ? 'bg-indigo-600 text-white'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Receipt
          </button>
          <div className="relative group">
            <button
              onClick={() => isPaid && setDocType('invoice')}
              disabled={!isPaid}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                docType === 'invoice'
                  ? 'bg-indigo-600 text-white'
                  : isPaid
                  ? 'text-stone-500 hover:text-stone-700'
                  : 'text-stone-300 cursor-not-allowed'
              }`}
            >
              Invoice {!isPaid && '🔒'}
            </button>
            {!isPaid && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10">
                <div className="bg-stone-800 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                  Requires a paid plan
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
