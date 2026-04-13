import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

// ─── R2 Client ───
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.R2_PUBLIC_URL!

// ─── Generate Presigned URL for Upload ───
export async function getPresignedUploadUrl(
  folder: string,
  filename: string,
  fileSize: number,
  maxSizeMB: number = 10,
) {
  // Validate file size
  if (fileSize > maxSizeMB * 1024 * 1024) {
    throw new Error(`File too large. Max ${maxSizeMB}MB`)
  }

  // Sanitize filename & generate unique key
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${folder}/${randomUUID()}-${sanitized}`

  // NOTE: Do NOT set ContentType here to avoid browser mismatch issues
  // Validate file type on API side before minting URL
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 600, // 10 minutes
  })

  const publicUrl = `${PUBLIC_URL}/${key}`

  return { uploadUrl, key, publicUrl }
}

// ─── Delete Object from R2 ───
export async function deleteR2Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })
  await r2Client.send(command)
}

// ─── Get public URL from key ───
export function getR2PublicUrl(key: string) {
  return `${PUBLIC_URL}/${key}`
}