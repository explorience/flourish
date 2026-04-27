'use client';

import { CATEGORIES, POST_TYPES } from '@/lib/constants';
import type { PostType, Category } from '@/types/database';

interface FilterBarProps {
  typeFilter: PostType | 'all';
  categoryFilter: Category | 'all';
  onTypeChange: (type: PostType | 'all') => void;
  onCategoryChange: (category: Category | 'all') => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterBar({ typeFilter, categoryFilter, onTypeChange, onCategoryChange, totalCount, filteredCount }: FilterBarProps) {
  const isFiltered = typeFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div className="space-y-2 animate-fade-up">
      {/* Type filters + category filters on one row, scrolls horizontally if needed */}
      <div className="flex items-center justify-center md:justify-center gap-x-2 md:gap-x-4 py-2 md:py-3 w-full overflow-x-auto no-scrollbar px-2 rounded-full border border-border-card" style={{ scrollbarWidth: 'none' }}>
        {POST_TYPES.map((t) => (
          <Tag
            key={t.value}
            active={typeFilter === t.value}
            onClick={() => onTypeChange(typeFilter === t.value ? 'all' : t.value)}
            label={`${t.label}s`}
            activeColor={t.value === 'need' ? 'var(--need)' : 'var(--offer)'}
          />
        ))}
        <span className="flex-shrink-0 opacity-30 text-xs px-0.5" style={{ color: 'var(--sub)' }}>·</span>
        {CATEGORIES.map((c) => (
          <Tag
            key={c.value}
            active={categoryFilter === c.value}
            onClick={() => onCategoryChange(categoryFilter === c.value ? 'all' : c.value)}
            label={c.label}
          />
        ))}
      </div>

      {isFiltered && (
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sub)' }}>
          <span>{filteredCount} of {totalCount}</span>
          <button
            onClick={() => { onTypeChange('all'); onCategoryChange('all'); }}
            className="font-bold text-sm color-ink hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

function Tag({ active, onClick, label, activeColor }: {
  active: boolean;
  onClick: () => void;
  label: string;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all text-sm rounded-md px-3 py-1.5"
      style={{
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.04em',
        color: active
          ? (activeColor || 'var(--heading)')
          : 'var(--sub)',
        background: active ? activeColor || 'var(--ink)' : 'transparent',
        border: `1px solid ${active ? (activeColor || 'var(--border)') : 'transparent'}`,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {label}
    </button>
  );
}
