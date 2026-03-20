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
      {/* Type filter */}
      <div className="flex items-center gap-2 overflow-x-auto scroll-fade pb-1">
        <FilterPill
          active={typeFilter === 'all'}
          onClick={() => onTypeChange('all')}
          label="All"
        />
        {POST_TYPES.map((t) => (
          <FilterPill
            key={t.value}
            active={typeFilter === t.value}
            onClick={() => onTypeChange(t.value)}
            label={`${t.label}s`}
            activeColor={t.value === 'need' ? 'bg-[hsl(18,60%,52%)] text-white' : 'bg-[hsl(145,30%,42%)] text-white'}
          />
        ))}
        
        <div className="h-4 w-px bg-[hsl(35,20%,85%)] mx-1 flex-shrink-0" />
        
        {CATEGORIES.map((c) => (
          <FilterPill
            key={c.value}
            active={categoryFilter === c.value}
            onClick={() => onCategoryChange(categoryFilter === c.value ? 'all' : c.value)}
            label={c.label}
            size="small"
          />
        ))}
      </div>

      {isFiltered && (
        <div className="flex items-center justify-between text-xs text-[hsl(25,12%,55%)]">
          <span>
            Showing {filteredCount} of {totalCount}
          </span>
          <button
            onClick={() => { onTypeChange('all'); onCategoryChange('all'); }}
            className="text-[hsl(25,45%,35%)] hover:text-[hsl(25,45%,25%)] font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, label, activeColor, size = 'normal' }: {
  active: boolean;
  onClick: () => void;
  label: string;
  activeColor?: string;
  size?: 'normal' | 'small';
}) {
  const sizeClasses = size === 'small' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  
  return (
    <button
      onClick={onClick}
      className={`${sizeClasses} rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
        active
          ? (activeColor || 'bg-[hsl(25,45%,30%)] text-white')
          : 'bg-white/80 text-[hsl(25,15%,45%)] border border-[hsl(35,20%,87%)] hover:border-[hsl(35,25%,78%)] hover:bg-white'
      }`}
    >
      {label}
    </button>
  );
}
