"use client";

import { useMemo, useState } from "react";

const categories = [
  "mandir",
  "chairs",
  "tables",
  "cabinets",
  "wooden-art",
  "pillars-posts",
  "decor",
] as const;

const ALT_SUFFIX = " — Anshika Wood Art Pune";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function tagsToString(tags: any): string {
  if (!Array.isArray(tags)) return "";
  return tags.join(", ");
}

function tagsToArray(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function CreationsAdmin({
  initialItems,
  mandirTemplates,
}: {
  initialItems: any[];
  mandirTemplates: { name: string; slug: string; isDefault?: boolean }[];
}) {
  const [items, setItems] = useState<any[]>(
    initialItems.map((x) => ({
      ...x,
      _dirty: false,
      _saving: false,
      _error: null as string | null,
      _tagsText: tagsToString(x.tags),
    }))
  );

  // Create form state
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("mandir");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [fixedPrice, setFixedPrice] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [featured, setFeatured] = useState(false);
  const [customizable, setCustomizable] = useState(false);
  const [templateSlug, setTemplateSlug] = useState(
    mandirTemplates.find((t) => t.isDefault)?.slug ?? mandirTemplates[0]?.slug ?? ""
  );

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [items]);

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/creations/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error ?? "Upload failed");
    return j.image;
  }

  async function patchItem(itemId: string, patch: any) {
    const res = await fetch(`/api/admin/creations/${itemId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok) throw new Error(j?.error ?? "Update failed");
    return j.item;
  }

  function updateLocal(id: string, patch: any) {
    setItems((prev) =>
      prev.map((x) =>
        x._id === id ? { ...x, ...patch, _dirty: true, _error: null } : x
      )
    );
  }

  async function createItem() {
    if (!title.trim()) return;

    setCreating(true);
    try {
      const finalSlug = (slug.trim() || slugify(title)).trim();

      const res = await fetch("/api/admin/creations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: finalSlug,
          category,
          shortDescription,
          longDescription,
          tags: tagsToArray(tagsText),
          fixedPrice: Number(fixedPrice || 0),
          startingPrice: Number(startingPrice || 0),
          sortOrder: Number(sortOrder || 0),
          featured,
          enabled: true,
          customizable,
          templateSlug: customizable && category === "mandir" ? templateSlug : "",
          images: [],
        }),
      });

      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error ?? "Create failed");

      setItems((x) => [
        {
          ...j.item,
          _dirty: false,
          _saving: false,
          _error: null,
          _tagsText: tagsToString(j.item.tags),
        },
        ...x,
      ]);

      // reset form
      setTitle("");
      setSlug("");
      setShortDescription("");
      setLongDescription("");
      setTagsText("");
      setFixedPrice("");
      setStartingPrice("");
      setSortOrder("0");
      setFeatured(false);
      setCustomizable(false);
    } finally {
      setCreating(false);
    }
  }

  async function saveItem(it: any) {
    setItems((prev) => prev.map((x) => (x._id === it._id ? { ...x, _saving: true } : x)));

    try {
      const updated = await patchItem(it._id, {
        title: it.title,
        slug: it.slug,
        category: it.category,
        shortDescription: it.shortDescription ?? "",
        longDescription: it.longDescription ?? "",
        tags: tagsToArray(it._tagsText ?? ""),
        fixedPrice: Number(it.fixedPrice || 0),
        startingPrice: Number(it.startingPrice || 0),
        sortOrder: Number(it.sortOrder || 0),
        featured: !!it.featured,
        enabled: !!it.enabled,
        customizable: !!it.customizable,
        templateSlug: it.customizable && it.category === "mandir" ? (it.templateSlug ?? "") : "",
        images: it.images ?? [],
      });

      setItems((prev) =>
        prev.map((x) =>
          x._id === it._id
            ? { ...updated, _dirty: false, _saving: false, _error: null, _tagsText: tagsToString(updated.tags) }
            : x
        )
      );
    } catch (e: any) {
      setItems((prev) =>
        prev.map((x) =>
          x._id === it._id ? { ...x, _saving: false, _error: e?.message ?? "Save failed" } : x
        )
      );
    }
  }

  async function addImage(itemId: string, file: File) {
    const image = await uploadImage(file);
    const item = items.find((x) => x._id === itemId);
    if (!item) return;

    const alt = `${item.title}${ALT_SUFFIX}`;
    const nextImages = [...(item.images ?? []), { ...image, alt }];

    updateLocal(itemId, { images: nextImages });
    await saveItem({ ...item, images: nextImages });
  }

  async function updateImageAlt(itemId: string, publicId: string, alt: string) {
    const item = items.find((x) => x._id === itemId);
    if (!item) return;

    const nextImages = (item.images ?? []).map((img: any) =>
      img.publicId === publicId ? { ...img, alt } : img
    );

    updateLocal(itemId, { images: nextImages });
    await saveItem({ ...item, images: nextImages });
  }

  async function setCoverImage(itemId: string, publicId: string) {
    const item = items.find((x) => x._id === itemId);
    if (!item) return;

    const imgs = item.images ?? [];
    const idx = imgs.findIndex((x: any) => x.publicId === publicId);
    if (idx < 0) return;

    const nextImages = [imgs[idx], ...imgs.slice(0, idx), ...imgs.slice(idx + 1)];
    updateLocal(itemId, { images: nextImages });
    await saveItem({ ...item, images: nextImages });
  }

  async function removeImage(itemId: string, publicId: string) {
    const ok = confirm("Remove this image?");
    if (!ok) return;

    const item = items.find((x) => x._id === itemId);
    if (!item) return;

    const nextImages = (item.images ?? []).filter((img: any) => img.publicId !== publicId);
    updateLocal(itemId, { images: nextImages });
    await saveItem({ ...item, images: nextImages });
  }

  async function removeItem(itemId: string) {
    const ok = confirm("Delete this creation item?");
    if (!ok) return;

    await fetch(`/api/admin/creations/${itemId}`, { method: "DELETE" });
    setItems((curr) => curr.filter((x) => x._id !== itemId));
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">Creations (Catalog)</h1>

      {/* Create new item */}
      <div className="rounded border p-4 space-y-3">
        <div className="font-semibold">Add New Item</div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-sm">Title</div>
            <input className="w-full rounded border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <div className="text-sm">Slug (optional)</div>
            <input className="w-full rounded border px-3 py-2" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from title if empty" />
          </div>

          <div>
            <div className="text-sm">Category</div>
            <select className="w-full rounded border px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value as any)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <div className="text-sm">Sort Order</div>
            <input className="w-full rounded border px-3 py-2" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <div className="text-sm">Short Description</div>
            <textarea className="w-full rounded border px-3 py-2" rows={2} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <div className="text-sm">Long Description</div>
            <textarea className="w-full rounded border px-3 py-2" rows={4} value={longDescription} onChange={(e) => setLongDescription(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <div className="text-sm">Tags (comma separated)</div>
            <input className="w-full rounded border px-3 py-2" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="e.g. teak, carved, mandir" />
          </div>

          <div>
            <div className="text-sm">Fixed Price (ready-made)</div>
            <input className="w-full rounded border px-3 py-2" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} placeholder="e.g. 25000" />
          </div>

          <div>
            <div className="text-sm">Starting Price (custom)</div>
            <input className="w-full rounded border px-3 py-2" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="e.g. 18000" />
          </div>

          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>

          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={customizable} onChange={(e) => setCustomizable(e.target.checked)} />
            Customizable (show “Customize similar”)
          </label>

          {customizable && category === "mandir" ? (
            <div className="md:col-span-2">
              <div className="text-sm">Customizer Template (Mandir)</div>
              <select className="w-full rounded border px-3 py-2" value={templateSlug} onChange={(e) => setTemplateSlug(e.target.value)}>
                {mandirTemplates.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} {t.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <button
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={!title.trim() || creating}
          onClick={createItem}
          type="button"
        >
          {creating ? "Creating..." : "Create"}
        </button>

        <div className="text-xs text-gray-600">
          Image alt text auto-generates as: <b>{`{Title}${ALT_SUFFIX}`}</b>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {sortedItems.map((it) => (
          <div key={it._id} className="rounded border p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{it.title}</div>
                <div className="text-sm text-gray-600">/creations/{it.slug} • {it.category}</div>
                {it._error ? <div className="text-sm text-red-600 mt-1">{it._error}</div> : null}
                {it._dirty ? <div className="text-xs text-amber-700 mt-1">Unsaved changes</div> : null}
              </div>

              <div className="flex gap-2">
                <button className="rounded border px-3 py-2 text-sm" type="button" onClick={() => updateLocal(it._id, { enabled: !it.enabled })}>
                  {it.enabled ? "Disable" : "Enable"}
                </button>

                <button
                  className="rounded bg-black text-white px-3 py-2 text-sm disabled:opacity-60"
                  type="button"
                  disabled={!!it._saving}
                  onClick={() => saveItem(it)}
                >
                  {it._saving ? "Saving..." : "Save"}
                </button>

                <button className="rounded border px-3 py-2 text-sm" type="button" onClick={() => removeItem(it._id)}>
                  Delete
                </button>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-sm">Title</div>
                <input className="w-full rounded border px-3 py-2" value={it.title} onChange={(e) => updateLocal(it._id, { title: e.target.value })} />
              </div>

              <div>
                <div className="text-sm">Slug</div>
                <input className="w-full rounded border px-3 py-2" value={it.slug} onChange={(e) => updateLocal(it._id, { slug: e.target.value })} />
              </div>

              <div>
                <div className="text-sm">Category</div>
                <select className="w-full rounded border px-3 py-2" value={it.category} onChange={(e) => updateLocal(it._id, { category: e.target.value })}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <div className="text-sm">Sort Order</div>
                <input className="w-full rounded border px-3 py-2" value={String(it.sortOrder ?? 0)} onChange={(e) => updateLocal(it._id, { sortOrder: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <div className="text-sm">Short Description</div>
                <textarea className="w-full rounded border px-3 py-2" rows={2} value={it.shortDescription ?? ""} onChange={(e) => updateLocal(it._id, { shortDescription: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <div className="text-sm">Long Description</div>
                <textarea className="w-full rounded border px-3 py-2" rows={4} value={it.longDescription ?? ""} onChange={(e) => updateLocal(it._id, { longDescription: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <div className="text-sm">Tags (comma separated)</div>
                <input className="w-full rounded border px-3 py-2" value={it._tagsText ?? ""} onChange={(e) => updateLocal(it._id, { _tagsText: e.target.value })} />
              </div>

              <div>
                <div className="text-sm">Fixed Price</div>
                <input className="w-full rounded border px-3 py-2" value={String(it.fixedPrice ?? 0)} onChange={(e) => updateLocal(it._id, { fixedPrice: e.target.value })} />
              </div>

              <div>
                <div className="text-sm">Starting Price</div>
                <input className="w-full rounded border px-3 py-2" value={String(it.startingPrice ?? 0)} onChange={(e) => updateLocal(it._id, { startingPrice: e.target.value })} />
              </div>

              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={!!it.featured} onChange={(e) => updateLocal(it._id, { featured: e.target.checked })} />
                Featured
              </label>

              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={!!it.customizable} onChange={(e) => updateLocal(it._id, { customizable: e.target.checked })} />
                Customizable
              </label>

              {it.customizable && it.category === "mandir" ? (
                <div className="md:col-span-2">
                  <div className="text-sm">Customizer Template (Mandir)</div>
                  <select className="w-full rounded border px-3 py-2" value={it.templateSlug ?? ""} onChange={(e) => updateLocal(it._id, { templateSlug: e.target.value })}>
                    <option value="">(Select)</option>
                    {mandirTemplates.map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.name} {t.isDefault ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {/* Images */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) addImage(it._id, f);
                  e.currentTarget.value = "";
                }}
              />
              <div className="text-sm text-gray-600">Images: {it.images?.length ?? 0}</div>
            </div>

            {it.images?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {it.images.map((img: any, idx: number) => (
                  <div key={img.publicId + idx} className="rounded border p-2 space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt || it.title} className="w-full rounded object-cover aspect-[4/3]" />

                    <div className="flex gap-2">
                      <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setCoverImage(it._id, img.publicId)} disabled={idx === 0}>
                        {idx === 0 ? "Cover" : "Set cover"}
                      </button>
                      <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => removeImage(it._id, img.publicId)}>
                        Remove
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">Alt text (SEO)</div>
                      <input
                        className="w-full rounded border px-2 py-1 text-xs"
                        defaultValue={img.alt || `${it.title}${ALT_SUFFIX}`}
                        onBlur={(e) => {
                          const nextAlt = e.target.value.trim();
                          if ((img.alt ?? "").trim() !== nextAlt) updateImageAlt(it._id, img.publicId, nextAlt);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}