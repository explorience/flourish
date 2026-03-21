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
    <div className="space-y-3 animate-fade-up">
      <div className="flex items-center gap-2 overflow-x-auto scroll-fade pb-1">
        <Pill active={typeFilter === 'all'} onClick={() => onTypeChange('all')} label="All" />
        {POST_TYPES.map((t) => (
          <Pill
            key={t.value}
            active={typeFilter === t.value}
            onClick={() => onTypeChange(t.value)}
            label={`${t.label}s`}
            activeColor={t.value === 'need' ? 'var(--need)' : 'var(--offer)'}
          />
        ))}
        <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--border)' }} />
        {CATEGORIES.map((c) => (
          <Pill
            key={c.value}
            active={categoryFilter === c.value}
            onClick={() => onCategoryChange(categoryFilter === c.value ? 'all' : c.value)}
            label={c.label}
            small
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

function Pill({ active, onClick, label, activeColor, small }: {
  active: boolean;
  onClick: () => void;
  label: string;
  activeColor?: string;
  small?: boolean;
}) {
  const size = small ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-xs';
  return (
    <button
      onClick={onClick}
      className={`${size} font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all`}
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: small ? '0.6rem' : '0.65rem',
        background: active ? (activeColor || 'var(--card)') : 'transparent',
        color: active ? (activeColor ? 'var(--card)' : 'var(--ink)') : 'var(--sub)',
        border: `1.5px solid ${active ? (activeColor || 'var(--card)') : 'var(--border)'}`,
      }}
    >
      {label}
    </button>
  );
}
