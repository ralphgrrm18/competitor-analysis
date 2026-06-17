import { NextRequest } from "next/server";
import { geocodeLocation, searchCompetitors } from "@/lib/places";

export async function POST(request: NextRequest) {
  const { keyword, location, radius } = await request.json();

  if (!keyword || !location) {
    return Response.json(
      { error: "keyword and location are required" },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return Response.json(
      { error: "GOOGLE_MAPS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const coords = await geocodeLocation(location);
  const competitors = await searchCompetitors(
    keyword,
    coords.lat,
    coords.lng,
    radius ?? 5000
  );

  return Response.json({ competitors, coords });
}
