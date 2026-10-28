import { ChevronDown, MapPin, Moon, Sparkles, Sun, Sunrise, Sunset, Waves } from 'lucide-react';
import type { DailyTideAndSun, DayPlan } from '../data/types';
import { categoryMeta } from '../lib/categories';

const badgeTone = {
  amber: 'from-amber-500/20 to-orange-500/5 ring-amber-400/30 text-amber-200',
  cyan: 'from-cyan-500/20 to-sky-500/5 ring-cyan-400/30 text-cyan-200',
  emerald: 'from-emerald-500/20 to-teal-500/5 ring-emerald-400/30 text-emerald-200',
  rose: 'from-rose-500/20 to-pink-500/5 ring-rose-400/30 text-rose-200',
};

export default function DayCard({ plan, sun, open, onToggle, onShowMap }: { plan: DayPlan; sun?: DailyTideAndSun; open: boolean; onToggle: () => void; onShowMap: () => void }) {
  const newCount = plan.stops.filter((s) => s.isNew).length;
  return (
    <article id={`day-${plan.day}`} className="scroll-mt-24 overflow-hidden rounded-3xl bg-white/[0.035] ring-1 ring-white/10 transition hover:ring-white/20">
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-4 text-left sm:p-5" aria-expanded={open}>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950">
          <div className="text-center leading-none">
            <div className="text-[10px] font-semibold tracking-widest">DAY</div>
            <div className="font-mono-num text-2xl font-black">{String(plan.day).padStart(2, '0')}</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <span className="font-mono-num text-slate-300">{plan.shortDate} {plan.weekday}</span>
            <span className="rounded-md bg-white/5 px-1.5 py-0.5">{plan.region}</span>
            <span>{plan.city}</span>
            {newCount > 0 && <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-amber-300">+{newCount} 加密</span>}
          </div>
          <h3 className="mt-1 font-serif-jp text-lg font-semibold text-white sm:text-xl">{plan.title}</h3>
          <p className="mt-0.5 truncate text-sm text-slate-400">{plan.subtitle}</p>
        </div>
        {sun && (
          <div className="hidden shrink-0 gap-3 text-right text-xs md:flex">
            <Mini icon={<Sunrise className="h-3.5 w-3.5 text-amber-300" />} v={sun.sunrise} />
            <Mini icon={<Sunset className="h-3.5 w-3.5 text-orange-400" />} v={sun.sunset} />
            <Mini icon={<Waves className="h-3.5 w-3.5 text-cyan-300" />} v={sun.highTides[0]?.time ?? '—'} />
          </div>
        )}
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-white/5 px-4 pb-5 sm:px-5">
          <p className="mt-4 text-sm text-slate-300">{plan.theme}</p>
          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-xl bg-white/[0.03] p-3 text-slate-500 line-through decoration-slate-600">{plan.before}</div>
            <div className="flex gap-2 rounded-xl bg-amber-400/10 p-3 text-amber-100">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              {plan.after}
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
            <ol className="relative space-y-0">
              {plan.stops.map((s, i) => {
                const meta = categoryMeta[s.category];
                return (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < plan.stops.length - 1 && <span className="absolute left-[54px] top-6 h-full w-px bg-white/10" />}
                    <time className="w-11 shrink-0 pt-0.5 text-right font-mono-num text-sm font-semibold text-slate-200">{s.time}</time>
                    <span className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ring-slate-950" style={{ background: meta.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-100">{s.title}</span>
                        {s.isNew && <span className="rounded bg-amber-400/15 px-1 text-[10px] text-amber-300">NEW</span>}
                        {s.isTide && <span className="rounded bg-cyan-400/15 px-1 text-[10px] text-cyan-300">潮汐/光线</span>}
                      </div>
                      {s.detail && <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{s.detail}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>

            {sun && <TideSunPanel sun={sun} />}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/[0.03] p-3 text-xs">
            <p className="text-slate-400">💡 {plan.note}</p>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="flex items-center gap-1"><Moon className="h-3.5 w-3.5" /> {plan.sleep}</span>
              <button onClick={onShowMap} className="no-print flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 hover:bg-white/15">
                <MapPin className="h-3.5 w-3.5 text-amber-300" /> 在地图看今天
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function Mini({ icon, v }: { icon: React.ReactNode; v: string }) {
  return (
    <span className="flex items-center gap-1 font-mono-num text-slate-300">
      {icon}
      {v}
    </span>
  );
}

export function TideSunPanel({ sun }: { sun: DailyTideAndSun }) {
  const tides = [...sun.highTides.map((t) => ({ ...t, kind: 'high' as const })), ...sun.lowTides.map((t) => ({ ...t, kind: 'low' as const }))].sort((a, b) => a.time.localeCompare(b.time));
  const maxH = Math.max(...tides.map((t) => t.heightCm), 300);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500/15 via-slate-900 to-orange-500/10 p-4 ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1"><Sun className="h-3.5 w-3.5 text-amber-300" /> 日照 · {sun.city}</span>
          <span>月龄 {sun.moonAge} · {sun.lunarDate}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Cell label="晨光" v={sun.dawn} />
          <Cell label="日出" v={sun.sunrise} accent="text-amber-300" />
          <Cell label="正午" v={sun.solarNoon} />
          <Cell label="黄金时刻" v={sun.goldenHour} small />
          <Cell label="日落" v={sun.sunset} accent="text-orange-400" />
          <Cell label="暮光止" v={sun.dusk} />
        </div>
      </div>
      <div className="rounded-2xl bg-cyan-500/[0.06] p-4 ring-1 ring-cyan-400/15">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-cyan-200"><Waves className="h-3.5 w-3.5" /> {sun.tideStation}</span>
          <span className="rounded-md bg-cyan-400/15 px-1.5 py-0.5 text-cyan-200">{sun.tideType}{sun.tideBadgeNote ? ` · ${sun.tideBadgeNote}` : ''}</span>
        </div>
        <div className="flex h-24 items-end gap-2">
          {tides.map((t) => (
            <div key={t.time + t.kind} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono-num text-[10px] text-slate-400">{t.heightCm}cm</span>
              <div className={`w-full rounded-t-md ${t.kind === 'high' ? 'bg-gradient-to-t from-cyan-600 to-cyan-300' : 'bg-gradient-to-t from-slate-700 to-slate-500'}`} style={{ height: `${Math.max(8, (t.heightCm / maxH) * 64)}px` }} />
              <span className="font-mono-num text-[11px] font-semibold text-slate-100">{t.time}</span>
              <span className="text-[10px] text-slate-500">{t.kind === 'high' ? '满潮' : '干潮'}</span>
            </div>
          ))}
        </div>
      </div>
      {sun.specialWindow && (
        <div className={`rounded-2xl bg-gradient-to-br p-4 text-xs ring-1 ${badgeTone[sun.specialWindow.badgeColor]}`}>
          <div className="font-semibold">{sun.specialWindow.spotName}</div>
          <div className="mt-1 font-mono-num text-white">{sun.specialWindow.bestWindow}</div>
          <p className="mt-1.5 leading-relaxed text-slate-300">{sun.specialWindow.description}</p>
        </div>
      )}
    </div>
  );
}

function Cell({ label, v, accent, small }: { label: string; v: string; accent?: string; small?: boolean }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-1 py-2">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className={`font-mono-num font-semibold ${small ? 'text-[11px]' : 'text-sm'} ${accent ?? 'text-slate-100'}`}>{v}</div>
    </div>
  );
}
