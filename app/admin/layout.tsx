'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/Sidebar'
import { Lock, Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [secretKey, setSecretKey] = useState('')
  const [checking, setChecking] = useState(false)
  const [savedKey, setSavedKey] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('admin_secret')
    if (stored) {
      setSavedKey(stored)
      setAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)

    try {
      const res = await fetch(`/api/orders?secret=${secretKey}`)
      if (res.ok) {
        localStorage.setItem('admin_secret', secretKey)
        setSavedKey(secretKey)
        setAuthenticated(true)
      } else {
        alert('Invalid secret key')
      }
    } catch {
      alert('Error')
    } finally {
      setChecking(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary px-6">
        <div className="glass-card rounded-3xl p-10 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary text-center mb-2">
            Admin Access
          </h1>
          <p className="text-text-muted text-sm text-center mb-8">
            Enter your admin secret key
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Secret Key"
              className="w-full px-4 py-3.5 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              required
            />
            <button
              type="submit"
              disabled={checking}
              className="w-full py-3.5 bg-accent text-primary font-semibold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}