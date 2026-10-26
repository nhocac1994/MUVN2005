'use client';

import { useState, useEffect, useRef } from 'react';
import CharacterDetailModal, { type CharacterProfile } from '@/components/CharacterDetailModal';
import RankingPaginationBar, { RANKING_PAGE_SIZE } from '@/components/RankingPagination';
import RankingImageList from '@/components/RankingImageList';
import type { CharacterRankingRow } from '@/lib/ranking-api';
import { useI18n } from '@/lib/i18n';

type Props = {
  query: string;
  onClear: () => void;
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

/** Tìm nhân vật trên toàn Database — không phụ thuộc tab / trang xếp hạng */
export default function CharacterSearchResults({ query, onClear }: Props) {
  const { t } = useI18n();
  const [rows, setRows] = useState<CharacterRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailProfile, setDetailProfile] = useState<CharacterProfile | null>(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    const requestId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);
    setMessage(null);
    setPage(1);
    setRows([]);

    (async () => {
      try {
        const response = await fetch(
          `/api/characters/search?name=${encodeURIComponent(q)}`,
          { cache: 'no-store' }
        );
        const data = await response.json();
        if (requestId !== fetchIdRef.current) return;

        if (!response.ok || !data.success) {
          setRows([]);
          setError(data.message || 'Không tìm kiếm được. Thử lại sau.');
          return;
        }

        const mapped = mapRows((data.data || []) as Record<string, unknown>[]);
        setRows(mapped);
        setMessage(
          data.message ||
            (mapped.length > 0
              ? `Tìm thấy ${mapped.length} kết quả cho "${q}"`
              : `Không tìm thấy nhân vật "${q}"`)
        );
      } catch {
        if (requestId !== fetchIdRef.current) return;
        setRows([]);
        setError('Lỗi kết nối khi tìm kiếm. Vui lòng thử lại.');
      } finally {
        if (requestId === fetchIdRef.current) setLoading(false);
      }
    })();
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(rows.length / RANKING_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageRows = rows.slice(
    (safePage - 1) * RANKING_PAGE_SIZE,
    safePage * RANKING_PAGE_SIZE
  );

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

      setDetailProfile({ ...data.data, isOnline });
    } catch {
      setDetailError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <div className="we-rank-search-result-head">
        <p className="we-rank-hint" style={{ margin: 0 }}>
          {loading
            ? t('rank.searching', { q: query.trim() })
            : error || message || t('rank.found', { n: rows.length })}
        </p>
        <button type="button" className="we-btn we-rank-search-clear" onClick={onClear}>
          {t('rank.back')}
        </button>
      </div>

      {loading ? (
        <div className="we-loading-center">
          <div className="we-spinner" />
        </div>
      ) : (
        <div>
          <RankingImageList
            characters={pageRows}
            startRank={(safePage - 1) * RANKING_PAGE_SIZE + 1}
            scoreLabel={t('char.resets')}
            onSelect={openCharacterDetail}
          />

          {!error && rows.length === 0 && (
            <p style={{ textAlign: 'center', padding: 20, color: '#999', fontSize: 14 }}>
              {t('rank.notFound', { q: query.trim() })}
            </p>
          )}

          <RankingPaginationBar
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <CharacterDetailModal
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        profile={detailProfile}
        onClose={() => {
          setDetailOpen(false);
          setDetailLoading(false);
          setDetailError(null);
          setDetailProfile(null);
        }}
      />
    </div>
  );
}
