"use client";

import { useState } from "react";
import CompetitorCard from "@/components/CompetitorCard";
import type { Competitor } from "@/lib/places";

type LocationMode = "address" | "coords";
type ScrapeMode = "maps" | "search";

type ResultsCache   = { maps: Competitor[] | null; search: Competitor[] | null };
type LoadingState   = { maps: boolean; search: boolean };
type ErrorState     = { maps: string | null; search: string | null };
type SearchedFor    = { keyword: string; label: string };
type SearchedForCache = { maps: SearchedFor | null; search: SearchedFor | null };

export default function Home() {
  const [keyword, setKeyword]           = useState("");
  const [locationMode, setLocationMode] = useState<LocationMode>("address");
  const [scrapeMode, setScrapeMode]     = useState<ScrapeMode>("maps");
  const [location, setLocation]         = useState("");
  const [lat, setLat]                   = useState("");
  const [lng, setLng]                   = useState("");

  const [loadingState, setLoadingState] = useState<LoadingState>({ maps: false, search: false });
  const [resultsCache, setResultsCache] = useState<ResultsCache>({ maps: null, search: null });
  const [searchedForCache, setSearchedForCache] = useState<SearchedForCache>({ maps: null, search: null });
  const [errors, setErrors]             = useState<ErrorState>({ maps: null, search: null });

  const isAnyLoading = loadingState.maps || loadingState.search;

  const canSubmit =
    !isAnyLoading &&
    keyword.trim() &&
    (locationMode === "address" ? location.trim() : lat.trim() && lng.trim());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const scraperUrl = process.env.NEXT_PUBLIC_SCRAPER_API_URL;
    if (!scraperUrl) { setErrors({ maps: "Scraper URL not configured", search: null }); return; }

    const label =
      locationMode === "coords"
        ? `${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}`
        : location.trim();

    const baseBody =
      locationMode === "coords"
        ? { keyword: keyword.trim(), lat: parseFloat(lat), lng: parseFloat(lng) }
        : { keyword: keyword.trim(), location: location.trim() };

    // Reset both modes
    setLoadingState({ maps: true, search: true });
    setResultsCache({ maps: null, search: null });
    setErrors({ maps: null, search: null });
    setSearchedForCache({ maps: null, search: null });

    async function fetchMode(mode: ScrapeMode) {
      try {
        const res = await fetch(`${scraperUrl}/api/scrape`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...baseBody, mode }),
        });
        const text = await res.text();
        let data: { results?: Competitor[]; error?: string };
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Backend is starting up — wait 30 seconds and try again.");
        }
        if (!res.ok) throw new Error(data.error ?? "Something went wrong");

        setResultsCache((prev) => ({ ...prev, [mode]: data.results }));
        setSearchedForCache((prev) => ({
          ...prev,
          [mode]: { keyword: keyword.trim(), label },
        }));
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          [mode]: err instanceof Error ? err.message : "Unknown error",
        }));
      } finally {
        setLoadingState((prev) => ({ ...prev, [mode]: false }));
      }
    }

    // Fire both concurrently — Search (SerpAPI) finishes in ~2s,
    // Maps (Playwright) finishes in ~2 min. Results appear as each completes.
    Promise.all([fetchMode("maps"), fetchMode("search")]);
  }

  const activeResults    = resultsCache[scrapeMode];
  const activeSearchedFor = searchedForCache[scrapeMode];
  const activeLoading    = loadingState[scrapeMode];
  const activeError      = errors[scrapeMode];

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Competitor Analysis</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Runs Google Maps and Google Search simultaneously — toggle between results instantly.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
        >
          {/* Row 1: Keyword + Location */}
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
                  Right-click any spot on Google Maps → &quot;What&apos;s here?&quot; to copy exact coordinates.
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Source toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Source</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm w-fit">
              <button
                type="button"
                onClick={() => setScrapeMode("maps")}
                className={`px-4 py-2 transition-colors ${
                  scrapeMode === "maps"
                    ? "bg-blue-600 text-white font-medium"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                Google Maps
              </button>
              <button
                type="button"
                onClick={() => setScrapeMode("search")}
                className={`px-4 py-2 transition-colors ${
                  scrapeMode === "search"
                    ? "bg-blue-600 text-white font-medium"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                Google Search
              </button>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto rounded-lg border border-gray-100 text-xs mt-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="w-28 px-3 py-2 text-left font-medium text-gray-500 border-b border-r border-gray-100" />
                    <th className={`px-3 py-2 text-left font-semibold border-b border-r border-gray-100 transition-colors ${scrapeMode === "maps" ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}>
                      Google Maps
                    </th>
                    <th className={`px-3 py-2 text-left font-semibold border-b border-gray-100 transition-colors ${scrapeMode === "search" ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}>
                      Google Search Local
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-500 border-r border-gray-100 whitespace-nowrap">URL</td>
                    <td className={`px-3 py-2 text-gray-600 border-r border-gray-100 font-mono text-[10px] ${scrapeMode === "maps" ? "bg-blue-50/40" : ""}`}>
                      maps.google.com/search/&#123;keyword&#125;/@lat,lng
                    </td>
                    <td className={`px-3 py-2 text-gray-600 font-mono text-[10px] ${scrapeMode === "search" ? "bg-blue-50/40" : ""}`}>
                      google.com/search?q=&#123;keyword&#125;+&#123;location&#125;&amp;udm=1
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-500 border-r border-gray-100 whitespace-nowrap">Ranking signal</td>
                    <td className={`px-3 py-2 text-gray-600 border-r border-gray-100 ${scrapeMode === "maps" ? "bg-blue-50/40" : ""}`}>
                      Proximity to GPS coords + relevance
                    </td>
                    <td className={`px-3 py-2 text-gray-600 ${scrapeMode === "search" ? "bg-blue-50/40" : ""}`}>
                      Search algorithm + local pack signals
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-500 border-r border-gray-100 whitespace-nowrap">Includes ads?</td>
                    <td className={`px-3 py-2 text-gray-600 border-r border-gray-100 ${scrapeMode === "maps" ? "bg-blue-50/40" : ""}`}>
                      Occasionally
                    </td>
                    <td className={`px-3 py-2 text-gray-600 ${scrapeMode === "search" ? "bg-blue-50/40" : ""}`}>
                      Yes, more frequently
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-500 border-r border-gray-100 whitespace-nowrap">Mimics</td>
                    <td className={`px-3 py-2 text-gray-600 border-r border-gray-100 ${scrapeMode === "maps" ? "bg-blue-50/40" : ""}`}>
                      Someone searching inside Google Maps
                    </td>
                    <td className={`px-3 py-2 text-gray-600 ${scrapeMode === "search" ? "bg-blue-50/40" : ""}`}>
                      Someone Googling on desktop and seeing the local results tab
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="self-start rounded-lg bg-blue-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnyLoading ? "Searching…" : "Search Competitors"}
          </button>
        </form>

        {/* Dual progress status — shown while either mode is loading */}
        {isAnyLoading && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex flex-col gap-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fetching results</p>
            {(["search", "maps"] as ScrapeMode[]).map((mode) => {
              const done    = !loadingState[mode] && resultsCache[mode] !== null;
              const failed  = !loadingState[mode] && !!errors[mode];
              const running = loadingState[mode];
              return (
                <div key={mode} className="flex items-center gap-3">
                  {running && (
                    <svg className="animate-spin w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {done && (
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {failed && (
                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`text-sm ${done ? "text-gray-700 font-medium" : running ? "text-gray-600" : "text-red-500"}`}>
                    {mode === "maps" ? "Google Maps" : "Google Search"}
                  </span>
                  {running && mode === "maps" && (
                    <span className="text-xs text-gray-400">~2 min</span>
                  )}
                  {running && mode === "search" && (
                    <span className="text-xs text-gray-400">a few seconds…</span>
                  )}
                  {done && (
                    <span className="text-xs text-green-600">
                      {resultsCache[mode]?.length} results ready
                      {mode !== scrapeMode && (
                        <button
                          type="button"
                          onClick={() => setScrapeMode(mode)}
                          className="ml-2 underline hover:no-underline"
                        >
                          view
                        </button>
                      )}
                    </span>
                  )}
                  {failed && (
                    <span className="text-xs text-red-400 truncate">{errors[mode]}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Results */}
        {(activeResults !== null || activeError || activeLoading) && (
          <div className="mt-6">
            {activeError && !activeLoading && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
                {activeError}
              </div>
            )}

            {activeLoading && (
              <div className="flex flex-col items-center gap-3 text-gray-500 py-16">
                <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm font-medium">
                  {scrapeMode === "maps"
                    ? "Opening browser, spoofing location, scraping results…"
                    : "Fetching Google Search local results…"}
                </span>
                {scrapeMode === "maps" && (
                  <span className="text-xs text-gray-400">~2 minutes — Google Search results are already ready above</span>
                )}
              </div>
            )}

            {activeResults !== null && !activeLoading && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{activeResults.length} results</span>{" "}
                    for <span className="font-medium">&quot;{activeSearchedFor?.keyword}&quot;</span> near{" "}
                    <span className="font-medium">{activeSearchedFor?.label}</span>
                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {scrapeMode === "maps" ? "Google Maps" : "Google Search"}
                    </span>
                  </p>
                  {activeResults.length > 0 && (
                    <button
                      onClick={() => exportCSV(activeResults, activeSearchedFor?.keyword ?? "results", scrapeMode)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                    >
                      Export CSV
                    </button>
                  )}
                </div>

                {activeResults.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    No results found. Try a different keyword or location.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {activeResults.map((c) => (
                      <CompetitorCard key={c.rank} competitor={c} rank={c.rank} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function exportCSV(competitors: Competitor[], keyword: string, mode: ScrapeMode) {
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
  a.download = `competitors-${keyword.replace(/\s+/g, "-")}-${mode}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
