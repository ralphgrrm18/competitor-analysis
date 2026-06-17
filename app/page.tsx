"use client";

import { useState } from "react";
import CompetitorCard from "@/components/CompetitorCard";
import type { Competitor } from "@/lib/places";

type LocationMode = "address" | "coords";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [locationMode, setLocationMode] = useState<LocationMode>("address");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Competitor[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchedFor, setSearchedFor] = useState<{ keyword: string; label: string } | null>(null);

  const canSubmit =
    keyword.trim() &&
    (locationMode === "address"
      ? location.trim()
      : lat.trim() && lng.trim());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const scraperUrl = process.env.NEXT_PUBLIC_SCRAPER_API_URL;
      if (!scraperUrl) throw new Error("Scraper URL not configured");

      const body =
        locationMode === "coords"
          ? { keyword: keyword.trim(), lat: parseFloat(lat), lng: parseFloat(lng) }
          : { keyword: keyword.trim(), location: location.trim() };

      const res = await fetch(`${scraperUrl}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");

      setResults(data.results);
      setSearchedFor({
        keyword: keyword.trim(),
        label:
          locationMode === "coords"
            ? `${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}`
            : location.trim(),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Competitor Analysis</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Real-time Google Maps results scraped from the exact geolocation you specify.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
        >
          {/* Row 1: Keyword + Location mode toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="keyword">
                Keyword
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="e.g. plumber, dentist, funeral home"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Location</label>
                {/* Mode toggle */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setLocationMode("address")}
                    className={`px-3 py-1 transition-colors ${
                      locationMode === "address"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode("coords")}
                    className={`px-3 py-1 transition-colors ${
                      locationMode === "coords"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Lat / Lng
                  </button>
                </div>
              </div>

              {locationMode === "address" ? (
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. St George, UT 84790"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (e.g. 37.1041)"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (e.g. -113.5684)"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {locationMode === "coords" && (
                <p className="text-xs text-gray-400">
                  Right-click any spot on Google Maps → "What&apos;s here?" to copy exact coordinates.
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="self-start rounded-lg bg-blue-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Searching…" : "Search Competitors"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-10 flex flex-col items-center gap-3 text-gray-500">
            <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm font-medium">Opening browser, spoofing location, scraping results…</span>
            <span className="text-xs text-gray-400">This takes ~2 minutes</span>
          </div>
        )}

        {results !== null && !loading && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{results.length} results</span>{" "}
                for <span className="font-medium">"{searchedFor?.keyword}"</span> near{" "}
                <span className="font-medium">{searchedFor?.label}</span>
              </p>
              {results.length > 0 && (
                <button
                  onClick={() => exportCSV(results, searchedFor?.keyword ?? "results")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                >
                  Export CSV
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                No results found. Try a different keyword or location.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((c) => (
                  <CompetitorCard key={c.rank} competitor={c} rank={c.rank} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function exportCSV(competitors: Competitor[], keyword: string) {
  const headers = [
    "Rank", "Name", "Address", "Rating", "Reviews", "Category",
    "Phone", "Website", "Open Now", "Photos", "Maps URL",
  ];
  const rows = competitors.map((c) => [
    c.rank,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.address.replace(/"/g, '""')}"`,
    c.rating ?? "",
    c.reviewCount ?? "",
    `"${c.category.replace(/"/g, '""')}"`,
    c.phone ?? "",
    c.website ?? "",
    c.openNow === true ? "Yes" : c.openNow === false ? "No" : "",
    c.photoCount,
    c.mapsUrl,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `competitors-${keyword.replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
