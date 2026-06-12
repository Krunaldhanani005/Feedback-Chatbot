import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nanta Tech Experience Days — Nanta Tech Limited',
  description: 'AI-powered kiosk for exploring Robotics, AI Vision, AV Technology and Automation solutions.',
  icons: {
    icon: [
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicon_io/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark-bg text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
