'use client';

import { useState, useEffect, useRef } from 'react';
import type { CharacterRankingRow, RankingPagination } from '@/lib/ranking-api';
import CharacterDetailModal, { type CharacterProfile } from '@/components/CharacterDetailModal';
import RankingPaginationBar, { RANKING_PAGE_SIZE } from '@/components/RankingPagination';
import RankingImageList from '@/components/RankingImageList';
import { useI18n } from '@/lib/i18n';

interface RankingTableProps {
  title: string;
  endpoint: string;
  scoreLabel?: string;
  embedded?: boolean;
}

const EMPTY_PAGE: RankingPagination = {
  page: 1,
  limit: RANKING_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

function mapRows(data: Record<string, unknown>[]): CharacterRankingRow[] {
  return data.map((char) => ({
    account: String(char.account ?? char.AccountID ?? ''),
    character: String(char.character ?? char.Name ?? ''),
    class: Number(char.class ?? char.Class ?? 0),
    score: Number(char.score ?? char.Score ?? char.resets ?? char.ResetCount ?? 0),
    level:
      char.level != null
        ? Number(char.level)
        : char.cLevel != null
          ? Number(char.cLevel)
          : null,
    isOnline: (char.isOnline ?? char.IsOnline ?? 0) as number | boolean,
  }));
}

export default function RankingTable({ endpoint, scoreLabel = 'Reset' }: RankingTableProps) {
  const { t } = useI18n();
  const [characters, setCharacters] = useState<CharacterRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<RankingPagination | null>(null);
  const [dataSource, setDataSource] = useState<'database' | 'fallback' | 'cache' | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailProfile, setDetailProfile] = useState<CharacterProfile | null>(null);
  const fetchIdRef = useRef(0);

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailLoading(false);
    setDetailError(null);
    setDetailProfile(null);
  };

  const openCharacterDetail = async (char: CharacterRankingRow) => {
    if (!char.account || !char.character) {
      setDetailError('Không đủ thông tin để xem chi tiết nhân vật.');
      setDetailOpen(true);
      return;
    }

    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailProfile(null);

    const isOnline = char.isOnline === 1 || char.isOnline === true;

    try {
      const params = new URLSearchParams({
        accountId: char.account,
        name: char.character,
      });
      const response = await fetch(`/api/characters/profile?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok || !data.success || !data.data) {
        setDetailError(data.message || 'Không lấy được thông tin nhân vật.');
        return;
      }

      setDetailProfile({
        ...data.data,
        isOnline,
      });
    } catch {
      setDetailError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setDetailLoading(false);
    }
  };

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
          else if (metaSource === 'fallback') setDataSource('fallback');
          else if (data.message?.includes('cache')) setDataSource('cache');
          else setDataSource('database');

          setCharacters(mapRows(data.data as Record<string, unknown>[]));

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
          setCharacters([]);
          setDataSource('fallback');
          setPagination(EMPTY_PAGE);
        }
      } catch {
        if (requestId !== fetchIdRef.current) return;
        setCharacters([]);
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

  return (
    <div>
      {dataSource === 'cache' && (
        <p className="we-rank-hint we-rank-hint--warn">{t('rank.cache')}</p>
      )}

      {loading ? (
        <div className="we-loading-center">
          <div className="we-spinner" />
        </div>
      ) : (
        <div>
          <RankingImageList
            characters={characters}
            startRank={(safePage - 1) * pageLimit + 1}
            scoreLabel={scoreLabel}
            onSelect={openCharacterDetail}
          />
          {characters.length === 0 && (
            <p style={{ textAlign: 'center', padding: 20, color: '#999', fontSize: 14 }}>
              {t('rank.empty')}
            </p>
          )}

          <RankingPaginationBar
            page={safePage}
            totalPages={totalPages}
            onPageChange={(next) => {
              setPage(next);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        </div>
      )}

      <CharacterDetailModal
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        profile={detailProfile}
        onClose={closeDetail}
      />
    </div>
  );
}
