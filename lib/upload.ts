/**
 * uploadToCloudinary
 * ------------------
 * Uploads a file directly from the browser to Cloudinary using a
 * server-signed request — Vercel's 4.5 MB body limit is bypassed entirely.
 *
 * Falls back to the local /api/upload endpoint for small images (<4 MB)
 * when Cloudinary is not configured.
 */

export interface CloudinaryUploadResult {
  url: string;
  publicId?: string;
  resourceType?: string;
}

export async function uploadToCloudinary(
  file: File,
  token: string,
  folder = 'media'
): Promise<CloudinaryUploadResult> {
  // Step 1 — attempt to get a signed upload token from our API
  const sigRes = await fetch('/api/upload-signature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ folder }),
  });

  // If Cloudinary is not configured (500) or server unavailable, fall back
  // to local upload for images ≤ 4 MB
  if (!sigRes.ok) {
    if (file.size > 4 * 1024 * 1024) {
      throw new Error(
        'File is too large for upload. Please configure Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) to enable large file uploads.'
      );
    }
    // Fallback: local /api/upload (works for images ≤ 4 MB)
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!uploadRes.ok) {
      const body = await uploadRes.json().catch(() => ({}));
      throw new Error(body.error ?? 'Upload failed');
    }
    const data = await uploadRes.json();
    return { url: data.url };
  }

  const { timestamp, signature, apiKey, cloudName } = await sigRes.json();

  // Step 2 — upload directly to Cloudinary (bypasses Vercel body limit)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!uploadRes.ok) {
    const body = await uploadRes.json().catch(() => ({}));
    throw new Error(body.error?.message ?? 'Cloudinary upload failed');
  }

  const data = await uploadRes.json();

  return {
    url:          data.secure_url,
    publicId:     data.public_id,
    resourceType: data.resource_type,
  };
}

/**
 * cloudinaryOptimized
 * -------------------
 * Injects Cloudinary transformation params into a stored URL at display time.
 */
export function cloudinaryOptimized(url: string, transforms = 'f_auto,q_auto'): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

/**
 * uploadFile — simple wrapper used by the registration form
 * for file/image field uploads.
 */
export async function uploadFile(file: File): Promise<string> {
  const { getAuthToken } = await import('./api-client');
  const token = getAuthToken() ?? '';
  const result = await uploadToCloudinary(file, token, 'registrations');
  return result.url;
}
