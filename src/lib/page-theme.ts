/** WebEngine theme — dùng chung các trang */

export const cardShell = 'we-box';
export const cardHead = 'we-box-head';
export const cardBody = 'we-box-body';
export const stackGap = 'flex flex-col gap-4';
export const gridGap = 'grid gap-4';

export const inputModern = 'we-input';
export const labelModern = 'block text-sm font-semibold text-gray-700 mb-1';

export const sectionTitleModern = 'we-page-title';

export const btnPrimaryClass = 'we-btn we-btn-block';
export const btnPrimaryStyle = {} as const;

export const linkAccent = 'text-red-700 font-semibold hover:underline';

export const accentText = 'text-red-700';

export function newsBadgeClass(type: string): string {
  const colors: Record<string, string> = {
    Notice: 'bg-blue-600',
    Event: 'bg-orange-600',
    Update: 'bg-purple-600',
    Hot: 'bg-red-600',
  };
  return `inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white ${colors[type] || 'bg-gray-600'}`;
}
