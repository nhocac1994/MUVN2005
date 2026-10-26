/** Chuyển markdown đơn giản / text thường → HTML an toàn */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/'/g, '&#39;');
}

function isSafeImageUrl(url: string): boolean {
  const u = url.trim();
  if (u.startsWith('/')) return true;
  return /^https?:\/\//i.test(u);
}

function isSafeMediaUrl(url: string): boolean {
  return isSafeImageUrl(url);
}

function parseYoutubeId(url: string): string | null {
  const u = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = u.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parseVideoLine(line: string): string | null {
  const match = line.trim().match(/^\[(?:video|youtube)\]\(([^)]+)\)$/i);
  if (!match || !isSafeMediaUrl(match[1])) return null;

  const url = match[1].trim();
  const youtubeId = parseYoutubeId(url);
  if (youtubeId) {
    const embed = `https://www.youtube.com/embed/${youtubeId}`;
    return `<figure class="article-video"><div class="we-video-wrap"><iframe src="${escapeAttr(embed)}" title="Video YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div></figure>`;
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return `<figure class="article-video"><video src="${escapeAttr(url)}" controls playsinline class="article-video-file"></video></figure>`;
  }

  return `<p><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Xem video</a></p>`;
}

/** Emoji, ==tên nổi bật==, [VS], **đậm**, *nghiêng*, `code`, ![ảnh](url) */
function inlineFormat(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
    if (!isSafeImageUrl(url)) return escapeHtml(_m);
    return `<img src="${escapeAttr(url.trim())}" alt="${escapeAttr(alt)}" class="inline-img" loading="lazy" />`;
  });
  s = s.replace(/==(.+?)==/g, '<mark class="news-highlight">$1</mark>');
  s = s.replace(/!!(.+?)!!/g, '<span class="news-red">$1</span>');
  s = s.replace(/\[VS\]/gi, '<span class="news-vs">VS</span>');
  s = s.replace(/`([^`]+)`/g, '<code class="we-md-code">$1</code>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return s;
}

function parseImageLine(line: string): string | null {
  const m = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!m || !isSafeImageUrl(m[2])) return null;
  const alt = escapeAttr(m[1]);
  const src = escapeAttr(m[2].trim());
  return `<figure class="article-figure"><img src="${src}" alt="${alt}" loading="lazy" /></figure>`;
}

function parseMediaLine(line: string): string | null {
  return parseVideoLine(line) ?? parseImageLine(line);
}

/** Gom các dòng sau heading thành HTML (gộp list liên tiếp) */
function renderBodyLines(lines: string[]): string[] {
  const out: string[] = [];
  let listBuf: string[] = [];

  const flushList = () => {
    if (!listBuf.length) return;
    out.push('<ul>');
    for (const item of listBuf) out.push(`<li>${inlineFormat(item)}</li>`);
    out.push('</ul>');
    listBuf = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushList();
      continue;
    }
    const media = parseMediaLine(t);
    if (media) {
      flushList();
      out.push(media);
      continue;
    }
    if (t.startsWith('- ')) {
      listBuf.push(t.slice(2));
      continue;
    }
    flushList();
    out.push(`<p>${inlineFormat(t)}</p>`);
  }
  flushList();
  return out;
}

/**
 * Markdown → HTML
 * - `#` / `##` / `###` tiêu đề (## = khối section có nền)
 * - `- ` danh sách · dòng trống = đoạn mới
 * - `![alt](url)` ảnh · `[video](url)` YouTube/mp4
 * - `**đậm**` · `*nghiêng*` · `` `code` `` · `==highlight==` · `[VS]`
 * - `---` đường kẻ ngang
 */
export function simpleMarkdownToHtml(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';

  const blocks = normalized.split(/\n\n+/);
  const html: string[] = [];
  let leadDone = false;

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trimEnd());
    const first = lines[0]?.trim() ?? '';

    if (first === '---' && lines.length === 1) {
      html.push('<hr class="we-md-hr" />');
      continue;
    }

    const imgBlock = parseMediaLine(first);
    if (imgBlock && lines.length === 1) {
      html.push(imgBlock);
      continue;
    }

    if (first.startsWith('### ')) {
      html.push('<section class="we-md-section we-md-section--sub">');
      html.push(`<h3>${inlineFormat(first.slice(4))}</h3>`);
      html.push(...renderBodyLines(lines.slice(1)));
      html.push('</section>');
      leadDone = true;
      continue;
    }

    if (first.startsWith('## ')) {
      html.push('<section class="we-md-section">');
      html.push(`<h2>${inlineFormat(first.slice(3))}</h2>`);
      html.push(...renderBodyLines(lines.slice(1)));
      html.push('</section>');
      leadDone = true;
      continue;
    }

    if (first.startsWith('# ')) {
      html.push(`<h1 class="we-md-h1">${inlineFormat(first.slice(2))}</h1>`);
      leadDone = true;
      continue;
    }

    const allList = lines.every((l) => !l.trim() || l.trim().startsWith('- '));
    if (allList && lines.some((l) => l.trim().startsWith('- '))) {
      html.push(...renderBodyLines(lines));
      continue;
    }

    // Đoạn mở đầu (trước ##) → lead nổi bật
    if (!leadDone && lines.every((l) => !l.trim().startsWith('#') && !l.trim().startsWith('- '))) {
      const text = lines.map((l) => l.trim()).filter(Boolean).join(' ');
      if (text) {
        html.push(`<p class="we-md-lead">${inlineFormat(text)}</p>`);
        leadDone = true;
        continue;
      }
    }

    html.push(...renderBodyLines(lines));
  }

  return html.join('');
}

export function isLikelyHtml(content: string): boolean {
  return /<\s*(p|h[1-6]|ul|ol|li|div|br|figure|img|video|iframe|mark|section|hr)\b/i.test(content);
}

export function renderArticleContent(content: string, format?: 'markdown' | 'text' | 'html'): string {
  const fmt = format ?? (isLikelyHtml(content) ? 'html' : 'markdown');
  if (fmt === 'html') return content;
  if (fmt === 'text') {
    return content
      .split(/\n\n+/)
      .map((p) => `<p>${inlineFormat(p.replace(/\n/g, ' ').trim())}</p>`)
      .join('');
  }
  return simpleMarkdownToHtml(content);
}

/** Gợi ý chuyển HTML cũ sang text khi mở trong editor */
export function htmlToEditableText(html: string): string {
  if (!isLikelyHtml(html)) return html;
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<h2[^>]*>/gi, '\n\n## ')
    .replace(/<\/h2>/gi, '\n')
    .replace(/<h3[^>]*>/gi, '\n\n### ')
    .replace(/<\/h3>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<hr[^>]*>/gi, '\n\n---\n\n')
    .replace(/<\/?section[^>]*>/gi, '')
    .replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '\n\n![$2]($1)\n\n')
    .replace(/<img[^>]+src="([^"]*)"[^>]*>/gi, '\n\n![]($1)\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
