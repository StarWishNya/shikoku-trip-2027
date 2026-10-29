export type SpotCategory = 'military' | 'anime' | 'scenic' | 'transport' | 'food';

export interface AnitabiScene {
  pointId: string;
  bangumiId: number;
  animeTitle: string;
  animeTitleJa: string;
  spotName: string;
  image: string;
  ep?: string | number;
  s?: number;
  lat: number;
  lng: number;
  origin?: string;
  originUrl?: string;
}

export interface MapSpot {
  id: string;
  day: number;
  date: string;
  name: string;
  nameJa?: string;
  category: SpotCategory;
  lat: number;
  lng: number;
  timeWindow?: string;
  transitInfo?: string;
  ticket?: string;
  isNewAdded?: boolean; // 新增/加密点位标记
  summary: string;
  highlights?: string[];
  warning?: string;
  googleMapsQuery: string;
  anitabi?: AnitabiScene;
}

export interface TimelineStop {
  time: string;
  title: string;
  category: SpotCategory;
  detail?: string;
  isNew?: boolean;
  isTide?: boolean;
  spotId?: string;
}

export interface TideEntry {
  time: string;
  heightCm: number;
  label?: string;
}

export interface DailyTideAndSun {
  day: number;
  date: string;
  weekday: string;
  city: string;
  lunarDate: string;
  moonAge: number;
  tideType: '大潮' | '中潮' | '小潮' | '长潮' | '若潮';
  tideBadgeNote?: string;
  dawn: string;
  sunrise: string;
  solarNoon: string;
  noonAltitudeDeg: number;
  goldenHour: string;
  sunset: string;
  dusk: string;
  tideStation: string;
  highTides: TideEntry[];
  lowTides: TideEntry[];
  specialWindow?: {
    spotName: string;
    bestWindow: string;
    description: string;
    badgeColor: 'amber' | 'cyan' | 'emerald' | 'rose';
  };
}

export interface DayPlan {
  day: number;
  date: string;
  shortDate: string;
  weekday: string;
  region: '香川' | '德岛' | '高知' | '爱媛' | '广岛';
  city: string;
  title: string;
  subtitle: string;
  theme: string;
  sleep: string;
  before: string;
  after: string;
  stops: TimelineStop[];
  note: string;
}

export interface MilitarySite {
  id: string;
  day: number;
  date: string;
  region: string;
  nameZh: string;
  nameJa: string;
  lat: number;
  lng: number;
  hours: string;
  closedDays: string;
  price: string;
  tag: string;
  era: '明治陆海军' | '二战太平洋战史' | '现代海上/陆上自卫队' | '中世/近世城郭防卫';
  exhibits: string[];
  highlight: string;
  transitGuide: string;
  bookingOrRuleWarning?: string;
  status2027Alert?: string;
  googleMapsQuery: string;
}

export interface AnimePilgrimage {
  id: string;
  bangumiId?: number;
  title: string;
  titleJa: string;
  dayLabel: string;
  dayNumber: number;
  city: string;
  genre: string;
  spots: string[];
  shotGuide: string;
  lat: number;
  lng: number;
  googleMapsQuery: string;
  scenes?: AnitabiScene[];
}
