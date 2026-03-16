export const APP_NAME = "Potluck";
export const APP_DESCRIPTION =
  "A lightweight coordination tool for shared events and gatherings.";

export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_BANNER_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const COMMON_EMOJIS = [
  "🍕", "🥗", "🍰", "🥤", "🍷", "🍺", "☕", "🧃",
  "🍞", "🧀", "🍎", "🥕", "🌽", "🍫", "🍪", "🥧",
  "🍲", "🥘", "🍝", "🌮", "🍔", "🥪", "🍣", "🥡",
  "🎂", "🧁", "🍦", "🍩", "🥂", "🫖", "🍵", "🥛",
  "🪴", "🎶", "🎤", "🎸", "🕯️", "🎲", "📷", "🎨",
  "🧊", "🍽️", "🥄", "🔪", "🧂", "🫒", "🥜", "🫘",
  "🪑", "🎪", "🏕️", "🧺", "🗑️", "🧻", "💡", "🔌",
];

export const DEFAULT_POTLUCK_STATUS = "active" as const;
export const DEFAULT_ACCESS_LEVEL = "link_shared" as const;
export const POTLUCKS_PER_PAGE = 12;
