import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Calendar, ChevronLeft, ChevronRight, ExternalLink, Layers, MapPin, Navigation, RotateCcw, Search, X } from 'lucide-react';
import { allSpots, spotById } from '../lib/allSpots';
import { categoryMeta, googleEmbedUrl, googleMapsUrl } from '../lib/categories';
import { days } from '../data/itineraryData';
import type { MapSpot, SpotCategory } from '../data/types';

const tiles = {
  pale: { label: '淡色', url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', attr: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>', maxZoom: 18 },
  street: { label: '街道', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', attr: 'Tiles &copy; Esri', maxZoom: 18 },
  osm: { label: 'OSM', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '&copy; OpenStreetMap contributors', maxZoom: 19 },
  satellite: { label: '卫星', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Tiles &copy; Esri', maxZoom: 18 },
} as const;
type TileKey = keyof typeof tiles;

const allCategories: SpotCategory[] = ['military', 'anime', 'scenic', 'food', 'transport'];

const routeLine: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (const d of days) {
    for (const st of d.stops) {
      const s = st.spotId ? spotById.get(st.spotId) : undefined;
      if (!s) continue;
      const last = pts[pts.length - 1];
      if (!last || last[0] !== s.lat || last[1] !== s.lng) pts.push([s.lat, s.lng]);
    }
  }
  return pts;
})();

