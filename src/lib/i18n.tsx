'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { RankingTabId } from '@/lib/rankings-config';

export type Locale = 'vi' | 'en';

const STORAGE_KEY = 'site-lang';

const EN_RANKING: Record<RankingTabId, { label: string; score: string }> = {
  level: { label: 'Top Resets', score: 'Resets' },
  killers: { label: 'Top Killers', score: 'Kills' },
  guild: { label: 'Top Guilds', score: 'Score' },
  online: { label: 'Top Online', score: 'Hours' },
  'blood-castle': { label: 'Top Blood Castle', score: 'Score' },
  'devil-square': { label: 'Top Devil Square', score: 'Score' },
  'chaos-castle': { label: 'Top Chaos Castle', score: 'Score' },
  kundun: { label: 'Top Kundun', score: 'Kills' },
  erohim: { label: 'Top Erohim', score: 'Kills' },
  'red-dragon': { label: 'Top Red Dragon', score: 'Kills' },
};

const messages = {
  vi: {
    'nav.home': 'Trang Chủ',
    'nav.download': 'Tải Game',
    'nav.news': 'Bản Tin',
    'nav.rankings': 'Xếp Hạng',
    'nav.register': 'Đăng Ký',
    'nav.login': 'Đăng Nhập',
    'nav.zalo': 'Nhóm Zalo',
    'nav.menu': '☰ Menu',
    'nav.close': '✕ Đóng',
    'rank.title': 'Bảng xếp hạng hàng đầu',
    'rank.crumb': 'Xếp Hạng',
    'rank.searchPh': 'Gõ tên nhân vật để tìm kiếm',
    'rank.search': 'Tìm',
    'rank.clear': 'Xóa',
    'rank.back': 'Về bảng xếp hạng',
    'rank.prev': '← Trước',
    'rank.next': 'Sau →',
    'rank.page': 'Trang {page}/{total}',
    'rank.emptyOn': 'Chưa có top nào được bật. Vào Admin → Cấu hình → Bảng xếp hạng để bật.',
    'rank.fallback': 'Không có dữ liệu',
    'rank.cache': 'Đang hiển thị dữ liệu cache — backend tạm thời quá tải. Dữ liệu có thể chậm vài phút so với game.',
    'rank.emptyDb': 'Không có dữ liệu',
    'rank.empty': 'Không có dữ liệu',
    'rank.emptyGuild': 'Không có dữ liệu',
    'rank.view': 'Xem thông tin {name}',
    'rank.searching': 'Đang tìm “{q}”…',
    'rank.found': 'Tìm thấy {n} nhân vật',
    'rank.notFound': 'Không tìm thấy nhân vật “{q}”',
    'table.class': 'Hệ',
    'table.character': 'Nhân vật',
    'table.level': 'Cấp',
    'table.guildLogo': 'Huy hiệu',
    'table.guildName': 'Bang hội',
    'table.guildMaster': 'Chủ bang',
    'table.members': 'Thành viên',
    'table.score': 'Điểm',
    'table.membersShort': 'TV',
    'table.masterLine': 'Chủ bang: {name}',
    'char.title': 'Thông tin nhân vật',
    'char.level': 'Cấp',
    'char.resets': 'Reset',
    'char.points': 'Điểm',
    'char.kills': 'Kill',
    'char.status': 'Trạng thái',
    'char.online': 'Trực tuyến',
    'char.offline': 'Ngoại tuyến',
    'char.close': 'Đóng',
    'crumb.home': 'Trang chủ',
    'footer.rights': 'BẢO LƯU MỌI QUYỀN.',
    'footer.disclaimer': 'Trang web này không liên kết hoặc được Webzen Inc. chứng nhận.',
    'footer.notice':
      'Server hoạt động phi thương mại, phục vụ mục đích nghiên cứu, học tập kỹ thuật và duy trì cộng đồng đam mê MU Online. Mọi hình ảnh, thương hiệu thuộc về Webzen.',
    'footer.powered': 'Phát triển bởi',
    'side.server': 'Thông tin máy chủ',
    'side.version': 'Phiên bản',
    'side.exp': 'Kinh nghiệm',
    'side.drop': 'Tỷ lệ rơi đồ',
    'side.accounts': 'Tổng số Tài khoản',
    'side.chars': 'Tổng số Nhân vật',
    'side.guilds': 'Tổng số bang hội',
    'side.online': 'Người chơi online',
    'side.events': 'Lịch sự kiện',
    'side.event': 'Sự kiện',
    'side.time': 'Thời gian',
    'side.running': 'Đang diễn ra',
    'news.all': 'Tất cả',
    'news.notice': 'Thông báo',
    'news.event': 'Sự kiện',
    'news.update': 'Cập nhật',
    'news.hot': 'Hot',
    'news.more': 'Xem thêm',
    'news.empty': 'Không có dữ liệu',
    'news.noMatch': 'Không có bản tin nào khớp với "{q}".',
    'news.title': 'Bản Tin',
    'news.searchPh': 'Tìm bản tin... (VD: hướng dẫn, sự kiện, map)',
    'news.searchEmpty': 'Không tìm thấy bản tin phù hợp.',
    'news.filter': 'Lọc tin tức nhanh',
    'dl.title': 'Tải Game',
    'dl.guide': 'Hướng dẫn vào game',
    'dl.step1': 'Tải Client tiếng Việt hoặc Client tiếng Anh, giải nén ra thư mục.',
    'dl.step2': 'Nếu máy chưa có / báo lỗi thiếu DLL: cài Visual C++ 2015–2022 (x86, và x64 nếu cần).',
    'dl.step3': 'Chạy Launcher trong thư mục game → cập nhật nếu có → nhấn Start / Vào game.',
    'dl.step4': 'Đăng nhập tài khoản đã đăng ký trên website và tạo nhân vật.',
    'dl.note': 'Không chạy file .exe lẻ trong thư mục con — luôn mở bằng Launcher rồi vào game.',
    'dl.noteLabel': 'Lưu ý:',
    'dl.viHead': 'Client tiếng Việt',
    'dl.enHead': 'Client tiếng Anh',
    'dl.viTitle': 'Client tiếng Việt {name} {ver}',
    'dl.enTitle': 'Client tiếng Anh {name} {ver}',
    'dl.viSub': 'Bản client giao diện tiếng Việt',
    'dl.enSub': 'Bản client giao diện tiếng Anh',
    'dl.support': 'Phần mềm hỗ trợ',
    'dl.get': 'Tải về',
    'dl.video': 'Video hướng dẫn cài đặt game',
    'dl.watch': 'Xem video hướng dẫn',
    'dl.youtube': 'Mở video trên YouTube ↗',
    'login.sub': 'Đăng nhập để quản lý tài khoản Mu Online',
    'login.section': 'Thông tin đăng nhập',
    'login.user': 'Tên đăng nhập *',
    'login.pass': 'Mật khẩu *',
    'login.userPh': 'Nhập tên đăng nhập',
    'login.passPh': 'Nhập mật khẩu',
    'login.userReq': 'Tên đăng nhập là bắt buộc',
    'login.passReq': 'Mật khẩu là bắt buộc',
    'login.submit': 'Đăng nhập',
    'login.loading': 'Đang xử lý...',
    'login.fail': 'Đăng nhập thất bại.',
    'login.noAccount': 'Chưa có tài khoản?',
    'login.register': 'Đăng ký ngay',
    'quick.server': 'Máy chủ',
    'quick.version': 'Phiên bản',
    'quick.exp': 'EXP',
    'quick.drop': 'Tỷ lệ rơi',
  },
  en: {
    'nav.home': 'Home',
    'nav.download': 'Download',
    'nav.news': 'News',
    'nav.rankings': 'Rankings',
    'nav.register': 'Register',
    'nav.login': 'Login',
    'nav.zalo': 'Zalo',
    'nav.menu': '☰ Menu',
    'nav.close': '✕ Close',
    'rank.title': 'Top Rankings',
    'rank.crumb': 'Rankings',
    'rank.searchPh': 'Search character name',
    'rank.search': 'Search',
    'rank.clear': 'Clear',
    'rank.back': 'Back to rankings',
    'rank.prev': '← Prev',
    'rank.next': 'Next →',
    'rank.page': 'Page {page}/{total}',
    'rank.emptyOn': 'No ranking tabs are enabled.',
    'rank.fallback': 'No data',
    'rank.cache': 'Showing cached data — the server is busy. Numbers may be a few minutes behind the game.',
    'rank.emptyDb': 'No data',
    'rank.empty': 'No data',
    'rank.emptyGuild': 'No data',
    'rank.view': 'View {name}',
    'rank.searching': 'Searching “{q}”…',
    'rank.found': 'Found {n} character(s)',
    'rank.notFound': 'No character named “{q}”',
    'table.class': 'Class',
    'table.character': 'Character',
    'table.level': 'Level',
    'table.guildLogo': 'Guild Logo',
    'table.guildName': 'Guild Name',
    'table.guildMaster': 'Guild Master',
    'table.members': 'Members',
    'table.score': 'Score',
    'table.membersShort': 'Members',
    'table.masterLine': 'Guild Master: {name}',
    'char.title': 'Player Profile',
    'char.level': 'Level',
    'char.resets': 'Resets',
    'char.points': 'Point',
    'char.kills': 'Kills',
    'char.status': 'Status',
    'char.online': 'Online',
    'char.offline': 'Offline',
    'char.close': 'Close',
    'crumb.home': 'Home',
    'footer.rights': 'ALL RIGHTS RESERVED.',
    'footer.disclaimer': 'This website is not affiliated with or endorsed by Webzen Inc.',
    'footer.notice':
      'This server is non-commercial, for research, technical learning, and sustaining the MU Online community. All images and trademarks belong to Webzen.',
    'footer.powered': 'Developed by',
    'side.server': 'Server Info',
    'side.version': 'Version',
    'side.exp': 'Experience',
    'side.drop': 'Drop Rate',
    'side.accounts': 'Total Accounts',
    'side.chars': 'Total Characters',
    'side.guilds': 'Total Guilds',
    'side.online': 'Players Online',
    'side.events': 'Event Time',
    'side.event': 'Event',
    'side.time': 'Time',
    'side.running': 'In progress',
    'news.all': 'All',
    'news.notice': 'Notice',
    'news.event': 'Event',
    'news.update': 'Update',
    'news.hot': 'Hot',
    'news.more': 'Read more',
    'news.empty': 'No data',
    'news.noMatch': 'No news matches "{q}".',
    'news.title': 'News',
    'news.searchPh': 'Search news... (e.g. guide, event, map)',
    'news.searchEmpty': 'No matching news.',
    'news.filter': 'Filter news',
    'dl.title': 'Download',
    'dl.guide': 'How to enter the game',
    'dl.step1': 'Download the Vietnamese or English client, then extract it to a folder.',
    'dl.step2': 'If the PC is missing DLLs: install Visual C++ 2015–2022 (x86, and x64 if needed).',
    'dl.step3': 'Run Launcher in the game folder → update if prompted → press Start.',
    'dl.step4': 'Log in with the account you registered on the website and create a character.',
    'dl.note': 'Do not run a loose .exe in a subfolder — always open Launcher, then enter the game.',
    'dl.noteLabel': 'Note:',
    'dl.viHead': 'Vietnamese Client',
    'dl.enHead': 'English Client',
    'dl.viTitle': 'Vietnamese Client {name} {ver}',
    'dl.enTitle': 'English Client {name} {ver}',
    'dl.viSub': 'Client with Vietnamese interface',
    'dl.enSub': 'Client with English interface',
    'dl.support': 'Support software',
    'dl.get': 'Download',
    'dl.video': 'Game install guide video',
    'dl.watch': 'Watch the guide',
    'dl.youtube': 'Open on YouTube ↗',
    'login.sub': 'Log in to manage your Mu Online account',
    'login.section': 'Login information',
    'login.user': 'Username *',
    'login.pass': 'Password *',
    'login.userPh': 'Enter username',
    'login.passPh': 'Enter password',
    'login.userReq': 'Username is required',
    'login.passReq': 'Password is required',
    'login.submit': 'Login',
    'login.loading': 'Please wait...',
    'login.fail': 'Login failed.',
    'login.noAccount': 'No account yet?',
    'login.register': 'Register now',
    'quick.server': 'Server',
    'quick.version': 'Version',
    'quick.exp': 'EXP',
    'quick.drop': 'Drop',
  },
} as const;

export type MessageKey = keyof (typeof messages)['vi'];

type I18nValue = {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] != null ? String(vars[name]) : ''
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>('vi');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'vi';
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: setLangState,
      t: (key, vars) => format(messages[lang][key], vars),
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      lang: 'vi',
      setLang: () => {},
      t: (key, vars) => format(messages.vi[key], vars),
    };
  }
  return ctx;
}

/** Tên tab + cột điểm: tiếng Anh dùng nhãn cố định, tiếng Việt dùng config admin */
export function rankingTexts(
  id: RankingTabId,
  lang: Locale,
  viLabel: string,
  viScore: string
): { label: string; score: string } {
  if (lang === 'en') return EN_RANKING[id];
  return { label: viLabel, score: viScore };
}
