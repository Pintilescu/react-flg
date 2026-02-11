'use client';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

import { useDebounce } from '../../_hooks/useDebounce';

type Props = {
  environments: { id: string; name: string; slug: string }[];
  currentQuery: string;
  currentEnvironment: string;
  currentStatus: string;
  currentSort: string;
};

type Option = { value: string; label: string };

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative flex-none">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 border border-gray-200 rounded-lg bg-white pl-3 pr-2.5 py-2 text-sm cursor-pointer hover:border-gray-300 transition-colors"
      >
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}:</span>
        <span className="font-medium text-gray-900">{selected?.label}</span>
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                option.value === value
                  ? 'text-emerald-600 font-medium bg-emerald-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FlagFilters({
  environments,
  currentQuery,
  currentEnvironment,
  currentStatus,
  currentSort,
}: Props) {
  const [search, setSearch] = useState(currentQuery);
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    if (!('page' in updates)) {
      params.delete('page');
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    updateParams({ q: debouncedSearch });
  }, [debouncedSearch]);

  const environmentOptions: Option[] = [
    { value: '', label: 'All' },
    ...environments.map((env) => ({ value: env.slug, label: env.name })),
  ];

  const statusOptions: Option[] = [
    { value: '', label: 'All' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
  ];

  const sortOptions: Option[] = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'name', label: 'Name' },
  ];

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-none w-64">
        <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          placeholder="Search flags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      <FilterSelect
        label="Environment"
        value={currentEnvironment}
        options={environmentOptions}
        onChange={(val) => updateParams({ environment: val })}
      />

      <FilterSelect
        label="Status"
        value={currentStatus}
        options={statusOptions}
        onChange={(val) => updateParams({ status: val })}
      />

      <div className="ml-auto">
        <FilterSelect
          label="Sort"
          value={currentSort}
          options={sortOptions}
          onChange={(val) => updateParams({ sort: val })}
        />
      </div>
    </div>
  );
}
