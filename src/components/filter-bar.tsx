'use client';

import { CATEGORIES, POST_TYPES } from '@/lib/constants';
import type { PostType, Category } from '@/types/database';

interface FilterBarProps {
  typeFilter: PostType | 'all';
  categoryFilter: Category | 'all';
  onTypeChange: (type: PostType | 'all') => void;
  onCategoryChange: (category: Category | 'all') => void;
}

export function FilterBar({ typeFilter, categoryFilter, onTypeChange, onCategoryChange }: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onTypeChange('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            typeFilter === 'all'
              ? 'bg-amber-800 text-white'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          All
        </button>
        {POST_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => onTypeChange(t.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              typeFilter === t.value
                ? 'bg-amber-800 text-white'
                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            {t.emoji} {t.label}s
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            categoryFilter === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => onCategoryChange(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === c.value
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
