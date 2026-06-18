"use client";

import type { Competitor } from "@/lib/places";

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${
            i < full
              ? "text-yellow-400"
              : i === full && half
              ? "text-yellow-300"
              : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function Badge({ label }: { label: string }) {
  const pretty = label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 border border-blue-100">
      {pretty}
    </span>
  );
}

function getTodayHours(weekdayHours: string[]): string | null {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  const row = weekdayHours.find((h) => h.toLowerCase().startsWith(today.toLowerCase()));
  if (!row) return null;
  // Strip the day name prefix, leaving just the hours e.g. "8 AM–5 PM"
  const hours = row.replace(new RegExp(`^${today}[\\s\\t:–-]*`, "i"), "").trim();
  return `${today} ${hours}`;
}

export default function CompetitorCard({
  competitor,
  rank,
}: {
  competitor: Competitor;
  rank: number;
}) {
  const todayHours = competitor.todayHours ?? getTodayHours(competitor.weekdayHours);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            {rank}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{competitor.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{competitor.address}</p>
          </div>
        </div>
        {todayHours && (
          <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            {todayHours}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {competitor.rating !== null && (
          <div className="flex items-center gap-1.5">
            <Stars rating={competitor.rating} />
            <span className="font-semibold text-gray-800">{competitor.rating.toFixed(1)}</span>
            {competitor.reviewCount !== null && (
              <span className="text-gray-400 text-xs">({competitor.reviewCount.toLocaleString()} reviews)</span>
            )}
          </div>
        )}
        {competitor.photoCount > 0 && (
          <span className="text-gray-500 text-xs">{competitor.photoCount} photos</span>
        )}
      </div>

      {competitor.category && (
        <div className="flex flex-wrap gap-1">
          <Badge label={competitor.category} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
        {competitor.phone && (
          <a href={`tel:${competitor.phone}`} className="flex items-center gap-1 hover:text-blue-600 truncate">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {competitor.phone}
          </a>
        )}
        {competitor.website && (
          <a
            href={competitor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-600 truncate"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
            Website
          </a>
        )}
        <a
          href={competitor.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-blue-600"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          View on Maps
        </a>
      </div>

      {competitor.weekdayHours.length > 0 && (
        <details className="text-xs text-gray-500 border-t border-gray-100 pt-2">
          <summary className="cursor-pointer hover:text-gray-700 font-medium">Hours</summary>
          <ul className="mt-1.5 space-y-0.5 pl-1">
            {competitor.weekdayHours.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
