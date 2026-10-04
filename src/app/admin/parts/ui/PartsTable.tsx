"use client";

import { useMemo, useRef, useState } from "react";

type Row = any;

function decorate(p: any) {
  return { ...p, _dirty: false, _saving: false, _error: null as string | null };
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export default function PartsTable({ initialParts }: { initialParts: Row[] }) {
  // Snapshot of "latest saved state" (kept in sync after every successful save)
  const originalRef = useRef<Row[]>(initialParts.map(decorate));

  // Editable UI state
  const [rows, setRows] = useState<Row[]>(deepClone(originalRef.current));

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of rows) {
      const g = r.group ?? "Other";
      const arr = map.get(g) ?? [];
      arr.push(r);
      map.set(g, arr);
    }
    return [...map.entries()];
  }, [rows]);

  const dirtyCount = useMemo(() => rows.filter((r) => r._dirty).length, [rows]);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((curr) =>
      curr.map((r) =>
        r._id === id ? { ...r, ...patch, _dirty: true, _error: null } : r
      )
    );
  }

  async function saveRow(row: Row) {
    // mark saving
    setRows((curr) =>
      curr.map((r) => (r._id === row._id ? { ...r, _saving: true, _error: null } : r))
    );

    const payload = {
      enabled: !!row.enabled,
      M24: Number(row.pricesBySize?.M24 ?? 0),
      M30: Number(row.pricesBySize?.M30 ?? 0),
    };

    try {
      const res = await fetch(`/api/admin/parts/${row._id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        // ignore (non-json response)
      }

      if (!res.ok) {
        const errMsg =
          json?.error ?? `HTTP ${res.status}: ${text.slice(0, 160) || "Request failed"}`;

        setRows((curr) =>
          curr.map((r) =>
            r._id === row._id ? { ...r, _saving: false, _error: errMsg } : r
          )
        );
        return;
      }

      // server returns updated part
      const saved = decorate(json.part);

      // 1) update the "latest saved snapshot"
      originalRef.current = originalRef.current.map((x: any) =>
        x._id === row._id ? deepClone(saved) : x
      );

      // 2) update UI row to saved state
      setRows((curr) =>
        curr.map((x) => (x._id === row._id ? deepClone(saved) : x))
      );
    } catch (e: any) {
      setRows((curr) =>
        curr.map((r) =>
          r._id === row._id
            ? { ...r, _saving: false, _error: e?.message ?? "Network error" }
            : r
        )
      );
    }
  }

  async function saveAll() {
    const dirty = rows.filter((r) => r._dirty && !r._saving);
    for (const r of dirty) {
      // sequential save keeps it stable; we can parallelize later
      // eslint-disable-next-line no-await-in-loop
      await saveRow(r);
    }
  }

  function discardAll() {
    if (dirtyCount === 0) return;

    const ok = confirm("Discard all unsaved changes?");
    if (!ok) return;

    // Restore from latest saved snapshot
    setRows(deepClone(originalRef.current));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={dirtyCount === 0}
          onClick={saveAll}
        >
          Save All ({dirtyCount})
        </button>

        <button
          type="button"
          className="rounded border px-4 py-2 disabled:opacity-60"
          disabled={dirtyCount === 0}
          onClick={discardAll}
        >
          Discard All
        </button>
      </div>

      {grouped.map(([groupName, groupRows]) => (
        <div key={groupName} className="rounded border overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 font-semibold">{groupName}</div>

          <div className="overflow-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-white">
                <tr className="border-b">
                  <th className="text-left p-2 w-[320px]">Part</th>
                  <th className="text-left p-2">Enabled</th>
                  <th className="text-left p-2">M24 Price</th>
                  <th className="text-left p-2">M30 Price</th>
                  <th className="text-left p-2">Key</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {groupRows.map((r) => (
                  <tr key={r._id} className="border-b last:border-b-0">
                    <td className="p-2">
                      <div className="font-medium">{r.name}</div>

                      {r._error ? (
                        <div className="text-xs text-red-600 mt-1">{r._error}</div>
                      ) : null}

                      {r._dirty ? (
                        <div className="text-xs text-amber-700 mt-1">Unsaved changes</div>
                      ) : null}
                    </td>

                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={!!r.enabled}
                        onChange={(e) => updateRow(r._id, { enabled: e.target.checked })}
                      />
                    </td>

                    <td className="p-2">
                      <input
                        className="w-28 rounded border px-2 py-1"
                        value={String(r.pricesBySize?.M24 ?? 0)}
                        onChange={(e) =>
                          updateRow(r._id, {
                            pricesBySize: { ...(r.pricesBySize ?? {}), M24: e.target.value },
                          })
                        }
                      />
                    </td>

                    <td className="p-2">
                      <input
                        className="w-28 rounded border px-2 py-1"
                        value={String(r.pricesBySize?.M30 ?? 0)}
                        onChange={(e) =>
                          updateRow(r._id, {
                            pricesBySize: { ...(r.pricesBySize ?? {}), M30: e.target.value },
                          })
                        }
                      />
                    </td>

                    <td className="p-2 text-gray-600">{r.key}</td>

                    <td className="p-2">
                      <button
                        type="button"
                        className="rounded bg-black text-white px-3 py-1 disabled:opacity-60"
                        disabled={!!r._saving}
                        onClick={() => saveRow(r)}
                      >
                        {r._saving ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}