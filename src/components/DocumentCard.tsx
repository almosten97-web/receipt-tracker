import type { UploadResult } from '@/lib/api'

const CATEGORY_EMOJI: Record<string, string> = {
  meals: '🍽',
  travel: '✈️',
  supplies: '📦',
  utilities: '💡',
  software: '💻',
  hardware: '🖥',
  accommodation: '🏨',
  services: '🔧',
  other: '📄',
}

function fmt(amount: number | undefined, currency = 'USD') {
  if (amount === undefined || amount === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function fmtDate(d: string | undefined) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DocumentCard({ result }: { result: UploadResult }) {
  const isInvoice = result.type === 'invoice'
  const name = result.merchant ?? result.vendor ?? 'Unknown'
  const date = result.date ?? '—'
  const emoji = CATEGORY_EMOJI[result.category ?? 'other'] ?? '📄'

  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 flex items-start gap-3">
      {/* Icon */}
      <div className="text-xl flex-shrink-0 mt-0.5">{emoji}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-stone-900 truncate">{name}</p>
            <p className="text-xs text-stone-400 mt-0.5">{fmtDate(date)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-stone-900">
              {fmt(result.amount, result.currency)}
            </p>
            <span className="text-xs text-stone-400 capitalize">{result.category}</span>
          </div>
        </div>

        {isInvoice && result.due_date && (
          <p className="text-xs text-stone-400 mt-1">
            Due {fmtDate(result.due_date)}
            {result.invoice_number && ` · #${result.invoice_number}`}
          </p>
        )}

        <span
          className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
            isInvoice
              ? 'bg-violet-50 text-violet-600'
              : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {isInvoice ? 'Invoice' : 'Receipt'}
        </span>
      </div>
    </div>
  )
}
