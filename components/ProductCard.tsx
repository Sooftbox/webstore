'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Star } from 'lucide-react'
import { Product } from '@/lib/types'

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link href={`/product/${product.id}`} className="block group">
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Image Container */}
          <div className="relative h-52 bg-gradient-to-br from-surface to-primary overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-border" />
              </div>
            )}
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 text-xs font-semibold bg-primary/70 backdrop-blur-sm text-accent border border-accent/20 rounded-lg">
                {product.category}
              </span>
            </div>
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-60" />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                {product.name}
              </h3>
              <div className="flex items-center gap-1 text-accent">
                <Star className="w-3.5 h-3.5 fill-accent" />
                <span className="text-xs font-medium">5.0</span>
              </div>
            </div>

            <p className="text-text-muted text-sm mb-4 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-accent">
                  Rp{product.price.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm font-semibold group-hover:bg-accent group-hover:text-primary transition-all duration-300">
                View Details
              </div>
            </div>

            {/* Stock Indicator */}
            <div className="mt-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-text-muted">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}