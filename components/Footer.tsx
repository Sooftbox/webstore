import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-yellow-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-text-primary">
              Nex<span className="text-accent">Store</span>
            </span>
          </div>

          <div className="flex items-center gap-8">
            <Link href="/" className="text-text-muted hover:text-text-primary text-sm transition-colors">
              Home
            </Link>
            <Link href="/store" className="text-text-muted hover:text-text-primary text-sm transition-colors">
              Store
            </Link>
          </div>

          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} NexStore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}