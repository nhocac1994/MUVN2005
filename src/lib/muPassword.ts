import crypto from 'crypto';

/** MD5 hex (thường dùng cho Mu Online / JoinServer) */
export function md5Hex(plain: string): string {
  return crypto.createHash('md5').update(plain, 'utf8').digest('hex');
}

export function isMd5Hex(value: string): boolean {
  return /^[a-fA-F0-9]{32}$/.test(value.trim());
}

/**
 * So khớp mật khẩu nhập với giá trị trong MEMB_INFO.
 * Hỗ trợ: plain text, MD5 hex (thường / hoa).
 */
export function passwordMatchesMu(plain: string, storedRaw: unknown): boolean {
  const plainTrim = String(plain ?? '');
  const stored = String(storedRaw ?? '').trim();
  if (!plainTrim || !stored) return false;
  if (stored === plainTrim) return true;
  const h = md5Hex(plainTrim);
  if (stored.toLowerCase() === h.toLowerCase()) return true;
  if (stored === h.toUpperCase()) return true;
  return false;
}

/** Giữ cùng định dạng mật khẩu đang lưu trong DB (plain hoặc MD5). */
export function encodeMuPasswordForStorage(plain: string, previousStored: string): string {
  const trimmed = plain.trim();
  if (isMd5Hex(previousStored)) {
    return md5Hex(trimmed);
  }
  return trimmed;
}
