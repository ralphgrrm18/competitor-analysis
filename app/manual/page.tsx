"use client";

import { useState } from "react";
import type { GBPDetail } from "@/lib/gbp-types";
import GBPResultCard from "@/components/GBPResultCard";

type Status = "idle" | "scraping" | "done" | "error";

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function ManualPage() {
  const [urls, setUrls] = useState<string[]>(["", "", ""]);
  const [results, setResults] = useState<(GBPDetail | null)[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [errors, setErrors] = useState<(string | null)[]>([]);
  const [running, setRunning] = useState(false);

  const addUrl = () => {
    if (urls.length < 10) setUrls([...urls, ""]);
  };

  const removeUrl = (i: number) => {
    if (urls.length > 1) setUrls(urls.filter((_, idx) => idx !== i));
  };

  const updateUrl = (i: number, val: string) => {
    const next = [...urls];
    next[i] = val;
    setUrls(next);
  };

  async function handleScrape() {
    const valid = urls.map((u) => u.trim()).filter(Boolean);
    if (!valid.length || running) return;

    const scraperUrl = process.env.NEXT_PUBLIC_SCRAPER_API_URL;
    if (!scraperUrl) return;

    setRunning(true);
    const results: (GBPDetail | null)[] = valid.map(() => null);
    const statuses: Status[] = valid.map(() => "idle");
    const errors: (string | null)[] = valid.map(() => null);
    setResults([...results]);
    setStatuses([...statuses]);
    setErrors([...errors]);

    for (let i = 0; i < valid.length; i++) {
      statuses[i] = "scraping";
      setStatuses([...statuses]);

      try {
        const res = await fetch(`${scraperUrl}/api/scrape-gbp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: valid[i] }),
        });
        const text = await res.text();
        let data: GBPDetail & { error?: string };
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Unexpected response from server");
        }
        if (!res.ok) throw new Error(data.error ?? "Scrape failed");
        results[i] = data;
        statuses[i] = "done";
      } catch (err) {
        errors[i] = err instanceof Error ? err.message : "Unknown error";
        statuses[i] = "error";
      }

      setResults([...results]);
      setStatuses([...statuses]);
      setErrors([...errors]);
    }

    setRunning(false);
  }

  const validUrls = urls.map((u) => u.trim()).filter(Boolean);
  const hasStarted = statuses.length > 0;

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manual GBP Lookup</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Paste up to 10 Google Business Profile URLs — each is scraped individually (~30s per listing).
          </p>
        </div>

        {/* URL inputs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
          {urls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <input
                type="text"
                placeholder="https://www.google.com/maps/place/... or maps.app.goo.gl/..."
                value={url}
                onChange={(e) => updateUrl(i, e.target.value)}
                disabled={running}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(i)}
                  disabled={running}
                  className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center mt-1">
            {urls.length < 10 && (
              <button
                type="button"
                onClick={addUrl}
                disabled={running}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                + Add competitor
              </button>
            )}
            <button
              type="button"
              onClick={handleScrape}
              disabled={!validUrls.length || running}
              className="ml-auto rounded-lg bg-blue-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {running ? "Scraping…" : `Scrape ${validUrls.length || ""} Competitor${validUrls.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>

        {/* Progress */}
        {hasStarted && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Progress</p>
            {validUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {statuses[i] === "scraping" && <Spinner />}
                {statuses[i] === "done" && <CheckIcon />}
                {statuses[i] === "error" && <XIcon />}
                {statuses[i] === "idle" && (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                )}
                <span className="text-gray-600 truncate flex-1">{url}</span>
                {statuses[i] === "scraping" && (
                  <span className="text-xs text-gray-400 shrink-0">scraping…</span>
                )}
                {statuses[i] === "done" && (
                  <span className="text-xs text-green-600 shrink-0">done</span>
                )}
                {statuses[i] === "error" && (
                  <span className="text-xs text-red-400 shrink-0 max-w-[200px] truncate">{errors[i]}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results.some(Boolean) && (
          <div className="mt-8 flex flex-col gap-6">
            <p className="text-sm font-semibold text-gray-700">
              {results.filter(Boolean).length} result{results.filter(Boolean).length !== 1 ? "s" : ""}
            </p>
            {results.map((result, i) =>
              result ? <GBPResultCard key={i} data={result} rank={i + 1} /> : null
            )}
          </div>
        )}
      </div>
    </main>
  );
}
