'use client';
import { createClient } from '@/lib/supabase/client';

const MAX_INPUT_SIZE = 25 * 1024 * 1024; // 25MB raw input cap (modern phone photos)
const MAX_OUTPUT_SIZE = 1 * 1024 * 1024;  // 1MB after resize/compress
const MAX_DIMENSION = 1200;
const MAX_IMAGES = 10;

export async function uploadPostImage(file: File): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (file.size > MAX_INPUT_SIZE) return { error: 'Image too large (max 25MB)' };
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) return { error: 'Only JPEG, PNG, WebP, GIF allowed' };

  // Resize using canvas (browser API)
  const arrayBuffer = await file.arrayBuffer();
  const img = await createImageBitmap(new Blob([arrayBuffer]));
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Always output JPEG for best compression (GIFs lose animation, but that's fine for static photos)
  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

  // Try progressively lower quality until we fit under MAX_OUTPUT_SIZE
  let blob: Blob | null = null;
  for (const quality of [0.85, 0.75, 0.65, 0.55, 0.45]) {
    blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b: Blob | null) => resolve(b!), outputType, quality)
    );
    if (blob && blob.size <= MAX_OUTPUT_SIZE) break;
  }

  if (!blob || blob.size > MAX_OUTPUT_SIZE) {
    return { error: 'Could not compress image below 1MB. Try a smaller photo.' };
  }

  const ext = outputType === 'image/png' ? 'png' : 'jpg';
  const path = `${user.id}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(path, blob, { contentType: outputType, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path);
  return { url: urlData.publicUrl };
}

export async function uploadPostImages(files: File[]): Promise<{ urls: string[] } | { error: string }> {
  if (files.length > MAX_IMAGES) return { error: `Maximum ${MAX_IMAGES} images allowed` };

  const urls: string[] = [];
  for (const file of files) {
    const result = await uploadPostImage(file);
    if ('error' in result) return { error: result.error };
    urls.push(result.url);
  }
  return { urls };
}
