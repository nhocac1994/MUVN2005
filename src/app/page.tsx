'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PageBackrow from '@/components/PageBackrow';
import TwoColumnLayout from '@/components/TwoColumnLayout';
import Footer from '@/components/Footer';
import HomePinnedNews from '@/components/HomePinnedNews';
import {
  getNewsList,
  getPinnedNewsArticles,
  newsArticleLink,
  formatNewsDateLong,
  type NewsArticle,
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

const ITEMS_PER_PAGE = 5;

export default function Home() {
  const { t } = useI18n();
  const [newsItems, setNewsItems] = useState<NewsArticleListItem[]>([]);
  const [pinnedArticles, setPinnedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsFilter, setNewsFilter] = useState<NewsFilterId>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [list, pinned] = await Promise.all([getNewsList(), getPinnedNewsArticles()]);
      if (cancelled) return;
      setNewsItems(list);
      setPinnedArticles(pinned);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pinnedSlugs = useMemo(
    () => new Set(pinnedArticles.map((a) => a.slug)),
    [pinnedArticles]
  );

  const news = newsItems.map((item) => ({
    title: item.title,
    excerpt: item.excerpt,
    link: newsArticleLink(item.slug),
    type: item.type,
    date: item.publishedAt,
    slug: item.slug,
  }));

  // Danh sách tin thường: bỏ bài index=1 (đã hiện đủ ở cuối trang)
  const listNews = useMemo(
    () => news.filter((item) => !pinnedSlugs.has(item.slug)),
    [news, pinnedSlugs]
  );

  const filteredNews = useMemo(() => {
    if (newsFilter === 'all') return listNews;
    return listNews.filter((item) => item.type.toLowerCase() === newsFilter.toLowerCase());
  }, [listNews, newsFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageNews = filteredNews.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const setFilter = (id: NewsFilterId) => {
    setNewsFilter(id);
    setCurrentPage(1);
  };

  return (
    <div className="we-page">
      <div className="we-home-stage">
        <div className="we-home-backdrop" aria-hidden>
          <PageBackrow />
        </div>
        <div className="we-home-front">
          <TwoColumnLayout onBackrow>
            {loading ? (
              <div className="we-loading-center">
                <div className="we-spinner" />
              </div>
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
                      onClick={() => setFilter(f.id)}
                    >
                      {t(f.key)}
                    </button>
                  ))}
                </div>

                {pageNews.length === 0 ? (
                  <p className="we-news-filter-empty">{t('news.empty')}</p>
                ) : (
                  pageNews.map((item, i) => (
                    <article
                      key={`${item.link}-${i}`}
                      className={`we-news-card t-${item.type.toLowerCase()}`}
                    >
                      <div className="we-news-card-body">
                        <h4>{item.title}</h4>
                        <p>{item.excerpt}</p>
                        <Link href={item.link} className="we-read-more">
                          {t('news.more')} ›
                        </Link>
                      </div>
                      <div className="we-news-footer">
                        Đăng bởi Quản trị viên, {formatNewsDateLong(item.date)}
                      </div>
                    </article>
                  ))
                )}

                {totalPages > 1 && (
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
          </TwoColumnLayout>

          {/* Full ngang — cuối trang — bản tin index = 1 */}
          {!loading && <HomePinnedNews articles={pinnedArticles} />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
