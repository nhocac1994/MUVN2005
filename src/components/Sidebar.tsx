'use client';

import React, { useState, useEffect } from 'react';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, getEventsConfig, type SiteConfig, type EventConfig } from '@/lib/config-api';
import { useI18n } from '@/lib/i18n';

/** Tên hiển thị gọn (bỏ ngoặc vuông) */
function eventDisplayName(name: string): string {
  return name.replace(/[[\]]/g, '').trim();
}

function scheduleMatches(ev: EventConfig, hour: number, minute: number): boolean {
  const s = ev.schedule;
  if (s.type === 'hourly') {
    const interval = s.interval || 2;
    const startMinute = s.startMinute || 0;
    if (minute !== startMinute) return false;
    return hour % interval === (startMinute === 0 ? 0 : 1);
  }
  if (s.type === 'specific') {
    return (s.times || []).some((t) => {
      const [h, m] = t.split(':').map(Number);
      return h === hour && m === minute;
    });
  }
  return false;
}

function computeEvent(ev: EventConfig, now: Date): { seconds: number; running: boolean } {
  const h = now.getHours();
  const m = now.getMinutes();
  const sec = now.getSeconds();
  const duration = ev.schedule.duration || 10;

  if (scheduleMatches(ev, h, m) && sec < duration * 60) {
    return { seconds: duration * 60 - sec, running: true };
  }

  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
    const startHour = dayOffset === 0 ? h : 0;
    for (let hour = startHour; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        if (!scheduleMatches(ev, hour, minute)) continue;
        const t = new Date(now);
        t.setDate(t.getDate() + dayOffset);
        t.setHours(hour, minute, 0, 0);
        const diff = Math.floor((t.getTime() - now.getTime()) / 1000);
        if (diff > 0) return { seconds: diff, running: false };
      }
    }
  }
  return { seconds: 0, running: false };
}

function formatCountdown(seconds: number): string {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = Math.floor(seconds % 60);
  return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

function formatCount(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString('vi-VN');
}

export default function Sidebar() {
  const { t } = useI18n();
  const [config, setConfig] = useState<SiteConfig>(siteConfigStatic as unknown as SiteConfig);
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    getSiteConfig().then((c) => { if (c) setConfig({ ...siteConfigStatic, ...c } as SiteConfig); });
  }, []);

  useEffect(() => {
    getEventsConfig().then((evs) => { if (evs && evs.length > 0) setEvents(evs); });
  }, []);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const staticCfg = siteConfigStatic as {
    expRate?: string;
    dropRate?: string;
    serverVersion?: string;
    statsBoost?: {
      totalAccounts?: number;
      totalCharacters?: number;
      totalGuilds?: number;
      onlinePlayers?: number;
    };
  };

  const version =
    config?.serverInfo?.version || config?.serverVersion || staticCfg.serverVersion || 'Season 1.0';
  const expRate =
    config?.serverInfo?.expRate || config.expRate || staticCfg.expRate || 'x100';
  const dropRate =
    config?.serverInfo?.dropRate || config.dropRate || staticCfg.dropRate || 'x99';

  const boost = config.statsBoost || staticCfg.statsBoost;
  const accountCount = boost?.totalAccounts;
  const characterCount = boost?.totalCharacters;
  const guildCount = boost?.totalGuilds;
  const onlineCount = boost?.onlinePlayers;

  return (
    <aside className="we-sidebar-col">
      {/* Thông tin server — lấy từ site-config (serverInfo + statsBoost) */}
      <div className="we-box">
        <div className="we-box-head">{t('side.server')}</div>
        <div className="we-box-body">
          <table className="we-info-table">
            <tbody>
              <tr>
                <td>{t('side.version')}</td>
                <td className="we-val-orange">{version}</td>
              </tr>
              <tr>
                <td>{t('side.exp')}</td>
                <td className="we-val-blue">{expRate}</td>
              </tr>
              <tr>
                <td>{t('side.drop')}</td>
                <td>{dropRate}</td>
              </tr>
              <tr>
                <td>{t('side.accounts')}</td>
                <td>{formatCount(accountCount)}</td>
              </tr>
              <tr>
                <td>{t('side.chars')}</td>
                <td>{formatCount(characterCount)}</td>
              </tr>
              <tr>
                <td>{t('side.guilds')}</td>
                <td>{formatCount(guildCount)}</td>
              </tr>
              <tr>
                <td>{t('side.online')}</td>
                <td className="we-val-green">{formatCount(onlineCount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Time */}
      {events.length > 0 && (
        <div className="we-box">
          <div className="we-box-head">{t('side.events')}</div>
          <div className="we-box-body">
            <table className="we-event-table">
              <thead>
                <tr>
                  <th>{t('side.event')}</th>
                  <th>{t('side.time')}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => {
                  const state = now ? computeEvent(ev, now) : null;
                  const timeStr = !state
                    ? '--:--:--'
                    : state.running
                      ? t('side.running')
                      : formatCountdown(state.seconds);
                  const soon = !!state && !state.running && state.seconds <= 300;
                  return (
                    <tr key={ev.id}>
                      <td>{eventDisplayName(ev.name)}</td>
                      <td
                        className={`we-event-time${state?.running ? ' is-running' : ''}${soon ? ' is-soon' : ''}`}
                      >
                        {timeStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </aside>
  );
}
