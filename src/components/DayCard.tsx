import { ChevronDown, MapPin, Moon, Sparkles, Sun, Sunrise, Sunset, Waves } from 'lucide-react';
import type { DailyTideAndSun, DayPlan } from '../data/types';
import { categoryMeta } from '../lib/categories';

const badgeTone = {
  amber: 'from-amber-500/20 to-orange-500/5 ring-amber-400/30 text-amber-700',
  cyan: 'from-cyan-500/20 to-sky-500/5 ring-cyan-400/30 text-cyan-700',
  emerald: 'from-emerald-500/20 to-teal-500/5 ring-emerald-300 text-emerald-700',
  rose: 'from-rose-500/20 to-pink-500/5 ring-rose-400/30 text-rose-700',
};

export default function DayCard({
  plan,
  sun,
  open,
  onToggle,
  onShowMap,
  onLocateSpot,
}: {
  plan: DayPlan;
  sun?: DailyTideAndSun;
  open: boolean;
  onToggle: () => void;
  onShowMap: () => void;
  onLocateSpot?: (spotId: string, day: number) => void;
}) {
  const newCount = plan.stops.filter((s) => s.isNew).length;
  const tideCount = plan.stops.filter((s) => s.isTide).length;

  return (
    <article
      id={`day-${plan.day}`}
      className={`scroll-mt-24 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 transition ${
        open ? 'ring-sky-300/90 shadow-md' : 'ring-slate-200/80 hover:ring-sky-300/70'
      }`}
    >
      <div className="flex w-full items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <button
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
          aria-expanded={open}
        >
          <div className="grid h-15 w-15 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xs sm:h-16 sm:w-16">
            <div className="text-center leading-none">
              <div className="text-[10px] font-semibold tracking-widest opacity-90">DAY</div>
              <div className="font-mono-num text-2xl font-black">{String(plan.day).padStart(2, '0')}</div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="font-mono-num font-semibold text-slate-700">
                {plan.shortDate} {plan.weekday}
              </span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">{plan.region}</span>
              <span className="text-slate-600">{plan.city}</span>
              <span className="rounded-md bg-sky-50 px-1.5 py-0.5 font-mono-num text-sky-700 ring-1 ring-sky-200/60">
                {plan.stops.length} 站
              </span>
              {newCount > 0 && (
                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700 ring-1 ring-amber-200/80">
                  +{newCount} 加密
                </span>
              )}
              {tideCount > 0 && (
                <span className="hidden rounded-md bg-cyan-50 px-1.5 py-0.5 font-medium text-cyan-700 ring-1 ring-cyan-200/80 sm:inline-block">
                  {tideCount} 处潮汐/日落卡点
                </span>
              )}
            </div>
            <h3 className="mt-1 font-serif-jp text-lg font-bold text-slate-900 sm:text-xl">{plan.title}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">{plan.subtitle}</p>
          </div>
        </button>

        {sun && (
          <div className="hidden shrink-0 items-center gap-3 text-right text-xs lg:flex">
            <Mini icon={<Sunrise className="h-3.5 w-3.5 text-amber-600" />} label="日出" v={sun.sunrise} />
            <Mini icon={<Sunset className="h-3.5 w-3.5 text-orange-500" />} label="日落" v={sun.sunset} />
            <Mini icon={<Waves className="h-3.5 w-3.5 text-cyan-600" />} label="满潮" v={sun.highTides[0]?.time ?? '—'} />
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={onShowMap}
            title={`在地图查看 Day ${plan.day} 路线`}
            aria-label={`在地图查看 Day ${plan.day} 路线`}
            className="no-print hidden items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 sm:inline-flex"
          >
            <MapPin className="h-3.5 w-3.5 text-sky-600" />
            <span className="hidden md:inline">地图</span>
          </button>
          <button
            onClick={onToggle}
            aria-label={open ? '收起当日行程' : '展开当日行程'}
            className="rounded-xl p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180 text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200/70 px-4 pb-5 sm:px-5">
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{plan.theme}</p>
          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 text-slate-500 line-through decoration-slate-400">{plan.before}</div>
            <div className="flex gap-2 rounded-xl bg-amber-50/90 p-3 text-amber-900 ring-1 ring-amber-200/60">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span>{plan.after}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_310px]">
            <ol className="relative space-y-0">
              {plan.stops.map((s, i) => {
                const meta = categoryMeta[s.category];
                const isLast = i === plan.stops.length - 1;
                return (
                  <li key={i} className="group relative flex gap-3 pb-4 last:pb-0">
                    <time className="w-11 shrink-0 pt-0.5 text-right font-mono-num text-sm font-semibold text-slate-700">
                      {s.time}
                    </time>
                    <div className="relative flex w-4 shrink-0 flex-col items-center">
                      {!isLast && (
                        <span className="absolute top-4 bottom-[-16px] left-1/2 w-px -translate-x-1/2 bg-slate-200" />
                      )}
                      <span
                        className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ring-white transition group-hover:scale-125"
                        style={{ background: meta.color }}
                      />
                    </div>
                    <div className="min-w-0 flex-1 rounded-xl px-2 py-0.5 -mx-1 transition group-hover:bg-slate-50/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-800">{s.title}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}>
                          {meta.label}
                        </span>
                        {s.isNew && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            NEW
                          </span>
                        )}
                        {s.isTide && (
                          <span className="rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700">
                            潮汐/光线
                          </span>
                        )}
                        {s.spotId && onLocateSpot && (
                          <button
                            onClick={() => onLocateSpot(s.spotId!, plan.day)}
                            className="no-print inline-flex items-center gap-0.5 rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200/70 transition hover:bg-sky-100"
                            title="在地图上定位该点位"
                          >
                            <MapPin className="h-2.5 w-2.5" /> 定位
                          </button>
                        )}
                      </div>
                      {s.detail && <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.detail}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>

            {sun && <TideSunPanel sun={sun} />}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-xs ring-1 ring-slate-200/60">
            <p className="text-slate-600">💡 {plan.note}</p>
            <div className="flex items-center gap-3 text-slate-600">
              <span className="flex items-center gap-1 font-medium">
                <Moon className="h-3.5 w-3.5 text-indigo-500" /> 宿：{plan.sleep}
              </span>
              <button
                onClick={onShowMap}
                className="no-print flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs ring-1 ring-slate-200/80 transition hover:bg-sky-50 hover:text-sky-700 hover:ring-sky-200"
              >
                <MapPin className="h-3.5 w-3.5 text-sky-600" /> 在地图看今天
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function Mini({ icon, label, v }: { icon: React.ReactNode; label: string; v: string }) {
  return (
    <span className="flex items-center gap-1 font-mono-num text-slate-600" title={label}>
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
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-sky-50 p-4 ring-1 ring-slate-200/80">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1"><Sun className="h-3.5 w-3.5 text-amber-600" /> 日照 · {sun.city}</span>
          <span>月龄 {sun.moonAge} · {sun.lunarDate}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Cell label="晨光" v={sun.dawn} />
          <Cell label="日出" v={sun.sunrise} accent="text-amber-600" />
          <Cell label="正午" v={sun.solarNoon} />
          <Cell label="黄金时刻" v={sun.goldenHour} small />
          <Cell label="日落" v={sun.sunset} accent="text-orange-500" />
          <Cell label="暮光止" v={sun.dusk} />
        </div>
      </div>
      <div className="rounded-2xl bg-cyan-50/70 p-4 ring-1 ring-cyan-200">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-cyan-700"><Waves className="h-3.5 w-3.5" /> {sun.tideStation}</span>
          <span className="rounded-md bg-cyan-100 px-1.5 py-0.5 text-cyan-700">{sun.tideType}{sun.tideBadgeNote ? ` · ${sun.tideBadgeNote}` : ''}</span>
        </div>
        <div className="flex h-24 items-end gap-2">
          {tides.map((t) => (
            <div key={t.time + t.kind} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono-num text-[10px] text-slate-500">{t.heightCm}cm</span>
              <div className={`w-full rounded-t-md ${t.kind === 'high' ? 'bg-gradient-to-t from-sky-500 to-cyan-300' : 'bg-gradient-to-t from-slate-300 to-slate-200'}`} style={{ height: `${Math.max(8, (t.heightCm / maxH) * 64)}px` }} />
              <span className="font-mono-num text-[11px] font-semibold text-slate-800">{t.time}</span>
              <span className="text-[10px] text-slate-500">{t.kind === 'high' ? '满潮' : '干潮'}</span>
            </div>
          ))}
        </div>
      </div>
      {sun.specialWindow && (
        <div className={`rounded-2xl bg-gradient-to-br p-4 text-xs ring-1 ${badgeTone[sun.specialWindow.badgeColor]}`}>
          <div className="font-semibold">{sun.specialWindow.spotName}</div>
          <div className="mt-1 font-mono-num text-slate-900">{sun.specialWindow.bestWindow}</div>
          <p className="mt-1.5 leading-relaxed text-slate-600">{sun.specialWindow.description}</p>
        </div>
      )}
    </div>
  );
}

function Cell({ label, v, accent, small }: { label: string; v: string; accent?: string; small?: boolean }) {
  return (
    <div className="rounded-xl bg-white shadow-sm px-1 py-2">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className={`font-mono-num font-semibold ${small ? 'text-[11px]' : 'text-sm'} ${accent ?? 'text-slate-800'}`}>{v}</div>
    </div>
  );
}
