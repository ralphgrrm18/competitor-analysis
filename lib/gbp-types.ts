export interface GBPAttribute {
  section: string;
  items: string[];
}

export interface GBPDetail {
  gbpUrl: string;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  category: string;
  address: string;
  phone: string | null;
  website: string | null;
  photoCount: number | null;
  latestReviewRecency: string | null;
  attributes: GBPAttribute[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
}
