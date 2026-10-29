import type { SpotCategory } from '../data/types';

export const categoryMeta: Record<SpotCategory, { label: string; color: string; text: string; bg: string; ring: string; glyph: string }> = {
  military: { label: '军事', color: '#f43f5e', text: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-200/80', glyph: '⚓' },
  anime: { label: '动漫巡礼', color: '#a855f7', text: 'text-violet-700', bg: 'bg-violet-50', ring: 'ring-violet-200/80', glyph: '★' },
  scenic: { label: '风景', color: '#0d9488', text: 'text-teal-700', bg: 'bg-teal-50', ring: 'ring-teal-200/80', glyph: '◆' },
  transport: { label: '交通', color: '#64748b', text: 'text-slate-700', bg: 'bg-slate-100', ring: 'ring-slate-200/80', glyph: '→' },
  food: { label: '美食', color: '#f59e0b', text: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200/80', glyph: '●' },
};

export const googleMapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
export const googleEmbedUrl = (lat: number, lng: number) => `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
export const googleStreetViewUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
export const anitabiMapUrl = (bangumiId: number, pointId?: string) =>
  `https://anitabi.cn/map?bangumiId=${bangumiId}${pointId ? `&pid=${pointId}` : ''}`;
export const formatAnitabiImage = (url: string, plan: 'h160' | 'h360' = 'h360') =>
  url.replace(/[?&]plan=h\d+/, `?plan=${plan}`);
export const formatAnitabiTime = (seconds?: number) => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

