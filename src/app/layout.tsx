import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReceiptAI — Smart Receipt & Invoice Processing',
  description: 'Upload receipts and invoices. AI extracts the data automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50">{children}</body>
    </html>
  )
}
