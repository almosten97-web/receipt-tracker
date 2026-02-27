const N8N_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data URL prefix (data:image/jpeg;base64,...)
      const base64 = result.split(',')[1] ?? result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export interface UploadResult {
  success: boolean
  id?: string
  type?: string
  merchant?: string
  vendor?: string
  amount?: number
  currency?: string
  date?: string
  due_date?: string
  invoice_number?: string
  category?: string
  error?: string
  message?: string
}

export async function uploadDocument(
  file: File,
  type: 'receipt' | 'invoice',
  token: string
): Promise<UploadResult> {
  const base64 = await fileToBase64(file)
  const res = await fetch(`${N8N_URL}/receipts/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image: base64, type, filename: file.name }),
  })
  return res.json()
}

export interface CategoryStat {
  count: number
  total: number
}

export interface TaxSummary {
  user_id: string
  year: number
  tier: string
  summary: {
    receipts: { count: number; total: number; by_category: Record<string, CategoryStat> }
    invoices: { count: number; total: number; by_category: Record<string, CategoryStat> }
    grand_total: number
  }
  receipts: Array<{
    id: string
    merchant: string
    amount: number
    currency: string
    receipt_date: string
    category: string
  }>
  invoices: Array<{
    id: string
    vendor: string
    amount: number
    currency: string
    invoice_date: string
    due_date: string
    status: string
    category: string
  }>
}

export async function fetchTaxSummary(year: number, token: string): Promise<TaxSummary> {
  const res = await fetch(`${N8N_URL}/export/tax-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ year }),
  })
  return res.json()
}

export function exportToCsv(summary: TaxSummary): void {
  const rows: string[] = ['Type,Date,Merchant/Vendor,Category,Amount,Currency']
  for (const r of summary.receipts) {
    rows.push(
      `receipt,${r.receipt_date},"${r.merchant ?? ''}",${r.category},${r.amount},${r.currency}`
    )
  }
  for (const inv of summary.invoices) {
    rows.push(
      `invoice,${inv.invoice_date},"${inv.vendor ?? ''}",${inv.category},${inv.amount},${inv.currency}`
    )
  }
  const csv = rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tax-summary-${summary.year}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
