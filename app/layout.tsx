import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'NexStore — Premium Digital Store',
  description: 'Premium digital products marketplace with exclusive deals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="noise-bg font-sans antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f5f5f5',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#c8a84e', secondary: '#0a0a0a' },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}