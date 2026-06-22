"use client";

import type { GBPDetail } from "@/lib/gbp-types";

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < full ? "text-yellow-400" : i === full && half ? "text-yellow-300" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function GBPResultCard({ data, rank }: { data: GBPDetail; rank: number }) {
  const hasAttributes = data.attributes.length > 0;
  const hasMeta = data.metaTitle || data.metaDescription || data.metaKeywords;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{data.name}</h3>
          {data.category && (
            <span className="inline-block mt-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 border border-blue-100">
              {data.category}
            </span>
          )}
        </div>
      </div>

      {/* Rating + reviews */}
      {data.rating !== null && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Stars rating={data.rating} />
          <span className="font-semibold text-gray-800">{data.rating.toFixed(1)}</span>
          {data.reviewCount !== null && (
            <span className="text-gray-400 text-xs">({data.reviewCount.toLocaleString()} reviews)</span>
          )}
          {data.latestReviewRecency && (
            <span className="text-gray-400 text-xs">· {data.latestReviewRecency}</span>
          )}
        </div>
      )}

      {/* Address / phone / photo count */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        {data.address && <span>{data.address}</span>}
        {data.phone && <span>{data.phone}</span>}
        {data.photoCount !== null && (
          <span className="text-gray-400">{data.photoCount.toLocaleString()} photos</span>
        )}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3 text-xs">
        {data.website && (
          <a href={data.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
            Website
          </a>
        )}
        <a href={data.gbpUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          View on Maps
        </a>
      </div>

      {/* Meta tags */}
      {hasMeta && (
        <details className="border-t border-gray-100 pt-3">
          <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 select-none">
            Website Meta Tags
          </summary>
          <div className="mt-2 flex flex-col gap-2 text-xs text-gray-600">
            {data.metaTitle && (
              <div>
                <span className="font-medium text-gray-500">Title: </span>
                {data.metaTitle}
              </div>
            )}
            {data.metaDescription && (
              <div>
                <span className="font-medium text-gray-500">Description: </span>
                {data.metaDescription}
              </div>
            )}
            {data.metaKeywords && (
              <div>
                <span className="font-medium text-gray-500">Keywords: </span>
                {data.metaKeywords}
              </div>
            )}
          </div>
        </details>
      )}

      {/* Attributes */}
      {hasAttributes && (
        <details className="border-t border-gray-100 pt-3" open>
          <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 select-none">
            Listing Attributes ({data.attributes.reduce((n, a) => n + a.items.length, 0)} items)
          </summary>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.attributes.map((attr) => (
              <div key={attr.section}>
                <p className="text-xs font-semibold text-gray-700 mb-1">{attr.section}</p>
                <ul className="space-y-0.5">
                  {attr.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <svg className="w-3 h-3 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
