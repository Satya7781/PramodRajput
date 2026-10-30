import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import { createHash } from 'crypto';

// POST /api/upload-signature
// Returns a signed Cloudinary upload signature so the client can upload
// directly to Cloudinary, bypassing Vercel's 4.5 MB body limit entirely.
export async function POST(req: NextRequest) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;

  try {
    const body = await req.json();
    const folder = (body.folder as string) || 'media';

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return err(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
        500
      );
    }

    const timestamp = Math.round(Date.now() / 1000);

    // Cloudinary signature: SHA-1 of "folder=...&timestamp=...{api_secret}"
    // Params must be alphabetically sorted with no spaces
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    return ok({ timestamp, signature, apiKey, cloudName });
  } catch (e) {
    console.error('POST /api/upload-signature error:', e);
    return err('Failed to generate upload signature', 500);
  }
}
