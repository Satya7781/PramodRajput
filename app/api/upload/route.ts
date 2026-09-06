import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import cloudinary from '@/lib/cloudinary';

const ALLOWED_MIME = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
];
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB (Cloudinary free hard cap)

export async function POST(req: NextRequest) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return err('No file uploaded');
    if (!ALLOWED_MIME.includes(file.type)) {
      return err(`File type not allowed: ${file.type}`);
    }
    if (file.size > MAX_SIZE) {
      return err('File exceeds 100 MB limit');
    }

    // Convert File → base64 data URI for Cloudinary SDK upload
    const bytes  = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const isVideo     = file.type.startsWith('video/');
    const resourceType: 'image' | 'video' | 'auto' = isVideo ? 'video' : 'image';

    const result = await cloudinary.uploader.upload(dataUri, {
      folder:        'media',
      resource_type: resourceType,
      // Auto quality + format on delivery — saves bandwidth credits
      transformation: isVideo
        ? [{ quality: 'auto' }]
        : [{ quality: 'auto', fetch_format: 'auto' }],
    });

    return ok({
      url:          result.secure_url,
      publicId:     result.public_id,
      resourceType: result.resource_type,
      width:        result.width,
      height:       result.height,
      bytes:        result.bytes,
    });
  } catch (e) {
    console.error('Cloudinary upload error:', e);
    return err('Upload failed', 500);
  }
}


