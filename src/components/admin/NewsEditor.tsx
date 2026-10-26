'use client';

import React from 'react';
import { htmlToEditableText } from '@/lib/simple-markdown';

export interface NewsFormState {
  id: string;
  slug: string;
  type: string;
  title: string;
  excerpt: string;
  content: string;
  contentFormat: 'markdown' | 'text';
  publishedAt: string;
  published: boolean;
  sortOrder: number;
  /** Ghim cố định trên trang chủ (hiện đủ nội dung) */
  pinned: boolean;
}

export const emptyNewsForm = (): NewsFormState => ({
  id: '',
  slug: '',
  type: 'Hot',
  title: '',
  excerpt: '',
  content:
    `Máy Chủ Cổ Điển – Đúng Chất Hoài niệm

## Thông Tin Máy Chủ

Giới hạn: **2 ACC / 1 PC**

- ⭐ **EXP:** 100%
- 💎 **DROP:** 5%

![Ảnh minh họa](/MUHANOI1.PNG)

## PK / PvP

Tẩy PK: \`/pkclear\`

---

## Event

- Chaos Castle
- Blood Castle

[video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)`,
  contentFormat: 'markdown',
  publishedAt: new Date().toISOString().slice(0, 10),
  published: true,
  sortOrder: 0,
  pinned: false,
});

const fieldClass =
  'w-full rounded-lg border border-purple-500/20 bg-black/60 px-3 py-2 text-sm text-white focus:border-purple-400 focus:outline-none';
const labelClass = 'mb-1 block text-xs font-medium text-zinc-400';

export function newsRowToForm(row: Record<string, unknown>): NewsFormState {
  const rawContent = String(row.content ?? '');
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    type: String(row.type ?? 'Notice'),
    title: String(row.title ?? ''),
    excerpt: String(row.excerpt ?? ''),
    content: htmlToEditableText(rawContent),
    contentFormat: (row.contentFormat as 'markdown' | 'text') || 'markdown',
    publishedAt: String(row.publishedAt ?? new Date().toISOString().slice(0, 10)),
    published: row.published !== false,
    sortOrder: Number(row.sortOrder ?? 0),
    pinned: row.pinned === true,
  };
}

export function newsFormToPayload(form: NewsFormState): Record<string, unknown> {
  return {
    id: form.id,
    slug: form.slug,
    type: form.type,
    title: form.title,
    excerpt: form.excerpt,
    content: form.content,
    contentFormat: form.contentFormat,
    publishedAt: form.publishedAt,
    published: form.published,
    sortOrder: form.sortOrder,
    pinned: form.pinned,
  };
}

export default function NewsEditor({
  form,
  onChange,
}: {
  form: NewsFormState;
  onChange: (f: NewsFormState) => void;
}) {
  const set = <K extends keyof NewsFormState>(key: K, value: NewsFormState[K]) =>
    onChange({ ...form, [key]: value });

  return (
    <div className="space-y-3 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Mã tin (ID)</label>
          <input className={fieldClass} value={form.id} onChange={(e) => set('id', e.target.value)} placeholder="guide" />
        </div>
        <div>
          <label className={labelClass}>Đường dẫn (slug)</label>
          <input className={fieldClass} value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="huong-dan" />
        </div>
        <div>
          <label className={labelClass}>Loại tin</label>
          <select className={fieldClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="Notice">Thông báo</option>
            <option value="Event">Sự kiện</option>
            <option value="Update">Cập nhật</option>
            <option value="Hot">Hot</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Thứ tự / index ( = 1 → ghim cuối trang chủ)</label>
          <input type="number" className={fieldClass} value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tiêu đề</label>
        <input className={fieldClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Mô tả ngắn (hiện ở danh sách tin)</label>
        <input className={fieldClass} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Ngày đăng</label>
          <input type="date" className={fieldClass} value={form.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} />
        </div>
        <div className="flex flex-col justify-end gap-2 pb-2">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
            Xuất bản (hiện trên web)
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.sortOrder === 1}
              onChange={(e) => set('sortOrder', e.target.checked ? 1 : 0)}
            />
            Ghim cuối trang chủ (đặt Thứ tự / index = 1, hiện đủ nội dung)
          </label>
        </div>
      </div>

      <div>
        <label className={labelClass}>Định dạng nội dung</label>
        <select
          className={fieldClass}
          value={form.contentFormat}
          onChange={(e) => set('contentFormat', e.target.value as 'markdown' | 'text')}
        >
          <option value="markdown">Markdown (khuyến nghị)</option>
          <option value="text">Văn bản thường</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Nội dung bài viết</label>
        <div className="mb-2 rounded-lg border border-purple-500/15 bg-black/40 p-3 text-xs text-zinc-400 space-y-1">
          <p className="font-medium text-zinc-300">Markdown → HTML (render đẹp trên web):</p>
          <p>Đoạn đầu (trước ##) = dòng lead nổi bật · mỗi <code className="text-purple-300">## Tiêu đề</code> = một khối riêng có khoảng cách</p>
          <p><code className="text-purple-300">### Mục nhỏ</code> · <code className="text-purple-300">- danh sách</code> · <code className="text-purple-300">---</code> đường kẻ</p>
          <p><code className="text-purple-300">![mô tả](/anh.jpg)</code> ảnh · <code className="text-purple-300">[video](https://youtube.com/...)</code> YouTube</p>
          <p><code className="text-purple-300">**đậm**</code> · <code className="text-purple-300">`/pkclear`</code> lệnh · <code className="text-purple-300">==vàng==</code> · <code className="text-purple-300">!!đỏ!!</code> · emoji gõ trực tiếp</p>
          <p>Ghim trang chủ: đặt <strong className="text-zinc-300">Thứ tự / index = 1</strong> — hiện đủ nội dung markdown đã render.</p>
        </div>
        <textarea
          className={`${fieldClass} min-h-[220px] font-mono text-xs leading-relaxed`}
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
