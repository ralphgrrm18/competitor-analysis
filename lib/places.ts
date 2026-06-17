const PLACES_API_BASE = "https://places.googleapis.com/v1";
const GEOCODE_API_BASE = "https://maps.googleapis.com/maps/api/geocode/json";

export interface Competitor {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  reviewCount: number | null;
  website: string | null;
  phone: string | null;
  categories: string[];
  photoCount: number;
  openNow: boolean | null;
  weekdayHours: string[];
  mapsUrl: string;
}

export async function geocodeLocation(
  location: string
): Promise<{ lat: number; lng: number }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `${GEOCODE_API_BASE}?address=${encodeURIComponent(location)}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.[0]) {
    throw new Error(`Geocoding failed for "${location}": ${data.status}`);
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

export async function searchCompetitors(
  keyword: string,
  lat: number,
  lng: number,
  radiusMeters = 5000
): Promise<Competitor[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.rating",
    "places.userRatingCount",
    "places.websiteUri",
    "places.internationalPhoneNumber",
    "places.types",
    "places.photos",
    "places.currentOpeningHours",
    "places.regularOpeningHours",
    "places.businessStatus",
    "places.googleMapsUri",
  ].join(",");

  const body = {
    textQuery: keyword,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusMeters,
      },
    },
    maxResultCount: 20,
  };

  const res = await fetch(`${PLACES_API_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey!,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Places API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const places = data.places ?? [];

  return places.map((p: Record<string, unknown>): Competitor => {
    const hours = p.currentOpeningHours as Record<string, unknown> | undefined;
    const regularHours = p.regularOpeningHours as Record<string, unknown> | undefined;
    const photos = p.photos as unknown[] | undefined;
    const displayName = p.displayName as Record<string, string> | undefined;

    return {
      id: p.id as string,
      name: displayName?.text ?? "Unknown",
      address: (p.formattedAddress as string) ?? "",
      rating: (p.rating as number) ?? null,
      reviewCount: (p.userRatingCount as number) ?? null,
      website: (p.websiteUri as string) ?? null,
      phone: (p.internationalPhoneNumber as string) ?? null,
      categories: ((p.types as string[]) ?? []).slice(0, 3),
      photoCount: photos?.length ?? 0,
      openNow: (hours?.openNow as boolean) ?? null,
      weekdayHours:
        ((hours?.weekdayDescriptions ?? regularHours?.weekdayDescriptions) as string[]) ?? [],
      mapsUrl: (p.googleMapsUri as string) ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName?.text ?? "")}`,
    };
  });
}
