import { useEffect, useMemo, useRef, useState } from 'react';
import { Anchor, ArrowUp, Check, Copy, Map as MapIcon, Printer, RotateCcw, Search, Share2, Sparkles, Sunset, Waves, X } from 'lucide-react';
import TripMap from './components/TripMap';
import DayCard from './components/DayCard';
import { AnimeSection, MilitarySection, PrepSection, SectionTitle, TideTable } from './components/Sections';
import { days, tripMeta, anime } from './data/itineraryData';
import { dailyTideAndSunData } from './data/tideAndSunData';
import { militarySites } from './data/militaryData';
import { allSpots } from './lib/allSpots';

const regions = ['全部', '香川', '德岛', '高知', '爱媛', '广岛'] as const;
const nav = [
  ['#map', '地图'],
  ['#itinerary', '行程'],
  ['#military', '军事'],
  ['#anime', '巡礼'],
  ['#tides', '潮汐'],
  ['#prep', '准备'],
] as const;

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  return { days: Math.floor(diff / 86_400_000), hours: Math.floor((diff / 3_600_000) % 24) };
}

export default function App() {
  const countdown = useCountdown(tripMeta.start);
  const [region, setRegion] = useState<(typeof regions)[number]>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState<Set<number>>(new Set([1]));
  const [focusDay, setFocusDay] = useState<number | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('#map');
  const [showBackTop, setShowBackTop] = useState(false);
  const mapRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowBackTop(window.scrollY > 520);
      const ids = nav.map(([h]) => h.slice(1));
      let current = '#map';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) {
          current = `#${id}`;
        }
      }
      setActiveNav(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const sunByDay = useMemo(() => new Map(dailyTideAndSunData.map((d) => [d.day, d])), []);

  const visibleDays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return days.filter((d) => {
      if (region !== '全部' && d.region !== region) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.theme.toLowerCase().includes(q) ||
        d.note.toLowerCase().includes(q) ||
        d.stops.some((s) => s.title.toLowerCase().includes(q) || (s.detail && s.detail.toLowerCase().includes(q)))
      );
    });
  }, [region, searchQuery]);

  const totalStops = days.reduce((n, d) => n + d.stops.length, 0);
  const newStops = days.reduce((n, d) => n + d.stops.filter((s) => s.isNew).length, 0);

  const toggle = (d: number) =>
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });

  const showOnMap = (d: number) => {
    setFocusDay(d);
    setSelectedSpotId(null);
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const locateSpotOnMap = (spotId: string, day: number) => {
    setFocusDay(day);
    setSelectedSpotId(spotId);
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const jumpToDay = (day: number) => {
    setRegion('全部');
    setSearchQuery('');
    setOpen((prev) => {
      const next = new Set(prev);
      next.add(day);
      return next;
    });
    requestAnimationFrame(() => {
      document.getElementById(`day-${day}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const copyText = async () => {
    const text = days
      .map((d) => `Day ${d.day} ${d.shortDate} ${d.title}\n` + d.stops.map((s) => `  ${s.time} ${s.title}`).join('\n'))
      .join('\n\n');
    await navigator.clipboard.writeText(`${tripMeta.title}\n${tripMeta.dateRange}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (navigator.share) await navigator.share({ title: tripMeta.title, url: location.href }).catch(() => {});
    else {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-700">
      <header className="no-print sticky top-0 z-[1000] border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-4 sm:py-3">
          <a href="#top" className="flex shrink-0 items-center gap-2 font-serif-jp text-sm font-bold text-slate-900">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xs">
              <Waves className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">四国 · 濑户内 2027</span>
          </a>
          <nav aria-label="主导航" className="flex gap-0.5 overflow-x-auto text-xs sm:text-sm">
            {nav.map(([h, l]) => {
              const active = activeNav === h;
              return (
                <a
                  key={h}
                  href={h}
                  onClick={() => setActiveNav(h)}
                  className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 font-medium transition ${
                    active
                      ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/70'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {l}
                </a>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <IconBtn onClick={copyText} label="复制行程">
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </IconBtn>
            <IconBtn onClick={share} label="分享链接">
              <Share2 className="h-4 w-4" />
            </IconBtn>
            <span className="hidden sm:inline-flex">
              <IconBtn onClick={() => window.print()} label="打印行程">
                <Printer className="h-4 w-4" />
              </IconBtn>
            </span>
          </div>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-50 to-[#f5f8fb]" />
        <svg className="absolute bottom-0 left-0 w-full text-[#f5f8fb]" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0,64 C240,112 480,16 720,48 C960,80 1200,120 1440,72 L1440,120 L0,120 Z" />
        </svg>
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-12 sm:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-orange-600 shadow-sm ring-1 ring-orange-200">
            <Sparkles className="h-3.5 w-3.5" /> PRO 加密版 · 军事 + 巡礼 + 潮汐精算 · {tripMeta.dateRange}
          </div>
          <h1 className="mt-5 font-serif-jp text-4xl font-black leading-tight text-slate-900 sm:text-6xl">
            {tripMeta.title.replace(' PRO', '')}
            <span className="mt-1 block bg-gradient-to-r from-sky-600 via-cyan-500 to-orange-500 bg-clip-text text-transparent">
              {tripMeta.subtitle}
            </span>
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">{tripMeta.route}</p>

          <div className="mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat big={`${countdown.days}`} unit="天" label={`距出发 · ${countdown.hours} 小时`} />
            <Stat big={`${totalStops}`} unit="站" label={`其中 ${newStops} 站为新增加密`} />
            <Stat big={`${militarySites.length}`} unit="处" label="军事博物馆与遗迹" icon={<Anchor className="h-4 w-4 text-rose-600" />} />
            <Stat big={`${anime.length}`} unit="部" label="动漫巡礼作品" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#itinerary"
              className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
            >
              查看 14 天行程
            </a>
            <a
              href="#map"
              className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-sky-50 hover:ring-sky-200"
            >
              <MapIcon className="h-4 w-4 text-sky-600" /> {allSpots.length} 个地图点位
            </a>
            <a
              href="#tides"
              className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-sky-50 hover:ring-sky-200"
            >
              <Sunset className="h-4 w-4 text-orange-500" /> 潮汐日落表
            </a>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-20 px-4 pb-24">
        <section id="map" ref={mapRef} className="scroll-mt-20">
          <SectionTitle
            kicker="INTERACTIVE MAP"
            title="全程点位地图"
            desc="数字 = 第几天。按分类和日期筛选，点击点位看开放时间、票价、交通与 Google 地图预览。虚线为全程顺序，橙色实线为选中日期路线。"
          />
          <TripMap
            focusDay={focusDay}
            onFocusDay={setFocusDay}
            selectedSpotId={selectedSpotId}
            onSelectSpotId={setSelectedSpotId}
            onJumpToDay={jumpToDay}
          />
        </section>

        <section id="itinerary" className="scroll-mt-20">
          <SectionTitle
            kicker="ITINERARY"
            title="14 天分钟级行程"
            desc="每一站都写了班次、时刻与票价；带 NEW 的是比原版新增的加密内容，带「潮汐/光线」的是踩准潮位或日落的时间点，点击「定位」可在地图高亮。"
          />

          <div className="no-print mb-4 space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {regions.map((r) => {
                  const count = r === '全部' ? days.length : days.filter((d) => d.region === r).length;
                  const active = region === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setRegion(r)}
                      aria-pressed={active}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'bg-sky-600 font-semibold text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                      }`}
                    >
                      {r} <span className={`font-mono-num ${active ? 'text-sky-100' : 'text-slate-400'}`}>({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="relative min-w-[200px] flex-1 sm:w-60">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索景点、城市、班次或美食…"
                    aria-label="搜索行程内容"
                    className="w-full rounded-xl bg-slate-50 py-1.5 pl-8 pr-7 text-xs text-slate-800 ring-1 ring-slate-200/80 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      aria-label="清除行程搜索"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setOpen(new Set(days.map((d) => d.day)))}
                  className="rounded-xl bg-slate-100 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-200/80"
                >
                  全部展开
                </button>
                <button
                  onClick={() => setOpen(new Set())}
                  className="rounded-xl bg-slate-100 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-200/80"
                >
                  全部收起
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
              <span className="shrink-0 text-slate-400">快速跳转：</span>
              {days.map((d) => (
                <button
                  key={d.day}
                  onClick={() => jumpToDay(d.day)}
                  title={`Day ${d.day} (${d.shortDate} ${d.city}): ${d.title}`}
                  className={`shrink-0 rounded-lg px-2 py-1 font-mono-num transition ${
                    open.has(d.day)
                      ? 'bg-amber-50 font-semibold text-amber-800 ring-1 ring-amber-200/80 hover:bg-amber-100'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  D{d.day} <span className="hidden font-sans text-[10px] text-slate-400 sm:inline">{d.city.split(' · ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {visibleDays.map((d) => (
              <DayCard
                key={d.day}
                plan={d}
                sun={sunByDay.get(d.day)}
                open={isSearching || open.has(d.day)}
                onToggle={() => toggle(d.day)}
                onShowMap={() => showOnMap(d.day)}
                onLocateSpot={locateSpotOnMap}
              />
            ))}
            {visibleDays.length === 0 && (
              <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/80">
                <p>没有找到包含「{searchQuery}」的行程日</p>
                <button
                  onClick={() => {
                    setRegion('全部');
                    setSearchQuery('');
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> 重置筛选
                </button>
              </div>
            )}
          </div>
        </section>

        <MilitarySection onLocateSpot={locateSpotOnMap} onJumpToDay={jumpToDay} />
        <AnimeSection onLocateSpot={locateSpotOnMap} onJumpToDay={jumpToDay} />
        <TideTable onJumpToDay={jumpToDay} />
        <PrepSection />

        <footer className="rounded-3xl bg-slate-50 p-6 text-xs leading-relaxed text-slate-500 ring-1 ring-slate-200/80">
          <p className="font-semibold text-slate-600">数据说明</p>
          <p className="mt-2">
            交通时刻为 2026 年时刻表推算的参考班次，2027 年 3 月 JR 时刻改正后请以 JR 四国 / JR 西日本、各船公司官网为准。潮汐为调和常数模型推算，出行前请用日本气象厅潮位表复核；日出日落按各地经纬度计算，误差 ±1 分钟。所有时间均为日本标准时间 (JST, UTC+9)。
          </p>
          <p className="mt-2">地图：© OpenStreetMap contributors · CARTO · Esri · 国土地理院 · Google Maps。</p>
        </footer>
      </main>

      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="回到顶部"
          title="回到顶部"
          className="no-print fixed bottom-6 right-6 z-[900] grid h-11 w-11 place-items-center rounded-full bg-slate-900/90 text-white shadow-lg ring-1 ring-white/20 backdrop-blur transition hover:scale-105 hover:bg-sky-600"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function Stat({ big, unit, label, icon }: { big: string; unit: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 backdrop-blur transition hover:shadow-md hover:ring-sky-200">
      <div className="flex items-baseline gap-1">
        <span className="font-mono-num text-3xl font-black text-slate-900">{big}</span>
        <span className="text-sm text-slate-500">{unit}</span>
        {icon && <span className="ml-auto">{icon}</span>}
      </div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </button>
  );
}
