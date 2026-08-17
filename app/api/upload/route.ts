import { NextRequest } from 'next/server';
import { ok, err, requireEditor, isResponse } from '@/lib/api-helpers';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const authResult = requireEditor(req);
  if (isResponse(authResult)) return authResult;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return err('No file uploaded');
    if (!ALLOWED_TYPES.includes(file.type)) {
      return err(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`);
    }
    if (file.size > MAX_SIZE) {
      return err('File size exceeds 10MB limit');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = extname(file.name) || '.jpg';
    const filename = `${randomBytes(16).toString('hex')}${ext}`;

    // Store in /public/uploads/
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    return ok({ url, filename, size: file.size, type: file.type });
  } catch (e) {
    console.error('Upload error:', e);
    return err('Upload failed', 500);
  }
}

export const config = {
  api: { bodyParser: false },
};
