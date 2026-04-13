import { NextResponse } from 'next/server'
import { getPresignedUploadUrl } from '@/lib/r2'

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { filename, fileSize, folder, mime, secret } = body

    // Validate required fields
    if (!filename || !fileSize || !folder) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, fileSize, folder' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (typeof fileSize !== 'number' || fileSize <= 0 || fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File must be between 1 byte and 10MB' },
        { status: 400 }
      )
    }

    // Validate MIME type if provided
    if (mime && !ALLOWED_IMAGE_TYPES.has(mime)) {
      return NextResponse.json(
        { error: `File type "${mime}" not allowed. Use: JPEG, PNG, WebP, or GIF` },
        { status: 400 }
      )
    }

    // Validate folder (only allowed folders)
    const allowedFolders = ['products', 'proofs', 'banners']
    if (!allowedFolders.includes(folder)) {
      return NextResponse.json(
        { error: `Invalid folder. Allowed: ${allowedFolders.join(', ')}` },
        { status: 400 }
      )
    }

    // For admin-only folders (products, banners), verify admin secret
    if (['products', 'banners'].includes(folder)) {
      if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { uploadUrl, key, publicUrl } = await getPresignedUploadUrl(
      folder,
      filename,
      fileSize,
    )

    return NextResponse.json({
      uploadUrl,  // Browser uploads directly to this URL via PUT
      key,        // Store this in Firestore
      publicUrl,  // Public-accessible URL for display
    })
  } catch (error: any) {
    console.error('Presign error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}