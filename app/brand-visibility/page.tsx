"use client";

import { useState } from "react";
import type { BrandVisibilityResult, SerpFeature, BrandedResult, NewsMention } from "@/lib/brand-visibility-types";

type Status = "idle" | "loading" | "done" | "error";

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
      <span className="font-semibold">{rating.toFixed(1)}</span>
    </span>
  );
}

function FeatureBadge({ feature }: { feature: SerpFeature }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-sm ${
        feature.present
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-gray-50 border-gray-200 text-gray-400"
      }`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${feature.present ? "bg-green-500" : "bg-gray-300"}`} />
      <span className="font-medium">{feature.label}</span>
      {feature.present && feature.detail && (
        <span className="text-green-600 text-xs truncate max-w-[140px]">{feature.detail}</span>
      )}
      {!feature.present && <span className="text-xs text-gray-400 ml-auto">not found</span>}
    </div>
  );
}

function OrganicResultRow({ result }: { result: BrandedResult }) {
  const hostname = (() => {
    try { return new URL(result.url).hostname.replace(/^www\./, ""); } catch { return result.url; }
  })();

  return (
    <div className={`flex gap-3 py-3 border-b border-gray-100 last:border-0 ${result.isBrandDomain ? "bg-blue-50/40 -mx-4 px-4 rounded-lg" : ""}`}>
      <span className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${
        result.isBrandDomain ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
      }`}>
        {result.position}
      </span>
      <div className="flex-1 min-w-0">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-700 hover:underline truncate block"
        >
          {result.title}
        </a>
        <p className="text-xs text-green-700 truncate">{hostname}</p>
        {result.snippet && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{result.snippet}</p>
        )}
      </div>
      {result.isBrandDomain && (
        <span className="shrink-0 self-start text-[10px] font-semibold bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">
          Their site
        </span>
      )}
    </div>
  );
}

function NewsMentionRow({ mention }: { mention: NewsMention }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <a
        href={mention.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-gray-900 hover:text-blue-700 hover:underline line-clamp-2"
      >
        {mention.title}
      </a>
      <div className="flex items-center gap-2 mt-1">
        {mention.source && (
          <span className="text-xs font-medium text-gray-600">{mention.source}</span>
        )}
        {mention.date && (
          <span className="text-xs text-gray-400">{mention.date}</span>
        )}
      </div>
      {mention.snippet && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mention.snippet}</p>
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function BrandVisibilityPage() {
  const [brandName, setBrandName] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<BrandVisibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = status !== "loading" && brandName.trim() && domain.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const scraperUrl = process.env.NEXT_PUBLIC_SCRAPER_API_URL;
    if (!scraperUrl) {
      setError("Scraper URL not configured");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${scraperUrl}/api/brand-visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: brandName.trim(), domain: domain.trim() }),
      });
      const text = await res.text();
      let data: BrandVisibilityResult & { error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Unexpected response from server");
      }
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Brand Visibility</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Check how visible a competitor brand is across Google Search — rankings, SERP features, news mentions, and reviews.
          </p>
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="brandName">
                Brand Name
              </label>
              <input
                id="brandName"
                type="text"
                placeholder="e.g. Ring Ring Marketing"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={status === "loading"}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="domain">
                Website Domain
              </label>
              <input
                id="domain"
                type="text"
                placeholder="e.g. ringringmarketing.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={status === "loading"}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="self-start rounded-lg bg-blue-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "loading" ? "Checking…" : "Check Brand Visibility"}
          </button>
        </form>

        {/* Loading state */}
        {status === "loading" && (
          <div className="mt-8 flex items-center gap-3 text-gray-500">
            <Spinner />
            <span className="text-sm">Running 3 searches in parallel — usually under 10 seconds…</span>
          </div>
        )}

        {/* Error */}
        {status === "error" && error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {status === "done" && result && (
          <div className="mt-8 flex flex-col gap-6">

            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {result.domainFirstPosition !== null ? `#${result.domainFirstPosition}` : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Domain rank in organic</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {result.serpFeatures.filter((f) => f.present).length}
                  <span className="text-gray-400 text-lg">/{result.serpFeatures.length}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">SERP features owned</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {result.newsMentions.length > 0 ? result.newsMentions.length : "0"}
                </p>
                <p className="text-xs text-gray-500 mt-1">News mentions</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
                {result.localPresence?.rating ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                      <StarRating rating={result.localPresence.rating} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {result.localPresence.reviewCount !== null
                        ? `${result.localPresence.reviewCount.toLocaleString()} reviews`
                        : "Google reviews"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-400">—</p>
                    <p className="text-xs text-gray-500 mt-1">Google reviews</p>
                  </>
                )}
              </div>
            </div>

            {/* SERP Features */}
            <SectionCard title="SERP Features">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.serpFeatures.map((f) => (
                  <FeatureBadge key={f.type} feature={f} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Features like Knowledge Panel and Sitelinks signal strong brand authority to Google.
              </p>
            </SectionCard>

            {/* Organic rankings */}
            <SectionCard title={`Organic Search Results${result.totalResultsEstimate ? ` · ~${result.totalResultsEstimate} total` : ""}`}>
              {result.organicResults.length === 0 ? (
                <p className="text-sm text-gray-400">No organic results found.</p>
              ) : (
                <div>
                  {result.organicResults.map((r) => (
                    <OrganicResultRow key={r.position} result={r} />
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Highlighted rows are pages from their own domain. Position 1 is ideal for a branded search.
              </p>
            </SectionCard>

            {/* Local presence */}
            {result.localPresence && (
              <SectionCard title="Local Presence (Google Local Pack)">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="font-semibold text-gray-900 text-base">{result.localPresence.name}</div>
                  {result.localPresence.rating !== null && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <StarRating rating={result.localPresence.rating} />
                      {result.localPresence.reviewCount !== null && (
                        <span className="text-gray-500">({result.localPresence.reviewCount.toLocaleString()} reviews)</span>
                      )}
                      {result.localPresence.position !== null && (
                        <span className="ml-auto text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
                          Local Pack #{result.localPresence.position}
                        </span>
                      )}
                    </div>
                  )}
                  {result.localPresence.address && (
                    <p className="text-gray-600">{result.localPresence.address}</p>
                  )}
                  {result.localPresence.phone && (
                    <p className="text-gray-600">{result.localPresence.phone}</p>
                  )}
                  {result.localPresence.website && (
                    <a
                      href={result.localPresence.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {result.localPresence.website}
                    </a>
                  )}
                </div>
              </SectionCard>
            )}

            {/* News mentions */}
            <SectionCard title={`News Mentions (${result.newsMentions.length})`}>
              {result.newsMentions.length === 0 ? (
                <p className="text-sm text-gray-400">No recent news mentions found — low web PR or a newer brand.</p>
              ) : (
                <div>
                  {result.newsMentions.map((m, i) => (
                    <NewsMentionRow key={i} mention={m} />
                  ))}
                </div>
              )}
            </SectionCard>

            <p className="text-xs text-gray-400 text-right">
              Data pulled {new Date(result.scrapedAt).toLocaleString()} via Google Search & Google News
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
