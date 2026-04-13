export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  deliveryContent: string  // The actual product/link/key to deliver via email
  features: string[]
  isActive: boolean
  createdAt: number
  stock: number
}

export interface Order {
  id: string
  productId: string
  productName: string
  productPrice: number
  buyerEmail: string
  buyerName: string
  paymentProofUrl: string
  status: 'pending' | 'confirmed' | 'rejected'
  createdAt: number
  confirmedAt?: number
  discordNotified: boolean
}

export interface StoreSettings {
  storeName: string
  storeDescription: string
  bannerText: string
  discordInvite: string
  paymentMethods: PaymentMethod[]
}

export interface PaymentMethod {
  id: string
  name: string
  type: string // 'bank' | 'ewallet' | 'crypto'
  accountNumber: string
  accountName: string
  instructions: string
}