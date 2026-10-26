'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { newsTypeLabel } from '@/lib/news-labels';
import { useI18n } from '@/lib/i18n';

export type NewsSearchItem = {
  type: string;
  title: string;
  excerpt: string;
  link: string;
  slug: string;
  date: string;
};

type NewsSearchBarProps = {
  items: NewsSearchItem[];
  onQueryChange?: (query: string) => void;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchNews(item: NewsSearchItem, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize(`${item.title} ${item.excerpt} ${item.type}`);
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export default function NewsSearchBar({ items, onQueryChange }: NewsSearchBarProps) {
  const { lang, t } = useI18n();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (!q) return items.slice(0, 8);
    return items.filter((item) => matchNews(item, q)).slice(0, 8);
  }, [items, query]);

  useEffect(() => {
    onQueryChange?.(query);
  }, [query, onQueryChange]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      window.location.href = suggestions[activeIndex].link;
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="we-news-search" ref={wrapRef}>
      <div className="we-news-search-field">
        <input
          type="search"
          className="we-news-search-input"
          placeholder={t('news.searchPh')}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Tìm kiếm bản tin"
          aria-expanded={open && suggestions.length > 0}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="we-news-search-clear"
            onClick={() => {
              setQuery('');
              setOpen(false);
              setActiveIndex(-1);
            }}
            aria-label="Xóa tìm kiếm"
          >
            ✕
          </button>
        )}
      </div>

      {open && (suggestions.length > 0 || query.trim()) && (
        <div className="we-news-search-suggest" role="listbox">
          {!query.trim() && suggestions.length > 0 && (
            <p className="we-news-search-hint">Gợi ý bản tin — gõ để lọc nhanh</p>
          )}
          {query.trim() && suggestions.length === 0 ? (
            <p className="we-news-search-empty">{t('news.searchEmpty')}</p>
          ) : (
            suggestions.map((item, i) => (
              <Link
                key={item.link}
                href={item.link}
                className={`we-news-search-item${i === activeIndex ? ' active' : ''}`}
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => {
                  setOpen(false);
                  setActiveIndex(-1);
                }}
              >
                <span className={`we-news-badge we-news-badge--sm t-${item.type.toLowerCase()}`}>
                  {newsTypeLabel(item.type, lang)}
                </span>
                <span className="we-news-search-item-title">{item.title}</span>
                <span className="we-news-search-item-excerpt">{item.excerpt}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export { matchNews };
