'use client';

import React from 'react';
import { formatNewsDateLong, type NewsArticle } from '@/lib/news-api';
import { renderArticleContent } from '@/lib/simple-markdown';

type Props = {
  articles: NewsArticle[];
};

function normalizeSeasonCopy(text: string): string {
  return text
    .replace(/SEASON\s*2\.0/gi, 'SEASON 1.0')
    .replace(/Season\s*2\.0/gi, 'Season 1.0');
}

/** Cuối trang chủ — bảng tin markdown từ admin, render HTML đẹp (index = 1) */
export default function HomePinnedNews({ articles }: Props) {
  if (!articles.length) return null;

  return (
    <section className="we-home-pinned-full" aria-label="Bản tin ghim trang chủ">
      {articles.map((article) => (
        <article key={article.id || article.slug} className="we-home-pinned-simple">
          <header className="we-home-pinned-head">
            <h2 className="we-home-pinned-title">{normalizeSeasonCopy(article.title)}</h2>
          </header>
          <div
            className="we-home-pinned-text we-article-content we-md-rich"
            dangerouslySetInnerHTML={{
              __html: normalizeSeasonCopy(
                renderArticleContent(article.content, article.contentFormat)
              ),
            }}
          />
          <p className="we-home-pinned-meta">
            {formatNewsDateLong(article.publishedAt)}
          </p>
        </article>
      ))}
    </section>
  );
}
