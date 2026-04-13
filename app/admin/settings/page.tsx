'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PaymentMethod } from '@/lib/types'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPM, setNewPM] = useState({
    name: '',
    type: 'bank',
    accountNumber: '',
    accountName: '',
    instructions: '',
  })

  const fetchPM = async () => {
    const snapshot = await getDocs(collection(db, 'paymentMethods'))
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as PaymentMethod[]
    setPaymentMethods(data)
    setLoading(false)
  }

  useEffect(() => { fetchPM() }, [])

  const addPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const id = `pm_${Date.now()}`
      await setDoc(doc(db, 'paymentMethods', id), {
        ...newPM,
        id,
      })
      toast.success('Payment method added!')
      setNewPM({ name: '', type: 'bank', accountNumber: '', accountName: '', instructions: '' })
      fetchPM()
    } catch {
      toast.error('Failed')
    } finally {
      setSaving(false)
    }
  }

  const deletePM = async (id: string) => {
    if (!confirm('Delete this payment method?')) return
    await deleteDoc(doc(db, 'paymentMethods', id))
    toast.success('Deleted')
    fetchPM()
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text-primary mb-2">Settings</h1>
      <p className="text-text-muted mb-8">Configure your store settings</p>

      {/* Payment Methods */}
      <div className="glass-card rounded-2xl p-8 mb-8">
        <h2 className="text-text-primary font-display font-bold text-xl mb-6">Payment Methods</h2>

        {/* Existing */}
        <div className="space-y-3 mb-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <p className="text-text-muted text-center py-8">No payment methods yet. Add one below.</p>
          ) : (
            paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                <div>
                  <p className="text-text-primary font-medium">{pm.name}</p>
                  <p className="text-text-muted text-sm">{pm.type} • {pm.accountNumber} • {pm.accountName}</p>
                </div>
                <button
                  onClick={() => deletePM(pm.id)}
                  className="p-2 text-text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add New */}
        <div className="border-t border-border pt-6">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent" />
            Add Payment Method
          </h3>
          <form onSubmit={addPaymentMethod} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-muted text-sm mb-1 block">Name</label>
                <input
                  type="text" required value={newPM.name}
                  onChange={(e) => setNewPM({ ...newPM, name: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50"
                  placeholder="e.g. BCA, GoPay, DANA"
                />
              </div>
              <div>
                <label className="text-text-muted text-sm mb-1 block">Type</label>
                <select
                  value={newPM.type}
                  onChange={(e) => setNewPM({ ...newPM, type: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-muted text-sm mb-1 block">Account Number</label>
                <input
                  type="text" required value={newPM.accountNumber}
                  onChange={(e) => setNewPM({ ...newPM, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50"
                />
              </div>
              <div>
                <label className="text-text-muted text-sm mb-1 block">Account Name</label>
                <input
                  type="text" required value={newPM.accountName}
                  onChange={(e) => setNewPM({ ...newPM, accountName: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50"
                />
              </div>
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1 block">Instructions (optional)</label>
              <textarea
                value={newPM.instructions}
                onChange={(e) => setNewPM({ ...newPM, instructions: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 resize-none"
                placeholder="Extra instructions for the buyer..."
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-accent text-primary font-semibold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Payment Method
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}