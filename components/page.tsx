import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import Footer from '@/components/Footer'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types'

async function getFeaturedProducts(): Promise<Product[]> {
  // For SSR, we use admin SDK
  // But for simplicity in client component, we'll fetch on client
  return []
}

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <FeaturedSection />
      <Footer />
    </main>
  )
}

function FeaturedSection() {
  return (
    <section className="relative py-24 -mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Featured</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mt-3">
            Latest Products
          </h2>
          <div className="glow-line w-24 mx-auto mt-6" />
        </div>

        {/* Products will be loaded client-side */}
        <FeaturedProductsClient />
      </div>
    </section>
  )
}

// This is a separate client component
import FeaturedProductsClient from './FeaturedProductsClient'