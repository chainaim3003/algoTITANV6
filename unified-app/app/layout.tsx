import type { Metadata } from 'next'
import './globals.css'
import Navigation from './Navigation'

export const metadata: Metadata = {
  title: 'AlgoTITAN Unified App',
  description: 'Unified Algorand Trading Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
