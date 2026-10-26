'use client';

import React, { useState, useEffect } from 'react';
import SubPageLayout from '@/components/SubPageLayout';
import Footer from '@/components/Footer';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, getDownloadConfig, type SiteConfig, type DownloadLinks } from '@/lib/config-api';
import { useI18n } from '@/lib/i18n';

/** Microsoft Visual C++ Redistributable 2015–2022 (x86 — thường dùng cho Mu classic) */
const VC_REDIST_X86 = 'https://aka.ms/vs/17/release/vc_redist.x86.exe';
const VC_REDIST_X64 = 'https://aka.ms/vs/17/release/vc_redist.x64.exe';

function youtubeEmbedUrl(raw?: string): string | null {
  if (!raw?.trim()) return null;
  const u = raw.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = u.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  if (/^https?:\/\//i.test(u) && u.includes('youtube.com/embed/')) return u;
  return null;
}

export default function DownloadPage() {
  const { t } = useI18n();
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(siteConfigStatic as unknown as SiteConfig);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLinks | null>(null);

  useEffect(() => {
    getSiteConfig().then((c) => {
      if (c) setSiteConfig({ ...siteConfigStatic, ...c } as SiteConfig);
    });
    getDownloadConfig().then((l) => {
      if (l) setDownloadLinks(l);
    });
  }, []);

  const config = siteConfig;
  const links = downloadLinks || config?.downloadLinks;
  const clientVersion = links?.clientVersion || 'v1.0';
  const serverName = config?.serverName || config?.nameGame || 'Mu Online';
  const displayName = serverName.replace(/\.(net|com|vn|org)$/i, '');
  const fileSize = links?.fileSize || '397 MB';
  const videoEmbed = youtubeEmbedUrl(links?.guideVideo);

  const clientDownloads = [
    {
      title: t('dl.viTitle', { name: displayName, ver: clientVersion }),
      subtitle: t('dl.viSub'),
      size: fileSize,
      href: links?.mediafire || '#',
    },
  ];

  const supportDownloads = [
    {
      title: 'Microsoft Visual C++ 2015–2022 (x86)',
      subtitle: 'Bắt buộc nếu máy báo thiếu DLL / không chạy được Launcher',
      size: '~14 MB',
      href: VC_REDIST_X86,
    },
    {
      title: 'Microsoft Visual C++ 2015–2022 (x64)',
      subtitle: 'Bản 64-bit — cài thêm nếu máy Windows 64-bit',
      size: '~25 MB',
      href: VC_REDIST_X64,
    },
    {
      title: 'Phần mềm hỗ trợ UltraViewer',
      subtitle: 'Hỗ trợ từ xa khi cài đặt game',
      size: '4 MB',
      href: 'https://www.ultraviewer.net/vi/download.html',
    },
    {
      title: 'Phần mềm hỗ trợ giải nén file',
      subtitle: 'WinRAR / 7-Zip',
      size: '4 MB',
      href: 'https://www.7-zip.org/download.html',
    },
  ];

  return (
    <div className="we-page">
      <SubPageLayout breadcrumbs={[{ label: t('dl.title') }]} title={t('dl.title')}>
        <div className="we-download-guide">
          <h3>{t('dl.guide')}</h3>
          <ol>
            <li>{t('dl.step1')}</li>
            <li>{t('dl.step2')}</li>
            <li>{t('dl.step3')}</li>
            <li>{t('dl.step4')}</li>
          </ol>
          <p className="we-download-guide-note">
            <strong>{t('dl.noteLabel')}</strong> {t('dl.note')}
          </p>
        </div>

        <div className="we-box">
          <div className="we-box-head">{t('dl.viHead')}</div>
          <div className="we-box-body" style={{ padding: 0 }}>
            {clientDownloads.map((item) => (
              <div key={item.title} className="we-download-row">
                <div className="we-download-info">
                  <h4>{item.title}</h4>
                  <p>{item.subtitle}</p>
                </div>
                <span className="we-download-size">{item.size}</span>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="we-btn we-btn-download"
                >
                  {t('dl.get')}
                </a>
              </div>
            ))}
          </div>
        </div>

        {links?.mega ? (
          <div className="we-box">
            <div className="we-box-head">{t('dl.enHead')}</div>
            <div className="we-box-body" style={{ padding: 0 }}>
              <div className="we-download-row">
                <div className="we-download-info">
                  <h4>
                    {t('dl.enTitle', { name: displayName, ver: clientVersion })}
                  </h4>
                  <p>{t('dl.enSub')}</p>
                </div>
                <span className="we-download-size">{fileSize}</span>
                <a
                  href={links.mega}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="we-btn we-btn-download"
                >
                  {t('dl.get')}
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <div className="we-box">
          <div className="we-box-head">{t('dl.support')}</div>
          <div className="we-box-body" style={{ padding: 0 }}>
            {supportDownloads.map((item) => (
              <div key={item.title} className="we-download-row">
                <div className="we-download-info">
                  <h4>{item.title}</h4>
                  <p>{item.subtitle}</p>
                </div>
                <span className="we-download-size">{item.size}</span>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="we-btn we-btn-download"
                >
                  {t('dl.get')}
                </a>
              </div>
            ))}
          </div>
        </div>

        {videoEmbed ? (
          <div className="we-box">
            <div className="we-box-head">{t('dl.video')}</div>
            <div className="we-box-body">
              <div className="we-video-wrap">
                <iframe
                  src={videoEmbed}
                  title="Hướng dẫn cài đặt game"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {links?.guideVideo ? (
                <p className="we-download-video-link">
                  <a href={links.guideVideo} target="_blank" rel="noopener noreferrer">
                    {t('dl.youtube')}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        ) : links?.guideVideo ? (
          <div className="we-box">
            <div className="we-box-head">{t('dl.video')}</div>
            <div className="we-box-body">
              <a
                href={links.guideVideo}
                target="_blank"
                rel="noopener noreferrer"
                className="we-btn we-btn-download"
              >
                {t('dl.watch')}
              </a>
            </div>
          </div>
        ) : null}
      </SubPageLayout>
      <Footer />
    </div>
  );
}
