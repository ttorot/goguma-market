import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { getSeason } from '@/lib/season'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: '고구마마켓 🍠',
  description: '따뜻한 동네 중고거래, 고구마마켓',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const seasonInfo = getSeason()

  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col ${seasonInfo.className}`}>
        <Header seasonInfo={seasonInfo} />
        <main className="flex-1">{children}</main>
        <footer
          className="border-t py-5 text-center text-sm"
          style={{ borderColor: 'var(--s-border)', color: 'var(--s-text-sub)', backgroundColor: 'var(--s-bg-card)' }}
        >
          🍠 고구마마켓 · 따뜻한 동네 중고거래
        </footer>
      </body>
    </html>
  )
}
