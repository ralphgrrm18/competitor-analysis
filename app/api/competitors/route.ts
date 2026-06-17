import { NextRequest } from "next/server";

// Vercel Pro: export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { keyword, location } = await request.json();

  if (!keyword?.trim() || !location?.trim()) {
    return Response.json(
      { error: "keyword and location are required" },
      { status: 400 }
    );
  }

  const scraperUrl = process.env.SCRAPER_API_URL;
  if (!scraperUrl) {
    return Response.json(
      { error: "SCRAPER_API_URL is not configured" },
      { status: 500 }
    );
  }

  const upstream = await fetch(`${scraperUrl}/api/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword: keyword.trim(), location: location.trim() }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return Response.json(data, { status: upstream.status });
  }

  // Normalise: frontend expects { competitors: [...], coords: {...} }
  return Response.json({ competitors: data.results, coords: data.coords });
}
