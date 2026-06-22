// Shared type used by both the API route and UI components.
// Populated by the competitor-scraper-api Railway service.
export interface Competitor {
  rank: number;
  name: string;
  address: string;
  rating: number | null;
  reviewCount: number | null;
  category: string;
  phone: string | null;
  website: string | null;
  openNow: boolean | null;
  weekdayHours: string[];
  todayHours: string | null;
  mapsUrl: string;
  photoCount: number;
}
