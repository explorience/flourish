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

export const APP_NAME = 'Flourish';
export const APP_TAGLINE = 'London, Ontario';
export const APP_DESCRIPTION = 'Share what you have. Ask for what you need.';

export const POST_EXPIRY_DAYS = 30; // Auto-expire posts after 30 days

export const LONDON_NEIGHBOURHOODS = [
  { name: 'Downtown', lat: 42.9849, lng: -81.2453 },
  { name: 'Old East Village', lat: 42.9890, lng: -81.2250 },
  { name: 'Old South', lat: 42.9620, lng: -81.2390 },
  { name: 'Wortley Village', lat: 42.9680, lng: -81.2490 },
  { name: 'Old North', lat: 43.0100, lng: -81.2450 },
  { name: 'Byron', lat: 42.9580, lng: -81.2950 },
  { name: 'Hyde Park', lat: 43.0100, lng: -81.3250 },
  { name: 'Masonville', lat: 43.0280, lng: -81.2650 },
  { name: 'Argyle', lat: 42.9820, lng: -81.2530 },
  { name: 'Carling Heights', lat: 42.9900, lng: -81.2650 },
  { name: 'Pond Mills', lat: 42.9450, lng: -81.2250 },
  { name: 'Westminster', lat: 42.9380, lng: -81.2650 },
  { name: 'Lambeth', lat: 42.9180, lng: -81.2650 },
  { name: 'Fanshawe', lat: 43.0200, lng: -81.2400 },
  { name: 'White Hills', lat: 43.0050, lng: -81.2500 },
  { name: 'Medway', lat: 43.0300, lng: -81.2900 },
  { name: 'Stoney Creek', lat: 43.0000, lng: -81.2200 },
  { name: 'Huron Heights', lat: 43.0010, lng: -81.2850 },
  { name: 'Southcrest', lat: 42.9550, lng: -81.2150 },
  { name: 'Whitehills', lat: 43.0050, lng: -81.2750 },
];
