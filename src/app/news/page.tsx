'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import Footer from '@/components/Footer';
import NewsSearchBar, { matchNews } from '@/components/NewsSearchBar';
import {
  getNewsList,
  formatNewsDateLong,
  newsArticleLink,
  type NewsArticleListItem,
} from '@/lib/news-api';
import { useI18n, type MessageKey } from '@/lib/i18n';

const NEWS_FILTERS = [
  { id: 'all', key: 'news.all' },
  { id: 'Notice', key: 'news.notice' },
  { id: 'Event', key: 'news.event' },
  { id: 'Update', key: 'news.update' },
  { id: 'Hot', key: 'news.hot' },
] as const satisfies readonly { id: string; key: MessageKey }[];

type NewsFilterId = (typeof NEWS_FILTERS)[number]['id'];

type NewsRow = {
  type: string;
  title: string;
  date: string;
  link: string;
  slug: string;
  excerpt: string;
};

const ITEMS_PER_PAGE = 5;

export default function NewsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsFilter, setNewsFilter] = useState<NewsFilterId>('all');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, newsFilter]);

  useEffect(() => {
    getNewsList().then((list) => {
      setItems(
        list.map((n: NewsArticleListItem) => ({
          type: n.type,
          title: n.title,
          date: n.publishedAt,
          link: newsArticleLink(n.slug),
          slug: n.slug,
          excerpt: n.excerpt,
        }))
      );
      setLoading(false);
    });
  }, []);

  const filteredItems = useMemo(() => {
    let list = items;
    if (newsFilter !== 'all') {
      list = list.filter((item) => item.type.toLowerCase() === newsFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      list = list.filter((item) => matchNews(item, searchQuery));
    }
    return list;
  }, [items, newsFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filteredItems.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <div className="we-page">
      <SubPageLayout breadcrumbs={[{ label: t('news.title') }]} title={t('news.title')} showSidebar={false}>
        {loading ? (
          <div className="we-loading-center"><div className="we-spinner" /></div>
        ) : (
          <>
            <div className="we-news-filters" role="tablist" aria-label={t('news.filter')}>
              {NEWS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={newsFilter === f.id}
                  className={`we-news-filter-btn t-${f.id.toLowerCase()}${newsFilter === f.id ? ' active' : ''}`}
                  onClick={() => setNewsFilter(f.id)}
                >
                  {t(f.key)}
                </button>
              ))}
            </div>

            <NewsSearchBar items={items} onQueryChange={setSearchQuery} />

            {pageItems.length === 0 ? (
              <p className="we-news-filter-empty">
                {searchQuery.trim()
                  ? t('news.noMatch', { q: searchQuery })
                  : t('news.empty')}
              </p>
            ) : (
              pageItems.map((item) => (
              <article key={item.link} className={`we-news-card t-${item.type.toLowerCase()}`}>
                <div className="we-news-card-body">
                  <h4>{item.title}</h4>
                  <p>{item.excerpt}</p>
                  <Link href={item.link} className="we-read-more">{t('news.more')} ›</Link>
                </div>
                <div className="we-news-footer">
                  Đăng bởi Quản trị viên, {formatNewsDateLong(item.date)}
                </div>
              </article>
              ))
            )}

            {pageItems.length > 0 && totalPages > 1 && (
              <div className="we-pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`we-page-btn${safePage === page ? ' active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </SubPageLayout>
      <Footer />
    </div>
  );
}
