'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  group?: string; // options with the same group are listed under one heading
  hint?: string; // small secondary text (e.g. club code)
  disabled?: boolean;
  disabledReason?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  emptyText?: string;
  className?: string;
}

/**
 * Dropdown with a search box. Keyboard: type to filter, arrows to move, Enter to pick, Esc to close.
 * The list is rendered in a portal so it is never clipped by a scrolling modal.
 */
export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select',
  searchPlaceholder = 'Search…',
  disabled = false,
  invalid = false,
  emptyText = 'No matches',
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState<{ left: number; top: number; width: number; above: boolean } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.label} ${o.group || ''} ${o.hint || ''}`.toLowerCase().includes(q));
  }, [options, query]);

  // flat list of selectable rows (for keyboard navigation)
  const selectable = filtered.filter((o) => !o.disabled);

  const place = () => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const above = spaceBelow < 300 && r.top > spaceBelow;
    setRect({ left: r.left, top: above ? r.top : r.bottom, width: r.width, above });
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const openPanel = () => {
    if (disabled) return;
    place();
    setOpen(true);
    setActive(Math.max(0, selectable.findIndex((o) => o.value === value)));
  };

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  // keep the panel attached to the button while the page or modal scrolls / resizes
  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) close();
    };
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    document.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  // keep the highlighted row visible
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, open, filtered]);

  const pick = (v: string) => {
    onChange(v);
    close();
    buttonRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(0, selectable.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const o = selectable[active];
      if (o) pick(o.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // do not close the surrounding modal
      close();
      buttonRef.current?.focus();
    } else if (e.key === 'Tab') {
      close();
    }
  };

  // group rows while keeping their order
  const rows: { type: 'group'; label: string }[] | any[] = [];
  let lastGroup: string | undefined;
  filtered.forEach((o) => {
    if (o.group && o.group !== lastGroup) {
      (rows as any[]).push({ type: 'group', label: o.group });
      lastGroup = o.group;
    }
    (rows as any[]).push({ type: 'option', option: o });
  });

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openPanel())}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg bg-white text-left font-semibold text-xs outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
          invalid ? 'border-red-400' : 'border-slate-200'
        } ${selected ? 'text-slate-900' : 'text-slate-400'} ${className}`}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
          {selected?.hint && <span className="ml-1 font-normal text-slate-400">({selected.hint})</span>}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            data-searchable-panel
            style={{
              position: 'fixed',
              left: rect.left,
              width: rect.width,
              ...(rect.above ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.top + 4 }),
              zIndex: 10002,
            }}
            className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden text-xs"
            onKeyDown={onKeyDown}
          >
            <div className="p-2 border-b border-slate-100 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div ref={listRef} role="listbox" className="max-h-60 overflow-y-auto py-1">
              {value && (
                <button
                  type="button"
                  onClick={() => pick('')}
                  className="w-full text-left px-3 py-1.5 text-slate-400 hover:bg-slate-50 italic"
                >
                  Clear selection
                </button>
              )}
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-slate-400">{emptyText}</p>
              ) : (
                (rows as any[]).map((row, i) => {
                  if (row.type === 'group') {
                    return (
                      <div key={`g-${row.label}-${i}`} className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {row.label}
                      </div>
                    );
                  }
                  const o: SelectOption = row.option;
                  const isActive = !o.disabled && selectable[active]?.value === o.value;
                  const isSelected = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={o.disabled}
                      data-active={isActive}
                      disabled={o.disabled}
                      onMouseEnter={() => {
                        const idx = selectable.findIndex((s) => s.value === o.value);
                        if (idx >= 0) setActive(idx);
                      }}
                      onClick={() => pick(o.value)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left ${o.group ? 'pl-5' : ''} ${
                        o.disabled ? 'text-slate-300 cursor-not-allowed' : isActive ? 'bg-blue-50 text-blue-900' : 'text-slate-800'
                      }`}
                    >
                      <span className="truncate">
                        {o.label}
                        {o.hint && <span className="ml-1 text-slate-400">({o.hint})</span>}
                        {o.disabled && o.disabledReason && <span className="ml-1 text-[10px] text-slate-400">- {o.disabledReason}</span>}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
