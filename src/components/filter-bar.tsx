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
      {/* Type filters + category filters on one row on mobile */}
      <div className="flex items-center justify-center gap-x-4 gap-y-2 flex-wrap pb-1">
        {POST_TYPES.map((t) => (
          <Tag
            key={t.value}
            active={typeFilter === t.value}
            onClick={() => onTypeChange(typeFilter === t.value ? 'all' : t.value)}
            label={`${t.label}s`}
            activeColor={t.value === 'need' ? 'var(--need)' : 'var(--offer)'}
          />
        ))}
        <div className="w-px h-3 flex-shrink-0" style={{ background: 'var(--border)' }} />
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
            className="font-medium hover:underline"
            style={{ color: 'var(--heading)' }}
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
      className="font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.65rem',
        letterSpacing: '0.08em',
        color: active
          ? (activeColor || 'var(--heading)')
          : 'var(--sub)',
        opacity: 1,
        textDecoration: active ? 'underline' : 'none',
        textUnderlineOffset: '3px',
        background: 'transparent',
        border: 'none',
        padding: '2px 0',
      }}
    >
      {label}
    </button>
  );
}
