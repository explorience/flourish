import type { Category, Urgency, PostType } from '@/types/database';

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'items', label: 'Items', icon: 'package' },
  { value: 'services', label: 'Services', icon: 'hand-helping' },
  { value: 'skills', label: 'Skills', icon: 'lightbulb' },
  { value: 'space', label: 'Space', icon: 'home' },
  { value: 'other', label: 'Other', icon: 'sparkles' },
];

export const URGENCIES: { value: Urgency; label: string; description: string }[] = [
  { value: 'flexible', label: 'Whenever', description: 'No rush at all' },
  { value: 'this_week', label: 'This week', description: 'Would be great soon' },
  { value: 'today', label: 'Today', description: 'Needed right away' },
];

export const POST_TYPES: { value: PostType; label: string; action: string; color: string; bgColor: string }[] = [
  { value: 'need', label: 'Need', action: 'I need something', color: 'text-[hsl(18,60%,52%)]', bgColor: 'bg-[hsl(18,60%,52%)]' },
  { value: 'offer', label: 'Offer', action: 'I can offer something', color: 'text-[hsl(145,30%,42%)]', bgColor: 'bg-[hsl(145,30%,42%)]' },
];

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Flourish';
export const APP_TAGLINE = process.env.NEXT_PUBLIC_APP_TAGLINE || 'Community Exchange';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Share what you have. Ask for what you need.';
export const APP_COMMUNITY = process.env.NEXT_PUBLIC_APP_COMMUNITY || 'your community';
export const APP_SMS_NUMBER = process.env.NEXT_PUBLIC_SMS_NUMBER || '';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

export const POST_EXPIRY_DAYS = 30; // Auto-expire posts after 30 days

