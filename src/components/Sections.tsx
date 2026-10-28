import { useEffect, useState } from 'react';
import { AlertTriangle, Anchor, Camera, CheckCircle2, Circle, Clock, ExternalLink, Ticket, TrainFront } from 'lucide-react';
import { militarySites } from '../data/militaryData';
import { anime, checklist, transportTips } from '../data/itineraryData';
import { dailyTideAndSunData, moonPhases2027June } from '../data/tideAndSunData';
import { googleMapsUrl } from '../lib/categories';

export function SectionTitle({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold tracking-[0.3em] text-amber-400">{kicker}</div>
      <h2 className="mt-2 font-serif-jp text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      {desc && <p className="mt-2 max-w-3xl text-sm text-slate-400">{desc}</p>}
    </div>
  );
}

const eras = ['全部', '明治陆海军', '二战太平洋战史', '现代海上/陆上自卫队', '中世/近世城郭防卫'] as const;

export function MilitarySection() {
  const [era, setEra] = useState<(typeof eras)[number]>('全部');
  const list = militarySites.filter((m) => era === '全部' || m.era === era).sort((a, b) => a.day - b.day);
  return (
    <section id="military" className="scroll-mt-20">
      <SectionTitle kicker="MILITARY" title={`军事博物馆与遗迹 · ${militarySites.length} 处`} desc="从明治陆军第 11 师团、旧海军兵学校，到二战特攻基地、毒气岛与现役海自基地。开放日、预约与着装规则都已标注。" />
      <div className="mb-4 flex flex-wrap gap-2">
        {eras.map((e) => (
          <button key={e} onClick={() => setEra(e)} className={`rounded-full px-3 py-1.5 text-xs ${era === e ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            {e}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((m) => (
          <article key={m.id} className="flex flex-col rounded-3xl bg-gradient-to-b from-rose-500/[0.07] to-transparent p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-rose-200">{m.tag}</span>
              <span className="font-mono-num text-slate-400">D{m.day} · {m.region}</span>
            </div>
            <h3 className="mt-3 font-semibold text-white">{m.nameZh}</h3>
            <p className="text-xs text-slate-500">{m.nameJa}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{m.highlight}</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-400">
              {m.exhibits.slice(0, 3).map((x) => (
                <li key={x} className="flex gap-1.5"><Anchor className="mt-0.5 h-3 w-3 shrink-0 text-rose-300" />{x}</li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 text-xs text-slate-300">
              <p className="flex gap-1.5"><Clock className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" />{m.hours} · 休 {m.closedDays}</p>
              <p className="flex gap-1.5"><Ticket className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" />{m.price}</p>
              <p className="flex gap-1.5"><TrainFront className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" />{m.transitGuide}</p>
            </div>
            {(m.status2027Alert || m.bookingOrRuleWarning) && (
              <p className="mt-3 flex gap-1.5 rounded-xl bg-amber-400/10 p-2.5 text-xs text-amber-100">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                {m.status2027Alert ?? m.bookingOrRuleWarning}
              </p>
            )}
            <a href={googleMapsUrl(m.googleMapsQuery)} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1 pt-4 text-xs text-rose-300 hover:text-rose-200">
              Google 地图 <ExternalLink className="h-3 w-3" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AnimeSection() {
  return (
    <section id="anime" className="scroll-mt-20">
      <SectionTitle kicker="PILGRIMAGE" title={`动漫巡礼 · ${anime.length} 部作品`} desc="全部嵌进主线，不需要额外绕路。每部附机位建议。" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {anime.map((a) => (
          <article key={a.id} className="group rounded-3xl bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/5 p-5 ring-1 ring-white/10 transition hover:ring-violet-400/40">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-violet-200">{a.genre}</span>
              <span className="font-mono-num text-slate-400">{a.dayLabel}</span>
            </div>
            <h3 className="mt-3 font-semibold text-white">{a.title}</h3>
            <p className="text-xs text-slate-500">{a.titleJa}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.spots.map((s) => (
                <span key={s} className="rounded-lg bg-white/5 px-2 py-0.5 text-xs text-slate-300">{s}</span>
              ))}
            </div>
            <p className="mt-3 flex gap-1.5 text-xs text-slate-400"><Camera className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />{a.shotGuide}</p>
            <a href={googleMapsUrl(a.googleMapsQuery)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200">
              打开地点 <ExternalLink className="h-3 w-3" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TideTable() {
  return (
    <section id="tides" className="scroll-mt-20">
      <SectionTitle kicker="TIDE & LIGHT" title="14 天潮汐 · 日出日落总表" desc="时间均为日本标准时间 (JST, UTC+9)。潮位以各站基准面计。" />
      <div className="mb-4 flex flex-wrap gap-2">
        {moonPhases2027June.map((m) => (
          <div key={m.phase} className="rounded-2xl bg-white/[0.04] px-3 py-2 text-xs ring-1 ring-white/10">
            <div className="font-semibold text-white">{m.phase}</div>
            <div className="font-mono-num text-slate-400">{m.time}</div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-3xl ring-1 ring-white/10">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-white/[0.05] text-slate-400">
            <tr>
              {['日期', '地点 / 潮位站', '潮型', '日出', '日落', '满潮', '干潮', '最佳窗口'].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono-num">
            {dailyTideAndSunData.map((d) => (
              <tr key={d.day} className="hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-200">D{d.day} · {d.date.slice(5)} {d.weekday}</td>
                <td className="px-3 py-2.5 font-sans text-slate-300">{d.city}<div className="text-slate-500">{d.tideStation}</div></td>
                <td className="px-3 py-2.5"><span className={`rounded-md px-1.5 py-0.5 font-sans ${d.tideType === '大潮' ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/5 text-slate-300'}`}>{d.tideType}</span></td>
                <td className="px-3 py-2.5 text-amber-300">{d.sunrise}</td>
                <td className="px-3 py-2.5 text-orange-400">{d.sunset}</td>
                <td className="px-3 py-2.5 text-cyan-200">{d.highTides.map((t) => `${t.time} (${t.heightCm})`).join(' / ')}</td>
                <td className="px-3 py-2.5 text-slate-400">{d.lowTides.map((t) => `${t.time} (${t.heightCm})`).join(' / ')}</td>
                <td className="max-w-[240px] px-3 py-2.5 font-sans text-slate-300">{d.specialWindow?.bestWindow}</td>
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
  return (
    <section id="prep" className="scroll-mt-20 grid gap-6 lg:grid-cols-2">
      <div>
        <SectionTitle kicker="TRANSIT" title="交通票券建议" />
        <div className="space-y-3">
          {transportTips.map((t) => (
            <div key={t.title} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
              <h3 className="text-sm font-semibold text-white">{t.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle kicker="CHECKLIST" title={`出发清单 ${count}/${checklist.length}`} />
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${(count / checklist.length) * 100}%` }} />
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {checklist.map((c, i) => (
            <li key={c}>
              <button onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs ring-1 transition ${done[i] ? 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/30' : 'bg-white/[0.03] text-slate-300 ring-white/10 hover:bg-white/[0.06]'}`}>
                {done[i] ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Circle className="h-4 w-4 shrink-0 text-slate-500" />}
                <span className={done[i] ? 'line-through' : ''}>{c}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
