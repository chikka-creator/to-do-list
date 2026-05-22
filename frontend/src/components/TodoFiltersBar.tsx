'use client';

import { Filter, ArrowUpDown } from 'lucide-react';
import type { TodoFilters } from '@/types/todo';

interface TodoFiltersBarProps {
  filters: TodoFilters;
  onChange: (filters: TodoFilters) => void;
}

export default function TodoFiltersBar({ filters, onChange }: TodoFiltersBarProps) {
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Active' },
    { value: 'completed', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: '🔴 High' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'low', label: '🟢 Low' },
  ];

  const sortOptions = [
    { value: 'created_at|desc', label: 'Newest first' },
    { value: 'created_at|asc', label: 'Oldest first' },
    { value: 'due_date|asc', label: 'Due date' },
    { value: 'priority|desc', label: 'Priority' },
    { value: 'title|asc', label: 'A → Z' },
  ];

  const currentSort = `${filters.sort_by || 'created_at'}|${filters.sort_order || 'desc'}`;

  const handleSortChange = (val: string) => {
    const [sort_by, sort_order] = val.split('|') as [TodoFilters['sort_by'], TodoFilters['sort_order']];
    onChange({ ...filters, sort_by, sort_order });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    }}>
      {/* Status tabs */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 3,
        gap: 2,
      }}>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            id={`filter-status-${opt.value}`}
            onClick={() => onChange({ ...filters, status: opt.value as TodoFilters['status'] })}
            style={{
              padding: '6px 14px',
              borderRadius: 7,
              border: 'none',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: filters.status === opt.value || (!filters.status && opt.value === 'all')
                ? 'var(--accent)'
                : 'transparent',
              color: filters.status === opt.value || (!filters.status && opt.value === 'all')
                ? 'white'
                : 'var(--text-secondary)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Priority filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Filter size={14} color="var(--text-muted)" />
        <select
          id="filter-priority"
          className="input-field"
          value={filters.priority || 'all'}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as TodoFilters['priority'] })}
          style={{ padding: '7px 30px 7px 10px', fontSize: 13, width: 'auto' }}
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ArrowUpDown size={14} color="var(--text-muted)" />
        <select
          id="filter-sort"
          className="input-field"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          style={{ padding: '7px 30px 7px 10px', fontSize: 13, width: 'auto' }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
