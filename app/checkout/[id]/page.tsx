'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Product, PaymentMethod } from '@/lib/types'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Upload, Loader2, CheckCircle, Copy } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', params.id))
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() } as Product)
        }

        const pmSnapshot = await getDocs(collection(db, 'paymentMethods'))
        const pm = pmSnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as PaymentMethod[]
        setPaymentMethods(pm)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [params.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
      setProofPreview(URL.createObjectURL(file))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !proofFile || !selectedPayment) return

    setSubmitting(true)
    try {
      // Upload proof image
      const formData = new FormData()
      formData.append('file', proofFile)
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const { url: proofUrl } = await uploadRes.json()

      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          buyerEmail,
          buyerName,
          paymentProofUrl: proofUrl,
          paymentMethod: selectedPayment,
        }),
      })

      if (orderRes.ok) {
        setSubmitted(true)
      } else {
        toast.error('Failed to submit order')
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

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

  if (submitted) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="glass-card rounded-3xl p-12 text-center max-w-lg">
            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold text-text-primary mb-4">
              Order Submitted!
            </h2>
            <p className="text-text-secondary mb-2">
              Your payment proof has been sent to the admin for verification.
            </p>
            <p className="text-text-muted text-sm mb-8">
              You will receive the product via email at <span className="text-accent">{buyerEmail}</span> once confirmed.
            </p>
            <Link
              href="/store"
              className="inline-block px-8 py-3 bg-accent text-primary font-semibold rounded-2xl hover:bg-accent-hover transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link
            href={`/product/${params.id}`}
            className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Product
          </Link>

          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">Checkout</h1>
          <div className="glow-line w-16 mb-10" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
              {/* Personal Info */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-text-primary font-semibold text-lg mb-4">Your Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-text-muted text-sm mb-2 block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-sm mb-2 block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                      placeholder="you@email.com"
                    />
                    <p className="text-text-muted text-xs mt-1">Product will be delivered to this email</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-text-primary font-semibold text-lg mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPayment(pm.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        selectedPayment === pm.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border bg-surface hover:border-accent/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-primary font-medium">{pm.name}</p>
                          <p className="text-text-muted text-sm">{pm.type}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === pm.id ? 'border-accent' : 'border-border'
                        }`}>
                          {selectedPayment === pm.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                          )}
                        </div>
                      </div>

                      {selectedPayment === pm.id && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-text-muted text-sm">Account Number:</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(pm.accountNumber)}
                              className="flex items-center gap-1 text-accent text-sm"
                            >
                              {pm.accountNumber} <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-text-muted text-sm">Account Name:</span>
                            <span className="text-text-primary text-sm">{pm.accountName}</span>
                          </div>
                          {pm.instructions && (
                            <p className="text-text-muted text-xs mt-2 bg-primary/50 p-3 rounded-lg">
                              {pm.instructions}
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Proof */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-text-primary font-semibold text-lg mb-4">Payment Proof</h3>
                <label className="block cursor-pointer">
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    proofPreview ? 'border-accent/30' : 'border-border hover:border-accent/20'
                  }`}>
                    {proofPreview ? (
                      <img
                        src={proofPreview}
                        alt="Proof"
                        className="max-h-64 mx-auto rounded-xl"
                      />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
                        <p className="text-text-secondary">Upload screenshot of your payment</p>
                        <p className="text-text-muted text-sm mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !selectedPayment || !proofFile}
                className="w-full py-4 bg-accent text-primary font-bold text-lg rounded-2xl hover:bg-accent-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Order'
                )}
              </button>
            </form>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl p-6 sticky top-28">
                <h3 className="text-text-primary font-semibold text-lg mb-4">Order Summary</h3>
                {product && (
                  <>
                    <div className="relative h-40 bg-surface rounded-xl overflow-hidden mb-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 text-border">📦</div>
                        </div>
                      )}
                    </div>
                    <h4 className="text-text-primary font-semibold mb-1">{product.name}</h4>
                    <p className="text-text-muted text-sm mb-4">{product.category}</p>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Total</span>
                        <span className="text-2xl font-bold text-accent">
                          Rp{product.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}