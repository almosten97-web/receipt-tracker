'use client'

import type { TaxSummary as TaxSummaryType, CategoryStat } from '@/lib/api'
import { exportToCsv } from '@/lib/api'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

function CategoryTable({
  title,
  count,
  total,
  byCategory,
  color,
}: {
  title: string
  count: number
  total: number
  byCategory: Record<string, CategoryStat>
  color: 'emerald' | 'violet'
}) {
  const colorMap = {
    emerald: { badge: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-400' },
    violet: { badge: 'bg-violet-50 text-violet-600', bar: 'bg-violet-400' },
  }
  const c = colorMap[color]
  const entries = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total)

  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-50 flex items-center justify-between">
        <div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
            {title}
          </span>
          <span className="text-xs text-stone-400 ml-2">{count} item{count !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-sm font-semibold text-stone-900">{fmt(total)}</span>
      </div>

      {entries.length === 0 ? (
        <p className="px-5 py-6 text-sm text-stone-400 text-center">No items</p>
      ) : (
        <div className="divide-y divide-stone-50">
          {entries.map(([cat, stat]) => {
            const pct = total > 0 ? Math.round((stat.total / total) * 100) : 0
            return (
              <div key={cat} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-stone-700 capitalize">{cat}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-stone-900">{fmt(stat.total)}</span>
                    <span className="text-xs text-stone-400 ml-2">{stat.count} item{stat.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TaxSummary({ data }: { data: TaxSummaryType }) {
  const { summary } = data

  return (
    <div className="space-y-4">
      {/* Grand total banner */}
      <div className="bg-stone-900 text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">Grand Total {data.year}</p>
          <p className="text-3xl font-bold mt-0.5">{fmt(summary.grand_total)}</p>
        </div>
        <button
          onClick={() => exportToCsv(data)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSV
        </button>
      </div>

      {/* Receipts */}
      <CategoryTable
        title="Receipts"
        count={summary.receipts.count}
        total={summary.receipts.total}
        byCategory={summary.receipts.by_category}
        color="emerald"
      />

      {/* Invoices (paid only) */}
      {data.tier === 'paid' && (
        <CategoryTable
          title="Invoices"
          count={summary.invoices.count}
          total={summary.invoices.total}
          byCategory={summary.invoices.by_category}
          color="violet"
        />
      )}
    </div>
  )
}
