'use client';
import { createClient } from '@/lib/supabase/client';

export async function uploadPostImage(file: File): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (file.size > 1 * 1024 * 1024) return { error: 'Image must be under 1MB' };
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) return { error: 'Only JPEG, PNG, WebP, GIF allowed' };

  // Resize using canvas (browser API)
  const arrayBuffer = await file.arrayBuffer();
  const img = await createImageBitmap(new Blob([arrayBuffer]));
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b: Blob | null) => resolve(b!), file.type, 0.85)
  );

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(path, blob, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path);
  return { url: urlData.publicUrl };
}