function makeIcon(s: MapSpot, active: boolean) {
  const meta = categoryMeta[s.category];
  const size = active ? 34 : 26;
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="marker-pin ${active ? 'is-active' : ''}" style="width:${size}px;height:${size}px;background:${meta.color};font-size:${active ? 13 : 11}px;color:#fff;font-weight:700">${s.day}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export interface TripMapProps {
  focusDay: number | null;
  onFocusDay: (d: number | null) => void;
  selectedSpotId?: string | null;
  onSelectSpotId?: (id: string | null) => void;
  onJumpToDay?: (day: number) => void;
}

export default function TripMap({
  focusDay,
  onFocusDay,
  selectedSpotId = null,
  onSelectSpotId,
  onJumpToDay,
}: TripMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);
  const dayRouteLayer = useRef<L.Polyline | null>(null);
  const [tile, setTile] = useState<TileKey>('pale');
  const [cats, setCats] = useState<Set<SpotCategory>>(new Set(allCategories));
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [spotQuery, setSpotQuery] = useState('');

  const activeSpotId = selectedSpotId !== undefined ? selectedSpotId : internalSelectedId;
  const setSelectedId = (id: string | null) => {
    setInternalSelectedId(id);
    onSelectSpotId?.(id);
  };

  const selected = useMemo(() => (activeSpotId ? spotById.get(activeSpotId) ?? null : null), [activeSpotId]);

  const visible = useMemo(() => {
    const q = spotQuery.trim().toLowerCase();
    return allSpots.filter((s) => {
      if (!cats.has(s.category) && s.id !== selected?.id) return false;
      if (focusDay !== null && s.day !== focusDay) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.nameJa && s.nameJa.toLowerCase().includes(q)) ||
        s.summary.toLowerCase().includes(q) ||
        categoryMeta[s.category].label.toLowerCase().includes(q)
      );
    });
  }, [cats, focusDay, spotQuery, selected]);

  const focusedDayPlan = useMemo(
    () => (focusDay !== null ? days.find((d) => d.day === focusDay) : undefined),
    [focusDay],
  );

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false, scrollWheelZoom: false }).setView([33.9, 133.4], 8);
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.polyline(routeLine, { color: '#0284c7', weight: 3, opacity: 0.65, dashArray: '6 8' }).addTo(m);
    markerLayer.current = L.layerGroup().addTo(m);
    map.current = m;
    m.on('click', () => m.scrollWheelZoom.enable());
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    dayRouteLayer.current?.remove();
    dayRouteLayer.current = null;
    if (focusDay !== null) {
      const dayPts = allSpots.filter((s) => s.day === focusDay).map((s) => [s.lat, s.lng] as [number, number]);
      if (dayPts.length > 1) {
        dayRouteLayer.current = L.polyline(dayPts, {
          color: '#f97316',
          weight: 4,
          opacity: 0.9,
        }).addTo(m);
      }
    }
  }, [focusDay]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    tileLayer.current?.remove();
    const layer = L.tileLayer(tiles[tile].url, { attribution: tiles[tile].attr, maxZoom: tiles[tile].maxZoom }).addTo(m);
    layer.bringToBack();
    tileLayer.current = layer;
    let loaded = 0;
    let failed = 0;
    layer.on('tileload', () => loaded++);
    layer.on('tileerror', () => {
      failed++;
      if (loaded === 0 && failed >= 4) {
        const keys = Object.keys(tiles) as TileKey[];
        const next = keys[(keys.indexOf(tile) + 1) % keys.length];
        if (next !== 'pale') setTile(next);
      }
    });
  }, [tile]);

  useEffect(() => {
    const layer = markerLayer.current;
    const m = map.current;
    if (!layer || !m) return;
    layer.clearLayers();
    visible.forEach((s) => {
      const isAct = selected?.id === s.id;
      const mk = L.marker([s.lat, s.lng], { icon: makeIcon(s, isAct), zIndexOffset: isAct ? 1000 : 0 });
      mk.bindTooltip(`Day ${s.day} · ${s.name}`, { direction: 'top', offset: [0, -14] });
      mk.on('click', () => {
        setSelectedId(s.id);
        setShowEmbed(false);
      });
      mk.addTo(layer);
    });
  }, [visible, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = map.current;
    if (!m || visible.length === 0 || selected) return;
    const b = L.latLngBounds(visible.map((s) => [s.lat, s.lng] as [number, number]));
    m.flyToBounds(b.pad(0.25), { maxZoom: 13, duration: 0.7 });
  }, [focusDay]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selected && map.current) {
      map.current.flyTo([selected.lat, selected.lng], Math.max(map.current.getZoom(), 13), { duration: 0.6 });
    }
  }, [selected]);

  const resetView = () => {
    onFocusDay(null);
    setSelectedId(null);
    setSpotQuery('');
    setCats(new Set(allCategories));
    if (map.current && routeLine.length > 0) {
      map.current.flyToBounds(L.latLngBounds(routeLine).pad(0.18), { duration: 0.7 });
    }
  };

  const toggleCat = (c: SpotCategory) =>
    setCats((prev) => {
      const n = new Set(prev);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });

  const selectedIndex = selected ? visible.findIndex((s) => s.id === selected.id) : -1;
  const prevSpot = selectedIndex > 0 ? visible[selectedIndex - 1] : null;
  const nextSpot = selectedIndex >= 0 && selectedIndex < visible.length - 1 ? visible[selectedIndex + 1] : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="relative overflow-hidden rounded-3xl bg-sky-50 shadow-sm ring-1 ring-slate-200/80">
        <div ref={el} className="h-[460px] w-full sm:h-[580px]" />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex flex-wrap items-start justify-between gap-2">
          <div className="pointer-events-auto flex max-w-full flex-wrap gap-1 rounded-2xl bg-white/92 p-1.5 shadow-md ring-1 ring-slate-200/70 backdrop-blur-md">
            {allCategories.map((c) => {
              const active = cats.has(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCat(c)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition ${
                    active
                      ? 'bg-slate-900/90 text-white shadow-xs'
                      : 'text-slate-400 line-through hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: categoryMeta[c].color }} />
                  {categoryMeta[c].label}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-auto flex items-center gap-1 rounded-2xl bg-white/92 p-1.5 text-xs shadow-md ring-1 ring-slate-200/70 backdrop-blur-md">
            <Layers className="mx-1 h-3.5 w-3.5 text-slate-500" />
            {(Object.keys(tiles) as TileKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setTile(k)}
                className={`rounded-lg px-2 py-1 transition ${
                  tile === k ? 'bg-sky-600 font-semibold text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tiles[k].label}
              </button>
            ))}
            <button
              onClick={resetView}
              title="重置全局视野"
              aria-label="重置全局视野"
              className="ml-0.5 rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 z-[500] overflow-x-auto rounded-2xl bg-white/92 p-1.5 shadow-md ring-1 ring-slate-200/70 backdrop-blur-md">
          <div className="flex w-max items-center gap-1">
            <button
              onClick={() => {
                onFocusDay(null);
                setSelectedId(null);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                focusDay === null ? 'bg-sky-600 font-semibold text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              全程 ({allSpots.length})
            </button>
            {days.map((d) => (
              <button
                key={d.day}
                onClick={() => {
                  onFocusDay(d.day);
                  setSelectedId(null);
                }}
                title={`Day ${d.day}: ${d.title}`}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono-num transition ${
                  focusDay === d.day ? 'bg-sky-600 font-semibold text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                D{d.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="flex min-h-[360px] flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
        {selected ? (
          <SpotDetail
            spot={selected}
            showEmbed={showEmbed}
            onToggleEmbed={() => setShowEmbed((v) => !v)}
            onClose={() => setSelectedId(null)}
            prevSpot={prevSpot}
            nextSpot={nextSpot}
            onSelectSpot={(s) => {
              setSelectedId(s.id);
              setShowEmbed(false);
            }}
            onJumpToDay={onJumpToDay}
          />
        ) : (
          <div className="flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPin className="h-4 w-4 shrink-0 text-sky-600" />
                <span>
                  {focusedDayPlan
                    ? `Day ${focusedDayPlan.day} · ${focusedDayPlan.city} (${visible.length})`
                    : `点位目录 (${visible.length}/${allSpots.length})`}
                </span>
              </div>
              {focusedDayPlan && onJumpToDay && (
                <button
                  onClick={() => onJumpToDay(focusedDayPlan.day)}
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200/80 transition hover:bg-sky-100"
                >
                  <Calendar className="h-3 w-3" /> 看当日时间轴
                </button>
              )}
            </div>

            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={spotQuery}
                onChange={(e) => setSpotQuery(e.target.value)}
                placeholder="搜索点位名称、日文或关键词…"
                aria-label="搜索地图点位"
                className="w-full rounded-xl bg-slate-50 py-2 pl-8 pr-8 text-xs text-slate-800 ring-1 ring-slate-200/80 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              {spotQuery && (
                <button
                  onClick={() => setSpotQuery('')}
                  aria-label="清除搜索"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <ul className="-mx-2 flex-1 space-y-1 overflow-y-auto pr-1 lg:max-h-[450px]">
              {visible.map((s) => {
                const meta = categoryMeta[s.category];
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-sky-50/70"
                    >
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono-num text-[11px] font-bold text-white shadow-xs transition group-hover:scale-105"
                        style={{ background: meta.color }}
                      >
                        {s.day}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800 group-hover:text-sky-700">
                          {s.name}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          D{s.day} {s.date} · {s.timeWindow ?? meta.label}
                        </span>
                      </span>
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}>
                        {meta.label}
                      </span>
                      {s.isNewAdded && (
                        <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
                          加密
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
              {visible.length === 0 && (
                <li className="py-12 text-center text-xs text-slate-500">
                  <p>当前筛选下没有匹配的点位</p>
                  <button
                    onClick={resetView}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    <RotateCcw className="h-3 w-3" /> 重置筛选条件
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function SpotDetail({
  spot,
  showEmbed,
  onToggleEmbed,
  onClose,
  prevSpot,
  nextSpot,
  onSelectSpot,
  onJumpToDay,
}: {
  spot: MapSpot;
  showEmbed: boolean;
  onToggleEmbed: () => void;
  onClose: () => void;
  prevSpot: MapSpot | null;
  nextSpot: MapSpot | null;
  onSelectSpot: (s: MapSpot) => void;
  onJumpToDay?: (day: number) => void;
}) {
  const meta = categoryMeta[spot.category];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-md px-2 py-0.5 font-medium ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}>
              {meta.glyph} {meta.label}
            </span>
            <span className="font-mono-num text-slate-500">Day {spot.day} · {spot.date}</span>
            {spot.isNewAdded && (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
                新增加密
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-bold text-slate-900">{spot.name}</h3>
          {spot.nameJa && <p className="text-xs text-slate-500">{spot.nameJa}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label="返回点位列表"
          title="返回点位列表"
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{spot.summary}</p>

      {(spot.timeWindow || spot.ticket || spot.transitInfo) && (
        <dl className="mt-3 space-y-1.5 rounded-2xl bg-slate-50 p-3 text-xs ring-1 ring-slate-200/60">
          {spot.timeWindow && <Row k="时间" v={spot.timeWindow} />}
          {spot.ticket && <Row k="票价" v={spot.ticket} />}
          {spot.transitInfo && <Row k="交通" v={spot.transitInfo} />}
        </dl>
      )}

      {spot.highlights && spot.highlights.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          {spot.highlights.slice(0, 4).map((h) => (
            <li key={h} className="flex gap-1.5">
              <span className="text-sky-600">•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}

      {spot.warning && (
        <p className="mt-3 rounded-xl bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200/80">
          ⚠️ {spot.warning}
        </p>
      )}

      {showEmbed && (
        <iframe
          title={spot.name}
          src={googleEmbedUrl(spot.lat, spot.lng)}
          className="mt-3 h-44 w-full rounded-xl border-0 ring-1 ring-slate-200"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      <div className="mt-auto space-y-2 pt-4">
        <div className="flex gap-2">
          <button
            onClick={onToggleEmbed}
            className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-800 transition hover:bg-slate-200"
          >
            {showEmbed ? '收起地图预览' : '内嵌地图预览'}
          </button>
          {onJumpToDay && (
            <button
              onClick={() => onJumpToDay(spot.day)}
              className="flex-1 rounded-xl bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 ring-1 ring-sky-200/80 transition hover:bg-sky-100"
            >
              Day {spot.day} 行程
            </button>
          )}
          <a
            href={googleMapsUrl(spot.googleMapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
          >
            <Navigation className="h-3.5 w-3.5" /> 导航 <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
          <button
            disabled={!prevSpot}
            onClick={() => prevSpot && onSelectSpot(prevSpot)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-600 transition hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate">{prevSpot ? `D${prevSpot.day} ${prevSpot.name}` : '已是首站'}</span>
          </button>
          <button
            disabled={!nextSpot}
            onClick={() => nextSpot && onSelectSpot(nextSpot)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-600 transition hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <span className="max-w-[120px] truncate">{nextSpot ? `D${nextSpot.day} ${nextSpot.name}` : '已是末站'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-8 shrink-0 font-medium text-slate-500">{k}</dt>
      <dd className="text-slate-700">{v}</dd>
    </div>
  );
}
