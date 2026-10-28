import { mapSpots } from '../data/itineraryData';
import { militarySites } from '../data/militaryData';
import type { MapSpot } from '../data/types';

const militaryAsSpots: MapSpot[] = militarySites.map((m) => ({
  id: m.id,
  day: m.day,
  date: m.date,
  name: m.nameZh,
  nameJa: m.nameJa,
  category: 'military',
  lat: m.lat,
  lng: m.lng,
  timeWindow: m.hours,
  ticket: m.price,
  transitInfo: m.transitGuide,
  isNewAdded: true,
  summary: m.highlight,
  highlights: m.exhibits,
  warning: m.status2027Alert ?? m.bookingOrRuleWarning,
  googleMapsQuery: m.googleMapsQuery,
}));

export const allSpots: MapSpot[] = [...mapSpots, ...militaryAsSpots].sort((a, b) => a.day - b.day);
export const spotById = new Map<string, MapSpot>(allSpots.map((s) => [s.id, s]));

