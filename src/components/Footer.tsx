'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, type SiteConfig } from '@/lib/config-api';
import { useI18n, type MessageKey } from '@/lib/i18n';

const FOOTER_LINKS: { key: MessageKey; href: string }[] = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.download', href: '/download' },
  { key: 'nav.news', href: '/news' },
  { key: 'nav.rankings', href: '/rankings' },
  { key: 'nav.register', href: '/register' },
  { key: 'nav.login', href: '/login' },
];

export default function Footer() {
  const { t } = useI18n();
  const [config, setConfig] = useState<SiteConfig>(siteConfigStatic as unknown as SiteConfig);

  useEffect(() => {
    getSiteConfig().then((c) => {
      if (c) setConfig({ ...siteConfigStatic, ...c } as SiteConfig);
    });
  }, []);

  const brand =
    config?.websiteName || config?.serverName || config?.nameGame || 'MUVIETNAM2005.COM';
  const year = new Date().getFullYear();

  const facebook = config?.linkFacebook || config?.socialMedia?.facebook || '';
  const tiktok = config?.linkTikTok || config?.socialMedia?.tiktok || '';
  const zalo = config?.linkZalo || config?.socialMedia?.zalo || '';

  return (
    <footer className="we-footer">
      <div className="we-footer-inner">
        <nav className="we-footer-links" aria-label="Liên kết chân trang">
          {FOOTER_LINKS.map((item, i) => (
            <React.Fragment key={item.href}>
              {i > 0 && <span className="we-footer-sep" aria-hidden>|</span>}
              <Link href={item.href}>{t(item.key)}</Link>
            </React.Fragment>
          ))}
        </nav>

        <div className="we-footer-divider" />

        <div className="we-footer-bottom">
          <div className="we-footer-legal">
            <p className="we-footer-copy">
              {brand} © {year}, {t('footer.rights')}
            </p>
            <p className="we-footer-copy we-footer-copy--muted">
              {t('footer.disclaimer')}
            </p>
            <p className="we-footer-notice">{t('footer.notice')}</p>
            <p className="we-footer-powered">
              {t('footer.powered')}{' '}
              <a href="https://mumges.org" target="_blank" rel="noopener noreferrer">
                mumges.org
              </a>
            </p>
          </div>

          <div className="we-footer-social">
            {facebook ? (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="we-footer-social-btn we-footer-social-btn--fb"
                title="Facebook"
                aria-label="Facebook"
              >
                <Image src="/facebook-logo.webp" alt="" width={28} height={28} />
              </a>
            ) : null}
            {tiktok ? (
              <a
                href={tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="we-footer-social-btn we-footer-social-btn--tt"
                title="TikTok"
                aria-label="TikTok"
              >
                <Image src="/tiktok-logo.webp" alt="" width={28} height={28} />
              </a>
            ) : null}
            {zalo ? (
              <a
                href={zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="we-footer-social-btn we-footer-social-btn--zalo"
                title="Nhóm Zalo"
                aria-label="Nhóm Zalo"
              >
                <Image src="/Zalo-icon.webp" alt="" width={28} height={28} />
                <span>Nhóm Zalo</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
