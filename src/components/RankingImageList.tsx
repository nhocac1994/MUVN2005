'use client';

import ClassIcon from '@/components/ClassIcon';
import { getMuClassName } from '@/lib/mu-classes';
import type { CharacterRankingRow } from '@/lib/ranking-api';
import { useI18n } from '@/lib/i18n';

type Props = {
  characters: CharacterRankingRow[];
  startRank?: number;
  scoreLabel?: string;
  onSelect: (char: CharacterRankingRow) => void;
};

function rankTone(rank: number): string {
  if (rank === 1) return 'is-gold';
  if (rank === 2) return 'is-silver';
  if (rank === 3) return 'is-bronze';
  return '';
}

/** Hàng xếp hạng kiểu ảnh (portrait class lớn) */
export default function RankingImageList({
  characters,
  startRank = 1,
  scoreLabel = 'Reset',
  onSelect,
}: Props) {
  const { t } = useI18n();
  if (characters.length === 0) return null;

  return (
    <div className="we-rank-img-list" role="list">
      <div className="we-rank-img-head" aria-hidden>
        <span className="we-rank-img-h-rank">#</span>
        <span className="we-rank-img-h-class">{t('table.class')}</span>
        <span className="we-rank-img-h-name">{t('table.character')}</span>
        <span className="we-rank-img-h-level">{t('table.level')}</span>
        <span className="we-rank-img-h-score">{scoreLabel}</span>
      </div>

      {characters.map((char, index) => {
        const rank = startRank + index;
        const online = char.isOnline === 1 || char.isOnline === true;
        return (
          <button
            key={`${char.account}-${char.character}-${rank}`}
            type="button"
            role="listitem"
            className={`we-rank-img-row ${rankTone(rank)}`}
            onClick={() => onSelect(char)}
            title={t('rank.view', { name: char.character })}
          >
            <span className={`we-rank-img-rank ${rankTone(rank)}`}>{rank}</span>
            <span className="we-rank-img-avatar">
              <ClassIcon classId={char.class} size={72} className="we-rank-img-portrait" />
            </span>
            <span className="we-rank-img-nameblock">
              <span className="we-rank-img-name">
                {char.character}
                <span
                  className={`we-status-dot ${online ? 'we-status-online' : 'we-status-offline'}`}
                />
              </span>
              <span className="we-rank-img-class">{getMuClassName(char.class)}</span>
            </span>
            <span className="we-rank-img-level" data-prefix={`${t('table.level')} `}>
              {char.level ?? '—'}
            </span>
            <span className="we-rank-img-score" data-prefix={`${scoreLabel} `}>
              {char.score.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
