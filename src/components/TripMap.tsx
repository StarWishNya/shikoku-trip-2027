import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { ExternalLink, Layers, MapPin, Navigation, X } from 'lucide-react';
import { allSpots } from '../lib/allSpots';
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

const spotById = new Map(allSpots.map((s) => [s.id, s]));

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

export default function TripMap({ focusDay, onFocusDay }: { focusDay: number | null; onFocusDay: (d: number | null) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);
  const [tile, setTile] = useState<TileKey>('pale');
  const [cats, setCats] = useState<Set<SpotCategory>>(new Set(['military', 'anime', 'scenic', 'food', 'transport']));
  const [selected, setSelected] = useState<MapSpot | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);

  const visible = useMemo(
    () => allSpots.filter((s) => cats.has(s.category) && (focusDay === null || s.day === focusDay)),
    [cats, focusDay],
  );

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false, scrollWheelZoom: false }).setView([33.9, 133.4], 8);
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.polyline(routeLine, { color: '#0284c7', weight: 3, opacity: 0.75, dashArray: '6 8' }).addTo(m);
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
      const mk = L.marker([s.lat, s.lng], { icon: makeIcon(s, selected?.id === s.id), zIndexOffset: selected?.id === s.id ? 1000 : 0 });
      mk.bindTooltip(`Day ${s.day} · ${s.name}`, { direction: 'top', offset: [0, -14] });
      mk.on('click', () => {
        setSelected(s);
        setShowEmbed(false);
      });
      mk.addTo(layer);
    });
  }, [visible, selected]);

  useEffect(() => {
    const m = map.current;
    if (!m || visible.length === 0) return;
    const b = L.latLngBounds(visible.map((s) => [s.lat, s.lng] as [number, number]));
    m.flyToBounds(b.pad(0.25), { maxZoom: 13, duration: 0.8 });
  }, [focusDay, visible.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selected && map.current) map.current.flyTo([selected.lat, selected.lng], Math.max(map.current.getZoom(), 12), { duration: 0.6 });
  }, [selected]);

  const toggleCat = (c: SpotCategory) =>
    setCats((prev) => {
      const n = new Set(prev);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="relative overflow-hidden rounded-3xl ring-1 ring-slate-200/80">
        <div ref={el} className="h-[460px] w-full sm:h-[560px]" />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex flex-wrap items-start justify-between gap-2">
          <div className="pointer-events-auto flex flex-wrap gap-1.5 rounded-2xl bg-white/90 shadow-md p-1.5 backdrop-blur">
            {(Object.keys(categoryMeta) as SpotCategory[]).map((c) => (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition ${cats.has(c) ? 'bg-slate-100 text-slate-900' : 'text-slate-500 line-through'}`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: categoryMeta[c].color }} />
                {categoryMeta[c].label}
              </button>
            ))}
          </div>
          <div className="pointer-events-auto flex items-center gap-1 rounded-2xl bg-white/90 shadow-md p-1.5 text-xs backdrop-blur">
            <Layers className="mx-1 h-3.5 w-3.5 text-slate-500" />
            {(Object.keys(tiles) as TileKey[]).map((k) => (
              <button key={k} onClick={() => setTile(k)} className={`rounded-lg px-2 py-1 ${tile === k ? 'bg-sky-600 font-semibold text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {tiles[k].label}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 z-[500] overflow-x-auto rounded-2xl bg-white/90 shadow-md p-1.5 backdrop-blur">
          <div className="flex w-max gap-1">
            <button onClick={() => onFocusDay(null)} className={`rounded-lg px-2.5 py-1 text-xs ${focusDay === null ? 'bg-sky-600 font-semibold text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              全程
            </button>
            {days.map((d) => (
              <button key={d.day} onClick={() => onFocusDay(d.day)} className={`rounded-lg px-2.5 py-1 text-xs font-mono-num ${focusDay === d.day ? 'bg-sky-600 font-semibold text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                D{d.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="flex min-h-[300px] flex-col rounded-3xl bg-white shadow-sm p-5 ring-1 ring-slate-200/80">
        {selected ? (
          <SpotDetail spot={selected} showEmbed={showEmbed} onToggleEmbed={() => setShowEmbed((v) => !v)} onClose={() => setSelected(null)} />
        ) : (
          <div className="flex h-full flex-col">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-sky-600" />
              {focusDay ? `Day ${focusDay} · ${visible.length} 个点位` : `全程 ${visible.length} 个点位`}
            </div>
            <ul className="-mx-2 flex-1 space-y-1 overflow-y-auto pr-1 lg:max-h-[480px]">
              {visible.map((s) => (
                <li key={s.id}>
                  <button onClick={() => setSelected(s)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-100">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: categoryMeta[s.category].color }}>
                      {s.day}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-800">{s.name}</span>
                      <span className="block truncate text-xs text-slate-500">{s.timeWindow ?? categoryMeta[s.category].label}</span>
                    </span>
                    {s.isNewAdded && <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-600">新增</span>}
                  </button>
                </li>
              ))}
              {visible.length === 0 && <li className="py-10 text-center text-sm text-slate-500">当前筛选下没有点位，打开上方分类试试。</li>}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function SpotDetail({ spot, showEmbed, onToggleEmbed, onClose }: { spot: MapSpot; showEmbed: boolean; onToggleEmbed: () => void; onClose: () => void }) {
  const meta = categoryMeta[spot.category];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`rounded-md px-2 py-0.5 ${meta.bg} ${meta.text}`}>{meta.label}</span>
            <span className="text-slate-500">Day {spot.day} · {spot.date}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{spot.name}</h3>
          {spot.nameJa && <p className="text-sm text-slate-500">{spot.nameJa}</p>}
        </div>
        <button onClick={onClose} aria-label="关闭" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{spot.summary}</p>
      <dl className="mt-3 space-y-1.5 text-xs">
        {spot.timeWindow && <Row k="时间" v={spot.timeWindow} />}
        {spot.ticket && <Row k="票价" v={spot.ticket} />}
        {spot.transitInfo && <Row k="交通" v={spot.transitInfo} />}
      </dl>
      {spot.highlights && (
        <ul className="mt-3 space-y-1 text-xs text-slate-500">
          {spot.highlights.slice(0, 4).map((h) => (
            <li key={h}>· {h}</li>
          ))}
        </ul>
      )}
      {spot.warning && <p className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700">{spot.warning}</p>}
      {showEmbed && (
        <iframe title={spot.name} src={googleEmbedUrl(spot.lat, spot.lng)} className="mt-3 h-48 w-full rounded-xl border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      )}
      <div className="mt-auto flex gap-2 pt-4">
        <button onClick={onToggleEmbed} className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-900 hover:bg-slate-200">
          {showEmbed ? '收起街景地图' : 'Google 地图预览'}
        </button>
        <a href={googleMapsUrl(spot.googleMapsQuery)} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500">
          <Navigation className="h-3.5 w-3.5" /> 导航 <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-8 shrink-0 text-slate-500">{k}</dt>
      <dd className="text-slate-700">{v}</dd>
    </div>
  );
}
