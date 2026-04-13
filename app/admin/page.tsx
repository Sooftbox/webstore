'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingCart, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const secret = localStorage.getItem('admin_secret')

      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch(`/api/orders?secret=${secret}`),
      ])

      const products = await productsRes.json()
      const orders = await ordersRes.json()

      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length
      const confirmedOrders = orders.filter((o: any) => o.status === 'confirmed').length
      const revenue = orders
        .filter((o: any) => o.status === 'confirmed')
        .reduce((sum: number, o: any) => sum + o.productPrice, 0)

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        confirmedOrders,
        totalRevenue: revenue,
      })
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-400' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-purple-400' },
    { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-400' },
    { label: 'Confirmed', value: stats.confirmedOrders, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Revenue', value: `Rp${stats.totalRevenue.toLocaleString('id-ID')}`, icon: DollarSign, color: 'text-accent' },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
      <p className="text-text-muted mb-8">Overview of your store</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-text-muted text-sm mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}