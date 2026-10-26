/**
 * Mã Class trong bảng Character (cột Class) — Mu Online Season 1.0 / classic byte.
 * Tham chiếu: DW 0–2, DK 16–18, ELF 32–34, MG 48, DL 64.
 */
export const MU_CLASS_NAMES: Readonly<Record<number, string>> = {
  0: 'Dark Wizard',
  1: 'Soul Master',
  2: 'Grand Master',
  16: 'Dark Knight',
  17: 'Blade Knight',
  18: 'Blade Master',
  32: 'Fairy Elf',
  33: 'Muse Elf',
  34: 'High Elf',
  48: 'Magic Gladiator',
  50: 'Dark Lord',
  64: 'Dark Lord',
  65: 'Bloody Summoner',
  66: 'Dimension Master',
  80: 'Rage Fighter',
  81: 'Fist Master',
  96: 'Grow Lancer',
  97: 'Mirage Lancer',
};

export function getMuClassName(classId: number): string {
  return MU_CLASS_NAMES[classId] ?? `Class ${classId}`;
}

/** Mã viết tắt 2 ký tự cho từng class (badge dự phòng khi không có icon). */
export const MU_CLASS_SHORT: Readonly<Record<number, string>> = {
  0: 'DW', 1: 'SM', 2: 'GM',
  16: 'DK', 17: 'BK', 18: 'BM',
  32: 'FE', 33: 'ME', 34: 'HE',
  48: 'MG', 50: 'DL', 64: 'DL',
  65: 'BS', 66: 'DM',
  80: 'RF', 81: 'FM',
  96: 'GL', 97: 'ML',
};

export function getMuClassShort(classId: number): string {
  return MU_CLASS_SHORT[classId] ?? '?';
}

/**
 * Icon class trong /public/icons. Chỉ có sẵn các dòng cơ bản:
 * dw (DW/SM/GM), dk (DK/BK/BM), ef (FE/ME/HE), mg (MG), dl (DL).
 * Trả về null nếu chưa có icon → dùng badge chữ thay thế.
 */
const MU_CLASS_ICON_BASE: Readonly<Record<number, string>> = {
  0: 'dw', 1: 'dw', 2: 'dw',
  16: 'dk', 17: 'dk', 18: 'dk',
  32: 'ef', 33: 'ef', 34: 'ef',
  48: 'mg',
  50: 'dl', 64: 'dl',
};

export function getMuClassIcon(classId: number): string | null {
  const base = MU_CLASS_ICON_BASE[classId];
  return base ? `/icons/${base}.png` : null;
}
