import { NextResponse } from 'next/server'

// This endpoint is called internally to notify the Discord bot
// The bot polls Firebase directly, but this can be used as immediate notification
export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-webhook-secret')
    if (secret !== process.env.DISCORD_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // The Discord bot listens on Firebase directly
    // This is a fallback notification mechanism
    // Store notification in Firebase for bot to pick up
    const { adminDb } = await import('@/lib/firebaseAdmin')
    
    await adminDb.collection('discordNotifications').add({
      type: 'new_order',
      orderId: body.orderId,
      productName: body.productName,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      productPrice: body.productPrice,
      paymentProofUrl: body.paymentProofUrl,
      processed: false,
      createdAt: Date.now(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Discord webhook error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}