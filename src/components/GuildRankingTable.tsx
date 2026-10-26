'use client';

import { useState, useEffect, useRef } from 'react';
import type { RankingPagination } from '@/lib/ranking-api';
import RankingPaginationBar, { RANKING_PAGE_SIZE } from '@/components/RankingPagination';
import { useI18n } from '@/lib/i18n';

interface GuildRank {
  guildName: string;
  score: number;
  guildMaster: string;
  memberCount: number;
  guildMark?: string | null;
}

const EMPTY_PAGE: RankingPagination = {
  page: 1,
  limit: RANKING_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

interface GuildRankingTableProps {
  title: string;
  endpoint: string;
  embedded?: boolean;
}

function rankTone(rank: number): string {
  if (rank === 1) return 'is-gold';
  if (rank === 2) return 'is-silver';
  if (rank === 3) return 'is-bronze';
  return '';
}

function GuildLogo({ guild }: { guild: GuildRank }) {
  if (guild.guildMark) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={guild.guildMark}
        alt={`Huy hiệu ${guild.guildName}`}
        width={64}
        height={64}
        className="we-guild-img-mark"
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }

  const letter = (guild.guildName || '?').charAt(0).toUpperCase();
  return <span className="we-guild-img-fallback">{letter}</span>;
}

export default function GuildRankingTable({ endpoint }: GuildRankingTableProps) {
  const { t } = useI18n();
  const [guilds, setGuilds] = useState<GuildRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<RankingPagination | null>(null);
  const [dataSource, setDataSource] = useState<'database' | 'fallback' | 'cache' | null>(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    setPage(1);
  }, [endpoint]);

  useEffect(() => {
    const requestId = ++fetchIdRef.current;

    (async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rankings/${endpoint}?page=${page}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        if (requestId !== fetchIdRef.current) return;

        if (data.success && Array.isArray(data.data)) {
          const metaSource = data.meta?.source as string | undefined;
          if (metaSource === 'database') setDataSource('database');
          else if (data.message?.includes('cache')) setDataSource('cache');
          else if (metaSource === 'fallback') setDataSource('fallback');
          else setDataSource('database');

          setGuilds(
            data.data.map((g: Record<string, unknown>) => ({
              guildName: String(g.guildName ?? g.G_Name ?? ''),
              score: Number(g.score ?? g.G_Score ?? 0),
              guildMaster: String(g.guildMaster ?? g.G_Master ?? ''),
              memberCount: Number(g.memberCount ?? g.G_Count ?? 0),
              guildMark: (g.guildMark ?? g.G_Mark ?? null) as string | null,
            }))
          );

          if (data.pagination) {
            setPagination({
              page: Number(data.pagination.page) || page,
              limit: Number(data.pagination.limit) || RANKING_PAGE_SIZE,
              total: Number(data.pagination.total) || data.data.length,
              totalPages: Number(data.pagination.totalPages) || 1,
            });
          } else {
            setPagination({
              page: 1,
              limit: data.data.length || RANKING_PAGE_SIZE,
              total: data.data.length,
              totalPages: 1,
            });
          }
        } else {
          setGuilds([]);
          setDataSource('fallback');
          setPagination(EMPTY_PAGE);
        }
      } catch {
        if (requestId !== fetchIdRef.current) return;
        setGuilds([]);
        setDataSource('fallback');
        setPagination(EMPTY_PAGE);
      } finally {
        if (requestId === fetchIdRef.current) setLoading(false);
      }
    })();
  }, [endpoint, page]);

  const totalPages = pagination?.totalPages ?? 1;
  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const pageLimit = pagination?.limit || RANKING_PAGE_SIZE;

  if (loading) {
    return (
      <div className="we-loading-center">
        <div className="we-spinner" />
      </div>
    );
  }

  return (
    <div>
      {dataSource === 'cache' && (
        <p className="we-rank-hint we-rank-hint--warn">{t('rank.cache')}</p>
      )}

      <div className="we-guild-img-list" role="list">
        <div className="we-guild-img-head" aria-hidden>
          <span className="we-guild-img-h-rank">#</span>
          <span className="we-guild-img-h-logo">{t('table.guildLogo')}</span>
          <span className="we-guild-img-h-guild">{t('table.guildName')}</span>
          <span className="we-guild-img-h-master">{t('table.guildMaster')}</span>
          <span className="we-guild-img-h-members">{t('table.members')}</span>
          <span className="we-guild-img-h-score">{t('table.score')}</span>
        </div>

        {guilds.map((guild, index) => {
          const rank = (safePage - 1) * pageLimit + index + 1;
          return (
            <div
              key={`${guild.guildName}-${rank}`}
              role="listitem"
              className={`we-guild-img-row ${rankTone(rank)}`}
            >
              <span className={`we-rank-img-rank ${rankTone(rank)}`}>{rank}</span>
              <span className="we-guild-img-logo">
                <GuildLogo guild={guild} />
              </span>
              <span className="we-guild-img-nameblock">
                <span className="we-guild-img-name">{guild.guildName || '—'}</span>
                <span className="we-guild-img-master-mobile">
                  {t('table.masterLine', { name: guild.guildMaster || '—' })}
                </span>
              </span>
              <span className="we-guild-img-master">{guild.guildMaster || '—'}</span>
              <span className="we-guild-img-members" data-prefix={`${t('table.membersShort')} `}>
                {Number(guild.memberCount || 0).toLocaleString()}
              </span>
              <span className="we-guild-img-score" data-prefix={`${t('table.score')} `}>
                {Number(guild.score || 0).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {guilds.length === 0 && (
        <p style={{ textAlign: 'center', padding: 20, color: '#999', fontSize: 14 }}>
          {t('rank.emptyGuild')}
        </p>
      )}

      <RankingPaginationBar
        page={safePage}
        totalPages={totalPages}
        onPageChange={(p) => {
          setPage(p);
          if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
