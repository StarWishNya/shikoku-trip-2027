import { useEffect, useState } from 'react';
import { AlertTriangle, Anchor, Calendar, Camera, CheckCircle2, Circle, Clock, ExternalLink, MapPin, RotateCcw, Ticket, TrainFront } from 'lucide-react';
import { militarySites } from '../data/militaryData';
import { anime, checklist, transportTips } from '../data/itineraryData';
import { dailyTideAndSunData, moonPhases2027June } from '../data/tideAndSunData';
import { allSpots } from '../lib/allSpots';
import { googleMapsUrl } from '../lib/categories';

export function SectionTitle({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold tracking-[0.3em] text-sky-600">{kicker}</div>
      <h2 className="mt-2 font-serif-jp text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
      {desc && <p className="mt-2 max-w-3xl text-sm text-slate-500">{desc}</p>}
    </div>
  );
}

const eras = ['全部', '明治陆海军', '二战太平洋战史', '现代海上/陆上自卫队', '中世/近世城郭防卫'] as const;

export function MilitarySection({
  onLocateSpot,
  onJumpToDay,
}: {
  onLocateSpot?: (spotId: string, day: number) => void;
  onJumpToDay?: (day: number) => void;
}) {
  const [era, setEra] = useState<(typeof eras)[number]>('全部');
  const list = militarySites.filter((m) => era === '全部' || m.era === era).sort((a, b) => a.day - b.day);

  return (
    <section id="military" className="scroll-mt-20">
      <SectionTitle
        kicker="MILITARY"
        title={`军事博物馆与遗迹 · ${militarySites.length} 处`}
        desc="从明治陆军第 11 师团、旧海军兵学校，到二战特攻基地、毒气岛与现役海自基地。开放日、预约与着装规则都已标注。"
      />
      <div className="no-print mb-5 flex flex-wrap gap-2">
        {eras.map((e) => {
          const count = e === '全部' ? militarySites.length : militarySites.filter((m) => m.era === e).length;
          const active = era === e;
          return (
            <button
              key={e}
              onClick={() => setEra(e)}
              aria-pressed={active}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                active
                  ? 'bg-rose-600 font-semibold text-white shadow-xs'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200/80 hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200'
              }`}
            >
              {e} <span className={`ml-0.5 font-mono-num ${active ? 'text-rose-100' : 'text-slate-400'}`}>({count})</span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((m) => (
          <article
            key={m.id}
            className="flex flex-col rounded-3xl bg-white bg-gradient-to-b from-rose-50/70 via-white to-white p-5 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md hover:ring-rose-300/70"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="rounded-md bg-rose-100/90 px-2 py-0.5 font-medium text-rose-700">{m.tag}</span>
              <span className="font-mono-num text-slate-500">D{m.day} · {m.region}</span>
            </div>
            <h3 className="mt-3 font-serif-jp text-base font-bold text-slate-900">{m.nameZh}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{m.nameJa}</p>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{m.highlight}</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {m.exhibits.map((x) => (
                <li key={x} className="flex gap-1.5">
                  <Anchor className="mt-0.5 h-3 w-3 shrink-0 text-rose-600" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 rounded-2xl bg-slate-50/80 p-3 text-xs text-slate-600 ring-1 ring-slate-200/50">
              <p className="flex gap-1.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span>
                  {m.hours} · 休 {m.closedDays}
                </span>
              </p>
              <p className="flex gap-1.5">
                <Ticket className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span>{m.price}</span>
              </p>
              <p className="flex gap-1.5">
                <TrainFront className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span>{m.transitGuide}</span>
              </p>
            </div>
            {(m.status2027Alert || m.bookingOrRuleWarning) && (
              <p className="mt-3 flex gap-1.5 rounded-xl bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200/70">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>{m.status2027Alert ?? m.bookingOrRuleWarning}</span>
              </p>
            )}
            <div className="no-print mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs">
              {onLocateSpot && (
                <button
                  onClick={() => onLocateSpot(m.id, m.day)}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 font-medium text-rose-700 ring-1 ring-rose-200/80 transition hover:bg-rose-100"
                >
                  <MapPin className="h-3 w-3" /> 地图定位
                </button>
              )}
              {onJumpToDay && (
                <button
                  onClick={() => onJumpToDay(m.day)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  <Calendar className="h-3 w-3" /> D{m.day} 行程
                </button>
              )}
              <a
                href={googleMapsUrl(m.googleMapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 font-medium text-rose-600 hover:text-rose-700"
              >
                Google 地图 <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AnimeSection({
  onLocateSpot,
  onJumpToDay,
}: {
  onLocateSpot?: (spotId: string, day: number) => void;
  onJumpToDay?: (day: number) => void;
}) {
  return (
    <section id="anime" className="scroll-mt-20">
      <SectionTitle
        kicker="PILGRIMAGE"
        title={`动漫巡礼 · ${anime.length} 部作品`}
        desc="全部嵌进主线，不需要额外绕路。每部附机位建议，可直接定位到地图或跳转对应日期。"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {anime.map((a) => {
          const matchedSpot = allSpots.find(
            (s) => Math.abs(s.lat - a.lat) < 0.001 && Math.abs(s.lng - a.lng) < 0.001,
          );
          return (
            <article
              key={a.id}
              className="group flex flex-col rounded-3xl bg-white bg-gradient-to-br from-violet-50/80 via-white to-fuchsia-50/60 p-5 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md hover:ring-violet-300"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-md bg-violet-100 px-2 py-0.5 font-medium text-violet-700">{a.genre}</span>
                <span className="font-mono-num text-slate-500">D{a.dayNumber} · {a.dayLabel}</span>
              </div>
              <h3 className="mt-3 font-serif-jp text-base font-bold text-slate-900">{a.title}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{a.titleJa}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.spots.map((s) => (
                  <span key={s} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-3 flex gap-1.5 rounded-xl bg-violet-50/60 p-2.5 text-xs text-slate-600 ring-1 ring-violet-100">
                <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />
                <span>机位：{a.shotGuide}</span>
              </p>
              <div className="no-print mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs">
                {matchedSpot && onLocateSpot && (
                  <button
                    onClick={() => onLocateSpot(matchedSpot.id, a.dayNumber)}
                    className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1.5 font-medium text-violet-700 ring-1 ring-violet-200/80 transition hover:bg-violet-100"
                  >
                    <MapPin className="h-3 w-3" /> 地图定位
                  </button>
                )}
                {onJumpToDay && (
                  <button
                    onClick={() => onJumpToDay(a.dayNumber)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    <Calendar className="h-3 w-3" /> D{a.dayNumber} 行程
                  </button>
                )}
                <a
                  href={googleMapsUrl(a.googleMapsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 font-medium text-violet-600 hover:text-violet-700"
                >
                  打开地点 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function TideTable({ onJumpToDay }: { onJumpToDay?: (day: number) => void }) {
  return (
    <section id="tides" className="scroll-mt-20">
      <SectionTitle
        kicker="TIDE & LIGHT"
        title="14 天潮汐 · 日出日落总表"
        desc="时间均为日本标准时间 (JST, UTC+9)。潮位以各站基准面计，点击任意行可跳转至对应日期的分钟级行程。"
      />
      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {moonPhases2027June.map((m) => (
          <div key={m.phase} className="rounded-2xl bg-white p-3.5 text-xs shadow-sm ring-1 ring-slate-200/80">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">{m.phase}</span>
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200/70">
                {m.lunar}
              </span>
            </div>
            <div className="mt-1 font-mono-num text-slate-500">{m.time}</div>
            <div className="mt-1.5 text-[11px] leading-snug text-slate-600">{m.note}</div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/80">
        <table className="w-full min-w-[780px] text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-slate-600">
            <tr>
              {['日期', '地点 / 潮位站', '潮型', '日出', '日落', '满潮', '干潮', '最佳窗口'].map((h) => (
                <th key={h} className="px-3.5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-num">
            {dailyTideAndSunData.map((d) => (
              <tr
                key={d.day}
                onClick={() => onJumpToDay?.(d.day)}
                className={`transition hover:bg-sky-50/70 ${onJumpToDay ? 'cursor-pointer' : ''}`}
                title={onJumpToDay ? `点击查看 Day ${d.day} 行程` : undefined}
              >
                <td className="whitespace-nowrap px-3.5 py-2.5 font-semibold text-slate-800">
                  <span className="inline-block w-7 rounded bg-sky-50 px-1 py-0.5 text-center text-[11px] font-bold text-sky-700 ring-1 ring-sky-200/60">
                    D{d.day}
                  </span>{' '}
                  {d.date.slice(5)} {d.weekday}
                </td>
                <td className="px-3.5 py-2.5 font-sans text-slate-700">
                  <div className="font-medium">{d.city}</div>
                  <div className="text-[11px] text-slate-500">{d.tideStation}</div>
                </td>
                <td className="px-3.5 py-2.5">
                  <span
                    className={`rounded-md px-2 py-0.5 font-sans font-medium ${
                      d.tideType === '大潮'
                        ? 'bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200'
                        : d.tideType === '中潮'
                          ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/70'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {d.tideType}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 font-semibold text-amber-600">{d.sunrise}</td>
                <td className="px-3.5 py-2.5 font-semibold text-orange-500">{d.sunset}</td>
                <td className="px-3.5 py-2.5 text-cyan-700">{d.highTides.map((t) => `${t.time} (${t.heightCm})`).join(' / ')}</td>
                <td className="px-3.5 py-2.5 text-slate-500">{d.lowTides.map((t) => `${t.time} (${t.heightCm})`).join(' / ')}</td>
                <td className="max-w-[260px] px-3.5 py-2.5 font-sans text-slate-600">{d.specialWindow?.bestWindow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const STORE_KEY = 'shikoku-2027-pro-checklist';

export function PrepSection() {
  const [done, setDone] = useState<Record<number, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
    } catch {
      return {};
    }
  });
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(done));
  }, [done]);
  const count = Object.values(done).filter(Boolean).length;
  const pct = Math.round((count / checklist.length) * 100);

  return (
    <section id="prep" className="scroll-mt-20 grid gap-6 lg:grid-cols-2">
      <div>
        <SectionTitle kicker="TRANSIT" title="交通票券建议" />
        <div className="space-y-3">
          {transportTips.map((t) => (
            <div key={t.title} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-sky-200">
              <h3 className="text-sm font-semibold text-slate-900">{t.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold tracking-[0.3em] text-sky-600">CHECKLIST</div>
            <h2 className="mt-2 font-serif-jp text-2xl font-bold text-slate-900 sm:text-3xl">
              出发清单 <span className="font-mono-num text-sky-600">{count}/{checklist.length}</span>
            </h2>
          </div>
          <div className="no-print flex items-center gap-2 text-xs">
            <span className="font-mono-num font-semibold text-slate-500">{pct}%</span>
            {count > 0 && (
              <button
                onClick={() => setDone({})}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <RotateCcw className="h-3 w-3" /> 重置
              </button>
            )}
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200/70">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {checklist.map((c, i) => (
            <li key={c}>
              <button
                onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                aria-pressed={Boolean(done[i])}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs ring-1 transition ${
                  done[i]
                    ? 'bg-emerald-50 font-medium text-emerald-800 ring-emerald-300'
                    : 'bg-white text-slate-700 shadow-2xs ring-slate-200/80 hover:bg-slate-50 hover:ring-sky-300'
                }`}
              >
                {done[i] ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                )}
                <span className={done[i] ? 'line-through decoration-emerald-600/60' : ''}>{c}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
