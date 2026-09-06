import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Only logged-in admins / editors can get an upload signature
  const auth = requireEditor(req);
  if (isResponse(auth)) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const folder = (body.folder as string) || 'media';

    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return ok({
      timestamp,
      signature,
      folder,
      apiKey:    process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (e) {
    console.error('upload-signature error:', e);
    return err('Failed to generate upload signature', 500);
  }
}
