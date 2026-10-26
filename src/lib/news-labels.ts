/** Nhãn loại tin. Giá trị API vẫn giữ Notice/Event/... */
export function newsTypeLabel(type: string, lang: 'vi' | 'en' = 'vi'): string {
  const vi: Record<string, string> = {
    Notice: 'Thông báo',
    Event: 'Sự kiện',
    Update: 'Cập nhật',
    Hot: 'Hot',
  };
  const en: Record<string, string> = {
    Notice: 'Notice',
    Event: 'Event',
    Update: 'Update',
    Hot: 'Hot',
  };
  const map = lang === 'en' ? en : vi;
  return map[type] || type;
}
