"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const categories = [
  { key: "all", label: "All" },
  { key: "mandir", label: "Mandir" },
  { key: "chairs", label: "Chairs" },
  { key: "tables", label: "Tables" },
  { key: "cabinets", label: "Cabinets" },
  { key: "wooden-art", label: "Wooden Art" },
  { key: "pillars-posts", label: "Pillars/Posts" },
  { key: "decor", label: "Decor" },
] as const;

const sorts = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "az", label: "A–Z" },
  { key: "manual", label: "Custom Order" },
  { key: "price_asc", label: "Price: Low → High" },
  { key: "price_desc", label: "Price: High → Low" },
] as const;

export default function CreationsFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const category = sp.get("category") ?? "all";
  const sort = sp.get("sort") ?? "featured";
  const q = sp.get("q") ?? "";

  const queryObj = useMemo(() => new URLSearchParams(sp.toString()), [sp]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(queryObj);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.push(`/creations?${next.toString()}`);
  }

  return (
    <div className="rounded border p-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setParam("category", c.key)}
            className={`rounded-full border px-3 py-1 text-sm ${
              category === c.key ? "bg-black text-white border-black" : "hover:bg-gray-50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="rounded border px-3 py-2 text-sm w-[260px]"
          placeholder="Search..."
          defaultValue={q}
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value.trim());
          }}
        />

        <select
          className="rounded border px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          {sorts.map((s) => (
            <option key={s.key} value={s.key}>
              Sort: {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}