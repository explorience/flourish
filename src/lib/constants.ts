import type { Category, Urgency, PostType } from '@/types/database';

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'items', label: 'Items', emoji: '📦' },
  { value: 'services', label: 'Services', emoji: '🤝' },
  { value: 'skills', label: 'Skills', emoji: '🧠' },
  { value: 'space', label: 'Space', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

export const URGENCIES: { value: Urgency; label: string; color: string }[] = [
  { value: 'flexible', label: 'Flexible', color: 'bg-green-100 text-green-800' },
  { value: 'this_week', label: 'This week', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'today', label: 'Today', color: 'bg-red-100 text-red-800' },
];

export const POST_TYPES: { value: PostType; label: string; emoji: string; color: string }[] = [
  { value: 'need', label: 'Need', emoji: '🙏', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'offer', label: 'Offer', emoji: '💚', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

export const APP_NAME = 'London Mutual Exchange';
export const APP_DESCRIPTION = 'Share what you have. Ask for what you need. A community exchange for London, Ontario.';
