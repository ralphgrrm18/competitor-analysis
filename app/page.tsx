"use client";

import { useState } from "react";
import CompetitorCard from "@/components/CompetitorCard";
import type { Competitor } from "@/lib/places";

const RADIUS_OPTIONS = [
  { label: "1 km", value: 1000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
];

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Competitor[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchedFor, setSearchedFor] = useState<{ keyword: string; location: string } | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || !location.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), location: location.trim(), radius }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Something went wrong");

      setResults(data.competitors);
      setSearchedFor({ keyword: keyword.trim(), location: location.trim() });
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
            Search Google Maps by keyword + location to surface local competitors.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="keyword">
                Keyword
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="e.g. plumber, dentist, coffee shop"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g. New York, NY or 10001"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Search radius:</span>
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRadius(opt.value)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  radius === opt.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !keyword.trim() || !location.trim()}
            className="self-start rounded-lg bg-blue-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Searching..." : "Search Competitors"}
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
            <span className="text-sm">Fetching competitors from Google Maps…</span>
          </div>
        )}

        {results !== null && !loading && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{results.length} results</span>{" "}
                for <span className="font-medium">"{searchedFor?.keyword}"</span> near{" "}
                <span className="font-medium">{searchedFor?.location}</span>
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
                No results found. Try a broader keyword or larger radius.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((c, i) => (
                  <CompetitorCard key={c.id} competitor={c} rank={i + 1} />
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
    "Rank", "Name", "Address", "Rating", "Reviews", "Phone", "Website",
    "Categories", "Photos", "Open Now", "Maps URL",
  ];
  const rows = competitors.map((c, i) => [
    i + 1,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.address.replace(/"/g, '""')}"`,
    c.rating ?? "",
    c.reviewCount ?? "",
    c.phone ?? "",
    c.website ?? "",
    `"${c.categories.join(", ")}"`,
    c.photoCount,
    c.openNow === true ? "Yes" : c.openNow === false ? "No" : "",
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
