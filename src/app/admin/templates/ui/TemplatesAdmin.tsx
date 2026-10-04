"use client";

import { useMemo, useState } from "react";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function getBase(t: any, key: string) {
  return t.sizePresets?.find((x: any) => x.key === key)?.basePrice ?? 0;
}

export default function TemplatesAdmin({ initialTemplates }: { initialTemplates: any[] }) {
  const [rows, setRows] = useState(initialTemplates);

  // Create form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [M24, setM24] = useState("18000");
  const [M30, setM30] = useState("24000");
  const [makeDefault, setMakeDefault] = useState(false);
  const [creating, setCreating] = useState(false);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ad = a.isDefault ? 1 : 0;
      const bd = b.isDefault ? 1 : 0;
      if (ad !== bd) return bd - ad;
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
  }, [rows]);

  function updateLocal(id: string, patch: any) {
    setRows((prev) => prev.map((x) => (x._id === id ? { ...x, ...patch } : x)));
  }

  async function createTemplate() {
    const n = name.trim();
    const s = (slug.trim() || slugify(n)).trim();
    const p24 = Number(M24);
    const p30 = Number(M30);

    if (!n) return alert("Name required");
    if (!s) return alert("Slug required");
    if (Number.isNaN(p24) || Number.isNaN(p30)) return alert("Prices must be numbers");

    setCreating(true);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          category: "mandir",
          name: n,
          slug: s,
          description: createDescription.trim(),
          M24: p24,
          M30: p30,
          isDefault: makeDefault,
        }),
      });

      const j = await res.json().catch(() => null);
      if (!res.ok) return alert(j?.error ?? "Create failed");

      setRows((prev) => {
        const next = makeDefault ? prev.map((x) => ({ ...x, isDefault: false })) : prev;
        return [j.item, ...next];
      });

      setName("");
      setSlug("");
      setCreateDescription("");
      setMakeDefault(false);
    } finally {
      setCreating(false);
    }
  }

  async function saveTemplate(t: any) {
    const p24 = Number(getBase(t, "M24"));
    const p30 = Number(getBase(t, "M30"));
    if (Number.isNaN(p24) || Number.isNaN(p30)) return alert("Prices must be numbers");

    const res = await fetch(`/api/admin/templates/${t._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: t.name,
        slug: t.slug,
        description: (t.description ?? "").toString(),
        enabled: !!t.enabled,
        M24: p24,
        M30: p30,
      }),
    });

    const j = await res.json().catch(() => null);
    if (!res.ok) return alert(j?.error ?? "Save failed");

    setRows((prev) => prev.map((x) => (x._id === t._id ? j.item : x)));
  }

  async function setDefault(t: any) {
    const res = await fetch(`/api/admin/templates/${t._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });

    const j = await res.json().catch(() => null);
    if (!res.ok) return alert(j?.error ?? "Failed");

    setRows((prev) => prev.map((x) => (x._id === t._id ? j.item : { ...x, isDefault: false })));
  }

  return (
    <div className="space-y-6">
      {/* Create template */}
      <div className="rounded border p-4 space-y-3 max-w-2xl">
        <div className="font-semibold">Create Mandir Template</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm">Name</div>
            <input
              className="w-full rounded border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mandir Classic"
            />
          </div>

          <div>
            <div className="text-sm">Slug (optional)</div>
            <input
              className="w-full rounded border px-3 py-2"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="mandir-classic"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="text-sm">Description (optional)</div>
            <textarea
              className="w-full rounded border px-3 py-2"
              rows={3}
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="e.g., Traditional arch + premium carving style..."
            />
          </div>

          <div>
            <div className="text-sm">M24 Base Price</div>
            <input className="w-full rounded border px-3 py-2" value={M24} onChange={(e) => setM24(e.target.value)} />
          </div>

          <div>
            <div className="text-sm">M30 Base Price</div>
            <input className="w-full rounded border px-3 py-2" value={M30} onChange={(e) => setM30(e.target.value)} />
          </div>
        </div>

        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} />
          Make default template
        </label>

        <button
          type="button"
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={creating}
          onClick={createTemplate}
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      {/* Existing templates */}
      <div className="space-y-3">
        {sorted.map((t) => (
          <div key={t._id} className="rounded border p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{t.name}</div>

                  {t.isDefault ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      DEFAULT
                    </span>
                  ) : null}

                  {!t.enabled ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
                      DISABLED
                    </span>
                  ) : null}
                </div>
                <div className="text-sm text-gray-600">slug: {t.slug}</div>
              </div>

              <div className="flex gap-2">
                <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => setDefault(t)}>
                  Set Default
                </button>
                <button type="button" className="rounded bg-black text-white px-3 py-2 text-sm" onClick={() => saveTemplate(t)}>
                  Save
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <div className="text-sm">Name</div>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={t.name}
                  onChange={(e) => updateLocal(t._id, { name: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <div className="text-sm">Slug</div>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={t.slug}
                  onChange={(e) => updateLocal(t._id, { slug: e.target.value })}
                />
              </div>

              <div className="sm:col-span-4">
                <div className="text-sm">Description</div>
                <textarea
                  className="w-full rounded border px-3 py-2"
                  rows={3}
                  value={t.description ?? ""}
                  onChange={(e) => updateLocal(t._id, { description: e.target.value })}
                />
              </div>

              <div>
                <div className="text-sm">M24</div>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={String(getBase(t, "M24"))}
                  onChange={(e) =>
                    updateLocal(t._id, {
                      sizePresets: t.sizePresets.map((sp: any) => (sp.key === "M24" ? { ...sp, basePrice: e.target.value } : sp)),
                    })
                  }
                />
              </div>

              <div>
                <div className="text-sm">M30</div>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={String(getBase(t, "M30"))}
                  onChange={(e) =>
                    updateLocal(t._id, {
                      sizePresets: t.sizePresets.map((sp: any) => (sp.key === "M30" ? { ...sp, basePrice: e.target.value } : sp)),
                    })
                  }
                />
              </div>

              <div className="flex items-end">
                <label className="text-sm flex items-center gap-2">
                  <input type="checkbox" checked={!!t.enabled} onChange={(e) => updateLocal(t._id, { enabled: e.target.checked })} />
                  Enabled
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}