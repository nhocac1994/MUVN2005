'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import Footer from '@/components/Footer';
import {
  getNewsList,
  newsArticleLink,
  type NewsArticleListItem,
} from '@/lib/news-api';

type GuideItem = { slug: string; title: string; hot?: boolean };

export default function GuidePage() {
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [activeSlug, setActiveSlug] = useState('');

  useEffect(() => {
    getNewsList().then((list) => {
      setGuides(
        list.map((n: NewsArticleListItem, i) => ({
          slug: n.slug,
          title: n.title,
          hot: n.type === 'Hot' || i === 0,
        }))
      );
      setActiveSlug(list[0]?.slug ?? '');
    });
  }, []);

  return (
    <div className="we-page">
      <SubPageLayout breadcrumbs={[{ label: 'Hướng Dẫn' }]} title="Danh Sách Hướng Dẫn Chơi Game">
        {guides.length === 0 && (
          <p style={{ textAlign: 'center', padding: 20, color: '#999', fontSize: 14 }}>Không có dữ liệu</p>
        )}
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={newsArticleLink(g.slug)}
            className={`we-guide-item${activeSlug === g.slug ? ' active' : ''}`}
            onClick={() => setActiveSlug(g.slug)}
          >
            {g.hot && <span className="we-guide-badge">Nổi bật</span>}
            {g.title}
          </Link>
        ))}
      </SubPageLayout>
      <Footer />
    </div>
  );
}
