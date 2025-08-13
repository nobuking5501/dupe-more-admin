import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import DevTools from '@/components/DevTools'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dupe&more 管理画面',
  description: 'Dupe&more コンテンツ管理システム',
  icons: {
    icon: [
      { url: '/aicon01.png', sizes: '32x32', type: 'image/png' },
      { url: '/aicon01.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/aicon01.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dupe&more Admin',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <DevTools />
      </body>
    </html>
  )
}