'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Product } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, ShoppingBag, Shield, Zap, Loader2 } from 'lucide-react'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', params.id)
        const snapshot = await getDoc(docRef)
        if (snapshot.exists()) {
          setProduct({ id: snapshot.id, ...snapshot.data() } as Product)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-text-muted text-xl mb-4">Product not found</p>
          <Link href="/store" className="text-accent hover:underline">Back to store</Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="relative h-80 lg:h-[500px] bg-gradient-to-br from-surface to-primary">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="w-24 h-24 text-border" />
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="inline-block px-3 py-1.5 bg-accent/10 text-accent text-sm font-semibold border border-accent/20 rounded-lg mb-4">
                {product.category}
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {product.name}
              </h1>

              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-text-primary font-semibold mb-4">What you get:</h3>
                  <div className="space-y-3">
                    {product.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <span className="text-text-secondary text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-muted text-sm">Price</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-text-muted text-sm">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-accent mb-6">
                  Rp{product.price.toLocaleString('id-ID')}
                </div>

                {product.stock > 0 ? (
                  <Link
                    href={`/checkout/${product.id}`}
                    className="block w-full py-4 bg-accent text-primary text-center font-bold text-lg rounded-2xl hover:bg-accent-hover transition-all duration-300 shadow-glow"
                  >
                    Buy Now
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full py-4 bg-surface text-text-muted text-center font-bold text-lg rounded-2xl cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>

              {/* Trust */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <Shield className="w-4 h-4 text-accent" />
                  Secure
                </div>
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <Zap className="w-4 h-4 text-accent" />
                  Instant via Email
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}