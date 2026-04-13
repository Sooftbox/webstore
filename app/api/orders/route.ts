import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      productId,
      productName,
      productPrice,
      buyerEmail,
      buyerName,
      paymentProofUrl,    // R2 public URL
      paymentProofKey,    // R2 key (for deletion if needed)
      paymentMethod,
    } = body

    const order = {
      productId,
      productName,
      productPrice,
      buyerEmail,
      buyerName,
      paymentProofUrl,    // Stored as R2 public URL
      paymentProofKey,    // Stored for cleanup
      paymentMethod,
      status: 'pending',
      createdAt: Date.now(),
      discordNotified: false,
    }

    const docRef = await adminDb.collection('orders').add(order)

    // ─── Queue Discord notification ───
    try {
      await adminDb.collection('discordNotifications').add({
        type: 'new_order',
        orderId: docRef.id,
        productName,
        buyerName,
        buyerEmail,
        productPrice,
        paymentProofUrl,  // R2 URL — Discord bot can display directly
        processed: false,
        createdAt: Date.now(),
      })
    } catch (e) {
      console.error('Discord notification queue failed:', e)
    }

    return NextResponse.json({ id: docRef.id, success: true })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

// GET stays the same...
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret')

    if (secret !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const snapshot = await adminDb
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .get()

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}