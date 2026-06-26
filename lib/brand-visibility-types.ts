export interface BrandedResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
  isBrandDomain: boolean;
}

export interface NewsMention {
  title: string;
  url: string;
  source: string;
  date: string;
  snippet: string;
}

export interface SerpFeature {
  type: string;
  label: string;
  present: boolean;
  detail?: string;
}

export interface LocalPresence {
  name: string;
  rating: number | null;
  reviewCount: number | null;
  position: number | null;
  address: string | null;
  phone: string | null;
  website: string | null;
}

export interface BrandVisibilityResult {
  brandName: string;
  domain: string;
  scrapedAt: string;
  totalResultsEstimate: string | null;
  domainFirstPosition: number | null;
  organicResults: BrandedResult[];
  serpFeatures: SerpFeature[];
  newsMentions: NewsMention[];
  localPresence: LocalPresence | null;
}
