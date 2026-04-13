// ADD import:
import { uploadFileToR2 } from '@/lib/uploadToR2'

// ADD state for file:
const [imageFile, setImageFile] = useState<File | null>(null)
const [imagePreview, setImagePreview] = useState('')

// ADD image file handler:
const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }
}

// UPDATE handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSaving(true)

  let imageUrl = form.imageUrl // Keep existing URL if not changing

  try {
    // If new image selected, upload to R2
    if (imageFile) {
      const { publicUrl } = await uploadFileToR2(
        imageFile,
        'products',
        secret // Admin secret for auth
      )
      imageUrl = publicUrl
    }

    const productData = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      imageUrl,  // Now an R2 URL
      deliveryContent: form.deliveryContent,
      features: form.features.split('\n').filter(f => f.trim()),
      stock: Number(form.stock),
      secret,
    }

    if (editingProduct) {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...productData, id: editingProduct.id }),
      })
      toast.success('Product updated!')
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })
      toast.success('Product created!')
    }
    resetForm()
    setImageFile(null)
    setImagePreview('')
    fetchProducts()
  } catch (err: any) {
    toast.error(err.message || 'Failed')
  } finally {
    setSaving(false)
  }
}

// UPDATE the image URL input in the form — replace text input with file upload:
{/* Replace the old imageUrl text input with this: */}
<div>
  <label className="text-text-muted text-sm mb-1 block">Product Image</label>
  
  {/* Preview */}
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
          onClick={() => { setImageFile(null); setImagePreview('') }}
          className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )}

  {/* File Input */}
  <label className="block cursor-pointer">
    <div className="border-2 border-dashed border-border hover:border-accent/30 rounded-xl p-4 text-center transition-all">
      <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
      <p className="text-text-secondary text-sm">
        {imageFile ? imageFile.name : 'Click to upload image'}
      </p>
      <p className="text-text-muted text-xs mt-1">PNG, JPG, WebP up to 10MB</p>
    </div>
    <input
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      onChange={handleImageSelect}
      className="hidden"
    />
  </label>

  {/* Fallback: manual URL */}
  <div className="mt-2">
    <p className="text-text-muted text-xs mb-1">Or paste image URL:</p>
    <input
      type="url"
      value={form.imageUrl}
      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
      className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent/50"
      placeholder="https://..."
    />
  </div>
</div>