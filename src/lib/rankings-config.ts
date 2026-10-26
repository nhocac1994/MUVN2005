export type RankingTabId =
  | 'level'
  | 'killers'
  | 'guild'
  | 'online'
  | 'blood-castle'
  | 'devil-square'
  | 'chaos-castle'
  | 'kundun'
  | 'erohim'
  | 'red-dragon';

export type RankingTab = {
  id: RankingTabId;
  label: string;
  type: 'character' | 'guild';
  scoreLabel: string;
  description: string;
  /** Mặc định bật — có thể tắt qua site-config / Admin */
  enabled: boolean;
};

/** Cấu hình mỗi tab từ Admin / site-config */
export type RankingTabConfig = {
  id: RankingTabId;
  enabled: boolean;
  /** Tên hiển thị (để trống = dùng label mặc định) */
  label?: string;
};

export const RANKING_TABS: RankingTab[] = [
  {
    id: 'level',
    label: 'Top Reset',
    type: 'character',
    scoreLabel: 'Reset',
    description: 'Xếp hạng theo tổng số resets (ResetCount)',
    enabled: true,
  },
  {
    id: 'killers',
    label: 'Top Sát thủ',
    type: 'character',
    scoreLabel: 'PK',
    description: 'Xếp hạng theo số lần PK (PkCount)',
    enabled: true,
  },
  {
    id: 'guild',
    label: 'Top Bang hội',
    type: 'guild',
    scoreLabel: 'Điểm',
    description: 'Xếp hạng theo điểm guild (G_Score)',
    enabled: true,
  },
  {
    id: 'online',
    label: 'Top trực tuyến',
    type: 'character',
    scoreLabel: 'Giờ',
    description: 'Xếp hạng theo tổng giờ online',
    enabled: true,
  },
  {
    id: 'blood-castle',
    label: 'Top Huyết Lâu',
    type: 'character',
    scoreLabel: 'Điểm',
    description: 'Bảng RankingBloodCastle — điểm sự kiện Huyết Lâu',
    enabled: true,
  },
  {
    id: 'devil-square',
    label: 'Top Quảng Trường Quỷ',
    type: 'character',
    scoreLabel: 'Điểm',
    description: 'Bảng RankingDevilSquare — điểm Quảng Trường Quỷ',
    enabled: true,
  },
  {
    id: 'chaos-castle',
    label: 'Top Hỗn Nguyên Lâu',
    type: 'character',
    scoreLabel: 'Điểm',
    description: 'Bảng RankingChaosCastle — điểm Hỗn Nguyên Lâu',
    enabled: true,
  },
  {
    id: 'kundun',
    label: 'Top Săn Kundun',
    type: 'character',
    scoreLabel: 'Lần',
    description: 'Số lần hạ boss Kundun (MonsterKillCount)',
    enabled: true,
  },
  {
    id: 'erohim',
    label: 'Top Săn Erohim',
    type: 'character',
    scoreLabel: 'Lần',
    description: 'Số lần hạ boss Erohim (MonsterKillCount)',
    enabled: true,
  },
  {
    id: 'red-dragon',
    label: 'Top Săn Rồng Đỏ',
    type: 'character',
    scoreLabel: 'Lần',
    description: 'Số lần hạ Rồng Đỏ (MonsterKillCount)',
    enabled: true,
  },
];

export const RANKING_TAB_IDS: RankingTabId[] = RANKING_TABS.map((t) => t.id);

/** Số tab mỗi hàng trên UI */
export const RANKING_TABS_PER_ROW = 6;

export function getRankingTab(id: RankingTabId): RankingTab | undefined {
  return RANKING_TABS.find((t) => t.id === id);
}

export function isRankingTabId(id: string): id is RankingTabId {
  return RANKING_TAB_IDS.includes(id as RankingTabId);
}

/** Cấu hình mặc định cho Admin / site-config */
export function defaultRankingTabConfigs(): RankingTabConfig[] {
  return RANKING_TABS.map((t) => ({
    id: t.id,
    enabled: t.enabled,
    label: t.label,
  }));
}

function parseRankingEnabled(value: unknown): boolean {
  if (value === false || value === 0 || value === 'false' || value === '0') {
    return false;
  }
  return true;
}

/**
 * Gộp cấu hình từ site-config với danh sách mặc định.
 * Thứ tự theo config (nếu có), còn id lạ thì bỏ qua.
 */
export function mergeRankingTabConfigs(
  overrides?: RankingTabConfig[] | null
): RankingTabConfig[] {
  const defaults = defaultRankingTabConfigs();
  if (!overrides?.length) return defaults;

  const byId = new Map(defaults.map((t) => [t.id, t]));
  const merged: RankingTabConfig[] = [];
  const seen = new Set<RankingTabId>();

  for (const item of overrides) {
    if (!isRankingTabId(item.id)) continue;
    const base = byId.get(item.id)!;
    const raw = item as RankingTabConfig & Record<string, unknown>;
    merged.push({
      id: item.id,
      enabled: parseRankingEnabled(raw.enabled),
      label: (item.label?.trim() || base.label) as string,
    });
    seen.add(item.id);
  }

  for (const t of defaults) {
    if (!seen.has(t.id)) merged.push(t);
  }

  return merged;
}

/** Tab đang bật — dùng trên trang xếp hạng */
export function getVisibleRankingTabs(
  overrides?: RankingTabConfig[] | null
): RankingTab[] {
  const configs = mergeRankingTabConfigs(overrides);
  const result: RankingTab[] = [];

  for (const cfg of configs) {
    if (!cfg.enabled) continue;
    const base = getRankingTab(cfg.id);
    if (!base) continue;
    result.push({
      ...base,
      label: cfg.label?.trim() || base.label,
      enabled: true,
    });
  }

  return result;
}

/** Chia tab thành các hàng (mặc định 6/hàng) */
export function chunkRankingTabs(
  tabs: RankingTab[],
  perRow = RANKING_TABS_PER_ROW
): RankingTab[][] {
  const rows: RankingTab[][] = [];
  for (let i = 0; i < tabs.length; i += perRow) {
    rows.push(tabs.slice(i, i + perRow));
  }
  return rows;
}
