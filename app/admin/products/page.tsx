'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/lib/types'
import { Plus, Edit, Trash2, Loader2, X, Save, Upload } from 'lucide-react'
import { uploadFileToR2 } from '@/lib/uploadToR2'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    deliveryContent: '',
    features: '',
    stock: '',
  })

  const secret =
    typeof window !== 'undefined'
      ? localStorage.getItem('admin_secret') || ''
      : ''

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      deliveryContent: '',
      features: '',
      stock: '',
    })
    setEditingProduct(null)
    setShowForm(false)
    setImageFile(null)
    setImagePreview('')
  }

  const openEditForm = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      category: product.category || '',
      imageUrl: product.imageUrl || '',
      deliveryContent: product.deliveryContent || '',
      features: product.features?.join('\n') || '',
      stock: String(product.stock ?? ''),
    })
    setImageFile(null)
    setImagePreview('')
    setShowForm(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    let imageUrl = form.imageUrl

    try {
      if (imageFile) {
        const { publicUrl } = await uploadFileToR2(imageFile, 'products', secret)
        imageUrl = publicUrl
      }

      const productData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        imageUrl,
        deliveryContent: form.deliveryContent,
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        stock: Number(form.stock),
        secret,
      }

      if (editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...productData, id: editingProduct.id }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || 'Failed to update product')
        }

        toast.success('Product updated!')
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || 'Failed to create product')
        }

        toast.success('Product created!')
      }

      resetForm()
      fetchProducts()
    } catch (err: any) {
      toast.error(err?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return

    try {
      const res = await fetch(`/api/products?id=${id}&secret=${secret}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to delete product')
      }

      toast.success('Product deleted')
      fetchProducts()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete product')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Products
          </h1>
          <p className="text-text-muted">Manage your store products</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="px-6 py-3 bg-accent text-primary font-semibold rounded-xl hover:bg-accent-hover transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-text-primary">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-sm mb-1 block">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-sm mb-1 block">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50"
                    placeholder="e.g. Script, Template, Software"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-muted text-sm mb-1 block">
                  Description
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-sm mb-1 block">
                    Price (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-sm mb-1 block">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-muted text-sm mb-1 block">
                  Product Image
                </label>

                {(imagePreview || form.imageUrl) && (
                  <div className="mb-3 relative w-full h-40 rounded-xl overflow-hidden bg-surface">
                    <img
                      src={imagePreview || form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-border hover:border-accent/30 rounded-xl p-4 text-center transition-all">
                    <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
                    <p className="text-text-secondary text-sm">
                      {imageFile ? imageFile.name : 'Click to upload image'}
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                <div className="mt-2">
                  <p className="text-text-muted text-xs mb-1">
                    Or paste image URL:
                  </p>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent/50"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="text-text-muted text-sm mb-1 block">
                  Delivery Content{' '}
                  <span className="text-accent">
                    (sent to buyer via email after confirmation)
                  </span>
                </label>
                <textarea
                  required
                  value={form.deliveryContent}
                  onChange={(e) =>
                    setForm({ ...form, deliveryContent: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 resize-none font-mono text-sm"
                  placeholder="Download link, license key, or product details..."
                />
              </div>

              <div>
                <label className="text-text-muted text-sm mb-1 block">
                  Features (one per line)
                </label>
                <textarea
                  value={form.features}
                  onChange={(e) =>
                    setForm({ ...form, features: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 resize-none"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-accent text-primary font-semibold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">
                  Product
                </th>
                <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">
                  Category
                </th>
                <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">
                  Price
                </th>
                <th className="text-left px-6 py-4 text-text-muted text-sm font-medium">
                  Stock
                </th>
                <th className="text-right px-6 py-4 text-text-muted text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted text-lg">
                            📦
                          </div>
                        )}
                      </div>
                      <span className="text-text-primary font-medium">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-accent font-semibold">
                    Rp{product.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditForm(product)}
                      className="p-2 text-text-muted hover:text-accent transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-text-muted"
                  >
                    No products yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
