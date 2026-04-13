import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { sendProductDeliveryEmail } from '@/lib/email'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { secret, action } = body

    if (secret !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderRef = adminDb.collection('orders').doc(params.id)
    const orderDoc = await orderRef.get()

    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderDoc.data()!

    if (action === 'confirm') {
      // Get product delivery content
      const productDoc = await adminDb.collection('products').doc(order.productId).get()
      
      if (!productDoc.exists) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const product = productDoc.data()!

      // Send product via email
      await sendProductDeliveryEmail(
        order.buyerEmail,
        order.buyerName,
        order.productName,
        product.deliveryContent,
        'NexStore'
      )

      // Update order status
      await orderRef.update({
        status: 'confirmed',
        confirmedAt: Date.now(),
      })

      // Decrease stock
      const currentStock = product.stock || 0
      if (currentStock > 0) {
        await adminDb.collection('products').doc(order.productId).update({
          stock: currentStock - 1,
        })
      }

      return NextResponse.json({ success: true, message: 'Order confirmed and product delivered via email' })
    } else if (action === 'reject') {
      await orderRef.update({ status: 'rejected' })
      return NextResponse.json({ success: true, message: 'Order rejected' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Confirm error:', error)
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}