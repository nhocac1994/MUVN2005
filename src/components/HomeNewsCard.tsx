import Link from 'next/link';
import { formatNewsDate, type NewsType } from '@/lib/news-api';

export interface HomeNewsItem {
  title: string;
  excerpt?: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  type: NewsType | string;
  link: string;
}

function badgeColor(type: string): string {
  if (type === 'Notice') return 'bg-blue-600/80';
  if (type === 'Event') return 'bg-orange-600/80';
  if (type === 'Hot') return 'bg-red-600/80';
  return 'bg-purple-600/80';
}

export default function HomeNewsCard({ item }: { item: HomeNewsItem }) {
  const dateLabel = formatNewsDate(item.date);
  const preview = item.excerpt?.trim();

  return (
    <article className="group border-b border-purple-400/15 py-4 last:border-b-0 sm:py-5">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Badge loại tin — giữ màu cũ */}
        <span
          className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white sm:text-[11px] ${badgeColor(item.type)}`}
        >
          {item.type}
        </span>

        <div className="min-w-0 flex-1">
          <Link href={item.link} className="block">
            <h3 className="text-sm font-semibold leading-snug text-zinc-50 transition group-hover:text-purple-100 sm:text-base">
              {item.title}
            </h3>
          </Link>
          <time className="mt-1 block text-xs text-zinc-400">{dateLabel}</time>

          {/* Tóm tắt ngắn + hiệu ứng mờ dần */}
          {preview ? (
            <div className="relative mt-2.5 max-h-[2.75rem] overflow-hidden sm:max-h-[3rem]">
              <p className="text-xs leading-relaxed text-zinc-300 sm:text-[13px]">{preview}</p>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-[#1a1028] via-[#1a1028]/92 to-transparent"
                aria-hidden
              />
            </div>
          ) : null}

          <Link
            href={item.link}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-purple-300 transition hover:text-purple-200 sm:text-sm"
          >
            Xem chi tiết
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
