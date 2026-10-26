'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SubPageLayout from '@/components/SubPageLayout';
import Footer from '@/components/Footer';
import { getNewsArticle, formatNewsDateLong } from '@/lib/news-api';
import { renderArticleContent } from '@/lib/simple-markdown';

export default function NewsArticlePage() {
  const params = useParams();
  const slug = String(params.slug || '');
  const [article, setArticle] = useState<Awaited<ReturnType<typeof getNewsArticle>>>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getNewsArticle(slug).then((data) => {
      if (data) setArticle(data);
      else setNotFound(true);
      setLoading(false);
    });
  }, [slug]);

  return (
    <div className="we-page">
      <SubPageLayout
        breadcrumbs={[
          { label: 'Bản tin', href: '/news' },
          { label: article?.title || slug || '...' },
        ]}
      >
        {loading && (
          <div className="we-loading-center"><div className="we-spinner" /></div>
        )}

        {notFound && !loading && (
          <div className="we-box">
            <div className="we-box-body" style={{ textAlign: 'center' }}>
              <p style={{ color: '#777', marginBottom: 12 }}>Không có dữ liệu</p>
              <Link href="/news" className="we-read-more">← Quay lại bản tin</Link>
            </div>
          </div>
        )}

        {article && (
          <article className="we-box">
            <div className="we-box-head">{article.title}</div>
            <div className="we-box-body">
              <p style={{ fontSize: 12, color: '#999', marginBottom: 15 }}>
                {article.type} · {formatNewsDateLong(article.publishedAt)}
              </p>
              <div
                className="we-article-content we-md-rich"
                dangerouslySetInnerHTML={{
                  __html: renderArticleContent(article.content, article.contentFormat),
                }}
              />
            </div>
          </article>
        )}
      </SubPageLayout>
      <Footer />
    </div>
  );
}
