// ... imports stay the same, REMOVE old upload route ...
// ADD:
import { uploadFileToR2 } from '@/lib/uploadToR2'

// Inside the component, update handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!product || !proofFile || !selectedPayment) return

  setSubmitting(true)
  try {
    // ─── Upload payment proof directly to R2 ───
    const { publicUrl: proofUrl, key: proofKey } = await uploadFileToR2(
      proofFile,
      'proofs' // Public folder, no admin secret needed
    )

    // ─── Create order in Firestore (via our API) ───
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        buyerEmail,
        buyerName,
        paymentProofUrl: proofUrl,    // R2 public URL
        paymentProofKey: proofKey,    // R2 key for deletion later
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

// ... rest stays the same