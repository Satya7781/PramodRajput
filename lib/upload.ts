/**
 * uploadToCloudinary
 * ------------------
 * Uploads a file directly from the browser to Cloudinary using a
 * server-signed request — Vercel's 4.5 MB body limit is bypassed entirely.
 *
 * Returns the secure_url and public_id to store in the database.
 */

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
}

export async function uploadToCloudinary(
  file: File,
  token: string,
  folder = 'media'
): Promise<CloudinaryUploadResult> {
  // Step 1 — get a signed upload token from our API
  const sigRes = await fetch('/api/upload-signature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ folder }),
  });

  if (!sigRes.ok) {
    const body = await sigRes.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to get upload signature');
  }

  const { timestamp, signature, apiKey, cloudName } = await sigRes.json();

  // Step 2 — upload directly to Cloudinary
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
 * Store raw URLs in the DB; apply optimizations here so you can change them later.
 *
 * Examples:
 *   cloudinaryOptimized(url, 'w_800,f_auto,q_auto')   → resized card image
 *   cloudinaryOptimized(url, 'w_1600,f_auto,q_auto')  → full-size detail image
 */
export function cloudinaryOptimized(url: string, transforms = 'f_auto,q_auto'): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}
