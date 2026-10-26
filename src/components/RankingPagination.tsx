'use client';

import { useI18n } from '@/lib/i18n';

type RankingPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function RankingPagination({
  page,
  totalPages,
  onPageChange,
}: RankingPaginationProps) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="we-rank-pagination" role="navigation" aria-label="Phân trang xếp hạng">
      <button
        type="button"
        className={`we-rank-page-btn${canPrev ? '' : ' is-disabled'}`}
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(page - 1)}
      >
        {t('rank.prev')}
      </button>
      <span className="we-rank-page-info">
        {t('rank.page', { page, total: totalPages })}
      </span>
      <button
        type="button"
        className={`we-rank-page-btn${canNext ? '' : ' is-disabled'}`}
        disabled={!canNext}
        onClick={() => canNext && onPageChange(page + 1)}
      >
        {t('rank.next')}
      </button>
    </div>
  );
}

export const RANKING_PAGE_SIZE = 50;
