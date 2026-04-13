/**
 * Upload a file to Cloudflare R2 via presigned URL
 * Flow: 
 *   1. Ask server for presigned URL
 *   2. Upload file directly to R2
 *   3. Return public URL
 */
export async function uploadFileToR2(
  file: File,
  folder: 'products' | 'proofs' | 'banners',
  adminSecret?: string,
): Promise<{ publicUrl: string; key: string }> {
  // Step 1: Get presigned URL from our API
  const presignRes = await fetch('/api/upload/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      fileSize: file.size,
      folder,
      mime: file.type,
      secret: adminSecret,
    }),
  })

  if (!presignRes.ok) {
    const err = await presignRes.json()
    throw new Error(err.error || 'Failed to get upload URL')
  }

  const { uploadUrl, key, publicUrl } = await presignRes.json()

  // Step 2: Upload file directly to R2 (browser → R2, no server middleware)
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    // Don't manually set Content-Type to avoid presigned URL signature mismatch
  })

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => '')
    throw new Error(`R2 upload failed (${uploadRes.status}): ${errText}`)
  }

  // Step 3: Return the public URL and key
  return { publicUrl, key }
}