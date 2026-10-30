import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';

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
      return err('Cloudinary is not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.', 500);
    }

    const timestamp = Math.round(Date.now() / 1000);

    // Build the string-to-sign: alphabetically sorted params
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

    // Sign using Node.js built-in crypto (no Cloudinary SDK needed)
    const crypto = await import('crypto');
    const signature = crypto
      .createHash('sha256')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    return ok({ timestamp, signature, apiKey, cloudName });
  } catch (e) {
    console.error('POST /api/upload-signature error:', e);
    return err('Failed to generate upload signature', 500);
  }
}
