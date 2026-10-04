"use client";

import { useMemo, useState } from "react";

export default function MaterialsTable({ materials }: { materials: any[] }) {
  const [rows, setRows] = useState(materials);

  // Add material form state
  const [name, setName] = useState("");
  const [multiplier, setMultiplier] = useState("1");
  const [previewColor, setPreviewColor] = useState("");
  const [adding, setAdding] = useState(false);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [rows]);

  async function addMaterial() {
    const n = name.trim();
    const m = Number(multiplier);

    if (!n) return alert("Material name required");
    if (Number.isNaN(m)) return alert("Multiplier must be a number");

    setAdding(true);
    try {
      const res = await fetch("/api/admin/materials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: n,
          multiplier: m,
          previewColor: previewColor.trim(),
        }),
      });

      const j = await res.json().catch(() => null);
      if (!res.ok) {
        alert(j?.error ?? "Add material failed");
        return;
      }

      setRows((r) => [j.material, ...r]);
      setName("");
      setMultiplier("1");
      setPreviewColor("");
    } finally {
      setAdding(false);
    }
  }

  async function save(row: any) {
    const res = await fetch(`/api/admin/materials/${row._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        multiplier: Number(row.multiplier),
        enabled: Boolean(row.enabled),
        previewColor: row.previewColor,
      }),
    });

    const j = await res.json().catch(() => null);
    if (!res.ok) {
      alert(j?.error ?? "Save failed");
      return;
    }

    setRows((r) => r.map((x) => (x._id === row._id ? j.material : x)));
  }

  return (
    <div className="space-y-4">
      {/* Add Material */}
      <div className="rounded border p-4 space-y-3 max-w-xl">
        <div className="font-semibold">Add Material</div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="text-sm">Name</div>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="e.g., Rosewood"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <div className="text-sm">Multiplier</div>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="1.00"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <div className="text-sm">Preview Color (optional)</div>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="#8b5a2b"
              value={previewColor}
              onChange={(e) => setPreviewColor(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={adding}
          onClick={addMaterial}
        >
          {adding ? "Adding..." : "Add Material"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded border">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Enabled</th>
              <th className="text-left p-2">Multiplier</th>
              <th className="text-left p-2">Preview</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m._id} className="border-t">
                <td className="p-2">{m.name}</td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={!!m.enabled}
                    onChange={(e) =>
                      setRows((r) =>
                        r.map((x) => (x._id === m._id ? { ...x, enabled: e.target.checked } : x))
                      )
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    className="w-24 rounded border px-2 py-1"
                    value={m.multiplier}
                    onChange={(e) =>
                      setRows((r) =>
                        r.map((x) => (x._id === m._id ? { ...x, multiplier: e.target.value } : x))
                      )
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    className="w-28 rounded border px-2 py-1"
                    value={m.previewColor ?? ""}
                    placeholder="#8b5a2b"
                    onChange={(e) =>
                      setRows((r) =>
                        r.map((x) => (x._id === m._id ? { ...x, previewColor: e.target.value } : x))
                      )
                    }
                  />
                </td>
                <td className="p-2">
                  <button
                    className="rounded bg-black text-white px-3 py-1"
                    onClick={() => save(m)}
                    type="button"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}