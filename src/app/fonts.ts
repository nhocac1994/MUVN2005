import { Be_Vietnam_Pro, Orbitron } from 'next/font/google';

/** Chữ nội dung — Be Vietnam Pro, dấu tiếng Việt rõ */
export const fontBody = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-family-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

/** Chỉ tên trang (vd. MUVIETNAM2005.COM) — Orbitron không có dấu tiếng Việt */
export const fontDisplay = Orbitron({
  subsets: ['latin'],
  variable: '--font-family-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});
