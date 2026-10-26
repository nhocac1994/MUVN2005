'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import siteConfig from '@/config/site.config.json';
import { getSiteConfig } from '@/lib/config-api';
import { useI18n, type MessageKey } from '@/lib/i18n';

const navLinks: { key: MessageKey; href: string }[] = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.download', href: '/download' },
  { key: 'nav.news', href: '/news' },
  { key: 'nav.rankings', href: '/rankings' },
  { key: 'nav.register', href: '/register' },
  { key: 'nav.login', href: '/login' },
];

const MOBILE_NAV_MQ = '(max-width: 900px)';
const SITE_NAME = siteConfig.websiteName || siteConfig.serverName || 'Mu Online';
const SITE_TAGLINE = siteConfig.serverVersion || 'Season 1.0';
const STATIC_ZALO =
  (siteConfig as { linkZalo?: string }).linkZalo ||
  '';

export default function Header() {
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [zaloLink, setZaloLink] = useState(STATIC_ZALO);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    getSiteConfig().then((c) => {
      const link = c?.linkZalo || c?.socialMedia?.zalo || STATIC_ZALO;
      if (link) setZaloLink(link);
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_NAV_MQ);
    const update = () => setIsMobileNav(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_NAV_MQ);
    const syncBodyScroll = () => {
      const lock = mq.matches && menuOpen;
      document.body.style.overflow = lock ? 'hidden' : '';
    };
    syncBodyScroll();
    mq.addEventListener('change', syncBodyScroll);
    return () => {
      document.body.style.overflow = '';
      mq.removeEventListener('change', syncBodyScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || !isMobileNav) return;

    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      const header = document.querySelector('.we-nav');
      if (header && !header.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('touchstart', closeOnOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('touchstart', closeOnOutside);
    };
  }, [menuOpen, isMobileNav]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const showNavLinks = !isMobileNav || menuOpen;

  return (
    <header className={`we-nav${isMobileNav ? ' we-nav--mobile' : ''}${menuOpen ? ' we-nav--open' : ''}`}>
      <div className="we-nav-shell">
        <div className="we-nav-bar">
          <Link href="/" className="we-nav-brand" onClick={() => setMenuOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/favicon-96x96.png"
              alt=""
              className="we-nav-logo"
              width={36}
              height={36}
              decoding="async"
            />
            <span className="we-nav-brand-text">
              <span className="we-nav-brand-name">{SITE_NAME}</span>
              <span className="we-nav-brand-tag">{SITE_TAGLINE}</span>
            </span>
          </Link>
          {isMobileNav && (
            <button
              type="button"
              className="we-nav-toggle"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? t('nav.close') : t('nav.menu')}
              aria-expanded={menuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          )}
        </div>
        {showNavLinks && (
          <nav className={`we-nav-inner${menuOpen ? ' open' : ''}`} aria-label="Menu chính">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`we-nav-link${isActive(item.href) ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            {zaloLink ? (
              <a
                href={zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="we-nav-link we-nav-zalo"
                onClick={() => setMenuOpen(false)}
                title={t('nav.zalo')}
              >
                <Image src="/Zalo-icon.webp" alt="" width={18} height={18} className="we-nav-zalo-icon" />
                {t('nav.zalo')}
              </a>
            ) : null}
            <div className="we-lang-switch" role="group" aria-label="Language">
              <button
                type="button"
                className={lang === 'vi' ? 'is-active' : ''}
                onClick={() => setLang('vi')}
              >
                VI
              </button>
              <button
                type="button"
                className={lang === 'en' ? 'is-active' : ''}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
