'use client'

import { useEffect, useState } from 'react'
import { Order } from '@/lib/types'
import { CheckCircle, XCircle, Eye, Loader2, Clock, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all')
  const [viewProof, setViewProof] = useState<string | null>(null)

  const secret = typeof window !== 'undefined' ? localStorage.getItem('admin_secret') || '' : ''

  const fetchOrders = async () => {
    const res = await fetch(`/api/orders?secret=${secret}`)
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const handleAction = async (orderId: string, action: 'confirm' | 'reject') => {
    setProcessing(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, action }),
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message)
        fetchOrders()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Failed')
    } finally {
      setProcessing(null)
    }
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    confirmed: 'text-green-400 bg-green-400/10 border-green-400/20',
    rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text-primary mb-2">Orders</h1>
      <p className="text-text-muted mb-8">Manage customer orders and confirm payments</p>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
              filter === f
                ? 'bg-accent text-primary border-accent'
                : 'bg-surface text-text-secondary border-border hover:border-accent/30'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-primary text-xs rounded-full">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Proof Viewer Modal */}
      {viewProof && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewProof(null)}>
          <div className="max-w-2xl max-h-[80vh] relative">
            <button
              onClick={() => setViewProof(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-accent"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={viewProof} alt="Payment Proof" className="rounded-2xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-text-muted">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="glass-card rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-text-primary font-semibold">{order.productName}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-text-muted">Buyer</p>
                      <p className="text-text-primary">{order.buyerName}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Email</p>
                      <p className="text-text-primary">{order.buyerEmail}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Price</p>
                      <p className="text-accent font-semibold">Rp{order.productPrice.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Date</p>
                      <p className="text-text-primary">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewProof(order.paymentProofUrl)}
                    className="px-4 py-2.5 bg-surface border border-border rounded-xl text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all flex items-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Proof
                  </button>

                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(order.id, 'confirm')}
                        disabled={processing === order.id}
                        className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl hover:bg-green-500/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                      >
                        {processing === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Confirm
                      </button>
                      <button
                        onClick={() => handleAction(order.id, 'reject')}
                        disabled={processing === order.id}
                        className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}