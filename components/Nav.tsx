"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        path === href
          ? "bg-blue-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900 mr-4">Competitor Analysis</span>
        {link("/", "Automated Search")}
        {link("/manual", "Manual GBP Lookup")}
      </div>
    </nav>
  );
}
