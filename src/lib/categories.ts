import type { SpotCategory } from '../data/types';

export const categoryMeta: Record<SpotCategory, { label: string; color: string; text: string; bg: string; ring: string; glyph: string }> = {
  military: { label: '军事', color: '#f43f5e', text: 'text-rose-300', bg: 'bg-rose-500/15', ring: 'ring-rose-400/40', glyph: '⚓' },
  anime: { label: '动漫巡礼', color: '#a855f7', text: 'text-violet-300', bg: 'bg-violet-500/15', ring: 'ring-violet-400/40', glyph: '★' },
  scenic: { label: '风景', color: '#14b8a6', text: 'text-teal-300', bg: 'bg-teal-500/15', ring: 'ring-teal-400/40', glyph: '◆' },
  transport: { label: '交通', color: '#64748b', text: 'text-slate-300', bg: 'bg-slate-500/15', ring: 'ring-slate-400/40', glyph: '→' },
  food: { label: '美食', color: '#f59e0b', text: 'text-amber-300', bg: 'bg-amber-500/15', ring: 'ring-amber-400/40', glyph: '●' },
};

export const googleMapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
export const googleEmbedUrl = (lat: number, lng: number) => `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
