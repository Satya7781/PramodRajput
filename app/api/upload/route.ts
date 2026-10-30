import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';

// POST /api/upload — legacy local file upload fallback
// The primary upload path is direct-to-Cloudinary via /api/upload-signature.
// This route handles small uploads (< 4 MB) for environments where
// Cloudinary env vars are not configured, saving to /public/uploads/.

const ALLOWED_MIME = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/svg+xml',
];
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB — Vercel body limit safe zone

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
      return err('File exceeds 4 MB limit. Please use the direct upload method for larger files.', 413);
    }

    const { writeFile, mkdir } = await import('fs/promises');
    const { join, extname } = await import('path');
    const { randomBytes } = await import('crypto');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext      = extname(file.name) || '.jpg';
    const filename = `${randomBytes(16).toString('hex')}${ext}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    return ok({ url: `/uploads/${filename}`, filename, size: file.size, type: file.type });
  } catch (e) {
    console.error('Upload error:', e);
    return err('Upload failed', 500);
  }
}
