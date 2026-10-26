/** Dữ liệu mẫu khi backend ranking không phản hồi — dùng chung API route + bảng client */

export type LevelRankingRow = {
  account: string;
  character: string;
  class: number;
  resets: number;
  level: number;
  isOnline: number;
};

export type GuildRankingRow = {
  guildName: string;
  score: number;
  guildMaster: string;
  memberCount: number;
  guildMark?: string | null;
};

export const RANKING_LEVEL_FALLBACK: LevelRankingRow[] = [
  { account: '', character: 'TestMu3', class: 66, level: 400, resets: 71, isOnline: 0 },
  { account: '', character: 'TestMu', class: 34, level: 400, resets: 50, isOnline: 0 },
  { account: '', character: 'Demonu', class: 50, level: 400, resets: 40, isOnline: 0 },
  { account: '', character: 'Mazoku', class: 18, level: 400, resets: 0, isOnline: 0 },
];

export const RANKING_GUILD_FALLBACK: GuildRankingRow[] = [
  { guildName: 'MuOnline', guildMaster: 'Demonu', memberCount: 1, score: 1000 },
  { guildName: 'DragonSlayer', guildMaster: 'TestMu', memberCount: 12, score: 800 },
  { guildName: 'Phoenix', guildMaster: 'Mazoku', memberCount: 8, score: 600 },
  { guildName: 'Shadow', guildMaster: 'DarkKnight', memberCount: 5, score: 400 },
  { guildName: 'Legends', guildMaster: 'TestMu3', memberCount: 3, score: 200 },
];
