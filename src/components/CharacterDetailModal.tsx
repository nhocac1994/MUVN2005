'use client';

import React, { useEffect } from 'react';
import ClassIcon from '@/components/ClassIcon';
import { useI18n } from '@/lib/i18n';

export type CharacterProfile = {
  name: string;
  class: number;
  className: string;
  level: number;
  reset: number;
  /** Tổng điểm = Str+Agi+Vit+Ene+Cmd+điểm dư */
  points: number | null;
  kills: number | null;
  isOnline: boolean;
};

type CharacterDetailModalProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  profile: CharacterProfile | null;
  onClose: () => void;
};

function formatStat(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('vi-VN');
}

export default function CharacterDetailModal({
  open,
  loading,
  error,
  profile,
  onClose,
}: CharacterDetailModalProps) {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="we-dash-modal-backdrop" onClick={onClose}>
      <div
        className="we-dash-modal we-char-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="char-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="char-detail-title">{t('char.title')}</h3>

        {loading && (
          <div className="we-loading-center" style={{ padding: '24px 0' }}>
            <div className="we-spinner" />
          </div>
        )}

        {!loading && error && <p className="we-char-detail-error">{error}</p>}

        {!loading && profile && (
          <div className="we-char-detail-profile">
            <div className="we-char-detail-portrait">
              <ClassIcon classId={profile.class} size={120} className="we-char-detail-portrait-img" />
            </div>

            <div className="we-char-detail-info">
              <p className="we-char-detail-name">{profile.name}</p>
              <p className="we-char-detail-class">{profile.className}</p>

              <dl className="we-char-detail-list">
                <div className="we-char-detail-row">
                  <dt>{t('char.level')}</dt>
                  <dd>{formatStat(profile.level)}</dd>
                </div>
                <div className="we-char-detail-row">
                  <dt>{t('char.resets')}</dt>
                  <dd>{formatStat(profile.reset)}</dd>
                </div>
                <div className="we-char-detail-row">
                  <dt>{t('char.points')}</dt>
                  <dd>{formatStat(profile.points)}</dd>
                </div>
                <div className="we-char-detail-row">
                  <dt>{t('char.kills')}</dt>
                  <dd>{formatStat(profile.kills)}</dd>
                </div>
                <div className="we-char-detail-row">
                  <dt>{t('char.status')}</dt>
                  <dd
                    className={
                      profile.isOnline
                        ? 'we-char-detail-online'
                        : 'we-char-detail-offline'
                    }
                  >
                    {profile.isOnline ? t('char.online') : t('char.offline')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        <button type="button" onClick={onClose} className="we-btn we-btn-block" style={{ marginTop: 14 }}>
          {t('char.close')}
        </button>
      </div>
    </div>
  );
}
