"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, Group, Image as KonvaImage, Layer, Rect, Stage, Text } from "react-konva";

type SizeKey = "M24" | "M30";
type Unit = "inch" | "mm";

type Material = {
  _id: string;
  name: string;
  multiplier: number;
  previewColor?: string;
};

type Template = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  isDefault?: boolean;
  enabled?: boolean;
  sizePresets: { key: SizeKey; label: string; basePrice: number }[];
};

type Anchor = {
  id: string;
  type: string;
  gender: "male" | "female";
  x: number;
  y: number;
};

type Part = {
  _id: string;
  key: string;
  name: string;
  group: string;
  layerOrder: number;
  imageBySize: { M24: string; M30: string };
  pricesBySize: { M24: number; M30: number };
  anchors: Anchor[];
};

type PlacedItem = {
  id: string;
  partKey: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  snappedTo?: {
    targetItemId: string;
    targetAnchorId: string;
    myAnchorId: string;
  };
};

const SNAP_THRESHOLD_PX = 120;

const REF_DIMS_M24: Record<string, { w: number; h: number }> = {
  base_a: { w: 520, h: 120 },
  base_b: { w: 520, h: 120 },
  back_plain: { w: 520, h: 420 },
  back_carved: { w: 520, h: 420 },
  pillar_set_1: { w: 520, h: 420 },
  pillar_set_2: { w: 520, h: 420 },
  canopy_1: { w: 520, h: 120 },
  canopy_2: { w: 520, h: 120 },
  frontframe_1: { w: 520, h: 460 },
  frontframe_2: { w: 520, h: 460 },
  doors_plain: { w: 460, h: 420 },
  doors_jali: { w: 460, h: 420 },
  drawer_2: { w: 440, h: 110 },
  shelf_1: { w: 360, h: 30 },
  shelf_2: { w: 360, h: 60 },
  orn_corners: { w: 80, h: 80 },
  finial: { w: 70, h: 90 },
  orn_top: { w: 70, h: 90 },
};

function groupParts(parts: Part[]) {
  const map = new Map<string, Part[]>();
  for (const p of parts) {
    const arr = map.get(p.group) ?? [];
    arr.push(p);
    map.set(p.group, arr);
  }
  return map;
}

function useElementSize() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 900, h: 640 });

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ w: Math.max(320, Math.floor(cr.width)), h: 640 });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function makeWhatsAppLink(phoneE164: string, message: string) {
  return `https://wa.me/${phoneE164}?text=${encodeURIComponent(message)}`;
}

function normalizeIndiaPhoneToE164(input: string) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  let v = raw.replace(/[^\d+]/g, "");
  if (v.includes("+")) v = (v.startsWith("+") ? "+" : "") + v.replace(/\+/g, "");

  if (v.startsWith("+")) {
    const digits = v.slice(1).replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return null;
  }

  const digits = v.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  return null;
}

export default function MandirCustomizer({
  materials,
  templates,
  parts,
}: {
  materials: Material[];
  templates: Template[];
  parts: Part[];
}) {
  const { ref: canvasWrapRef, size: stageSize } = useElementSize();
  const stageRef = useRef<any>(null);

  const partsByKey = useMemo(() => {
    const m = new Map<string, Part>();
    for (const p of parts) m.set(p.key, p);
    return m;
  }, [parts]);

  const partsByGroup = useMemo(() => groupParts(parts), [parts]);

  const defaultTemplate = useMemo(
    () => templates.find((t) => t.isDefault) ?? templates[0],
    [templates]
  );

  const [templateSlug, setTemplateSlug] = useState<string>(defaultTemplate?.slug ?? "");
  const activeTemplate = useMemo(
    () => templates.find((t) => t.slug === templateSlug) ?? defaultTemplate,
    [templates, templateSlug, defaultTemplate]
  );

  const [sizeKey, setSizeKey] = useState<SizeKey>(activeTemplate?.sizePresets?.[0]?.key ?? "M24");
  const [materialId, setMaterialId] = useState<string>(materials[0]?._id ?? "");
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAnchors, setShowAnchors] = useState(false);

  // Custom size
  const [needCustomSize, setNeedCustomSize] = useState(false);
  const [unit, setUnit] = useState<Unit>("inch");
  const [cWidth, setCWidth] = useState("");
  const [cHeight, setCHeight] = useState("");
  const [cDepth, setCDepth] = useState("");

  const [imgMap, setImgMap] = useState<Record<string, HTMLImageElement>>({});

  // Save/Enquiry
  const [saving, setSaving] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verifiedEstimate, setVerifiedEstimate] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [enqName, setEnqName] = useState("");
  const [enqPhone, setEnqPhone] = useState("");
  const [enqCity, setEnqCity] = useState("");
  const [enqNotes, setEnqNotes] = useState("");
  const [enqSubmitting, setEnqSubmitting] = useState(false);
  const [enqMsg, setEnqMsg] = useState<string | null>(null);

  // Honeypot (hidden input bots may fill)
  const [hp, setHp] = useState("");

  function invalidateSavedDesign() {
    setDesignId(null);
    setPreviewUrl(null);
    setVerifiedEstimate(null);
    setSaveError(null);
  }

  // Template change → reset sizeKey if not allowed
  useEffect(() => {
    if (!activeTemplate) return;
    const allowed = new Set(activeTemplate.sizePresets.map((s) => s.key));
    if (!allowed.has(sizeKey)) {
      setSizeKey(activeTemplate.sizePresets[0]?.key ?? "M24");
    }
    invalidateSavedDesign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSlug]);

  // Wood/custom size changes → force re-save
  useEffect(() => {
    invalidateSavedDesign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId, needCustomSize, unit, cWidth, cHeight, cDepth]);

  const basePrice = useMemo(
    () => activeTemplate?.sizePresets?.find((s) => s.key === sizeKey)?.basePrice ?? 0,
    [activeTemplate, sizeKey]
  );

  const materialMultiplier = useMemo(
    () => materials.find((m) => m._id === materialId)?.multiplier ?? 1,
    [materialId, materials]
  );

  const partsTotal = useMemo(() => {
    let sum = 0;
    for (const it of items) {
      const p = partsByKey.get(it.partKey);
      if (!p) continue;
      sum += p.pricesBySize[sizeKey] ?? 0;
    }
    return sum;
  }, [items, partsByKey, sizeKey]);

  const liveEstimate = useMemo(
    () => Math.round((basePrice + partsTotal) * materialMultiplier),
    [basePrice, partsTotal, materialMultiplier]
  );

  // Load images
  useEffect(() => {
    let cancelled2 = false;
    (async () => {
      const entries = parts.map((p) => [p.key, p.imageBySize[sizeKey]] as const);
      const next: Record<string, HTMLImageElement> = {};
      try {
        for (const [key, src] of entries) next[key] = await loadImage(src);
        if (!cancelled2) setImgMap(next);
      } catch {}
    })();
    return () => {
      cancelled2 = true;
    };
  }, [parts, sizeKey]);

  // Reset base on size change
  useEffect(() => {
    const baseKey = "base_a";
    const baseImg = imgMap[baseKey];
    if (!baseImg) return;

    const x = Math.floor((stageSize.w - baseImg.naturalWidth) / 2);
    const y = Math.floor(stageSize.h - baseImg.naturalHeight - 20);

    setItems([{ id: crypto.randomUUID(), partKey: baseKey, x, y, rotation: 0, scale: 1 }]);
    setSelectedId(null);

    invalidateSavedDesign();
    setEnqMsg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeKey, imgMap["base_a"], stageSize.w]);

  function getScaledAnchorPx(partKey: string, anchor: Anchor, img: HTMLImageElement) {
    const ref = REF_DIMS_M24[partKey];
    if (!ref) return { x: anchor.x, y: anchor.y };
    const sx = img.naturalWidth / ref.w;
    const sy = img.naturalHeight / ref.h;
    return { x: anchor.x * sx, y: anchor.y * sy };
  }

  function getAbsAnchor(item: PlacedItem, part: Part, anchor: Anchor) {
    const img = imgMap[part.key];
    if (!img) return null;
    const a = getScaledAnchorPx(part.key, anchor, img);
    return {
      itemId: item.id,
      anchorId: anchor.id,
      type: anchor.type,
      gender: anchor.gender,
      x: item.x + a.x * item.scale,
      y: item.y + a.y * item.scale,
    };
  }

  function findBestSnap(movingItem: PlacedItem, proposedX: number, proposedY: number) {
    const movingPart = partsByKey.get(movingItem.partKey);
    const movingImg = imgMap[movingItem.partKey];
    if (!movingPart || !movingImg) return null;

    const movingMale = movingPart.anchors.filter((a) => a.gender === "male");
    if (!movingMale.length) return null;

    const targetAnchors: NonNullable<ReturnType<typeof getAbsAnchor>>[] = [];
    for (const it of items) {
      if (it.id === movingItem.id) continue;
      const p = partsByKey.get(it.partKey);
      const img = imgMap[it.partKey];
      if (!p || !img) continue;
      for (const a of p.anchors) {
        if (a.gender !== "female") continue;
        const abs = getAbsAnchor(it, p, a);
        if (abs) targetAnchors.push(abs);
      }
    }

    let best: any = null;
    for (const myA of movingMale) {
      const scaled = getScaledAnchorPx(movingPart.key, myA, movingImg);
      const myAbsX = proposedX + scaled.x * movingItem.scale;
      const myAbsY = proposedY + scaled.y * movingItem.scale;

      for (const t of targetAnchors) {
        if (t.type !== myA.type) continue;
        const dx = t.x - myAbsX;
        const dy = t.y - myAbsY;
        const dist = Math.hypot(dx, dy);
        if (dist > SNAP_THRESHOLD_PX) continue;

        const snappedX = proposedX + dx;
        const snappedY = proposedY + dy;

        if (!best || dist < best.dist)
          best = { target: t, myAnchor: myA, dist, snappedX, snappedY };
      }
    }
    return best;
  }

  const singletonGroups = useMemo(() => {
    return new Set(["Base", "Back & Sides", "Pillars", "Top / Canopy", "Front & Doors", "Storage"]);
  }, []);

  function addPart(part: Part) {
    let nextItems = [...items];
    if (singletonGroups.has(part.group)) {
      const base = nextItems.find((it) => partsByKey.get(it.partKey)?.group === "Base");
      nextItems = nextItems.filter((it) => partsByKey.get(it.partKey)?.group !== part.group);
      if (base) nextItems = [base, ...nextItems];
    }
    const img = imgMap[part.key];
    if (!img) return;

    const id = crypto.randomUUID();
    nextItems.push({
      id,
      partKey: part.key,
      x: Math.floor(stageSize.w / 2 - img.naturalWidth / 2),
      y: 30,
      rotation: 0,
      scale: 1,
    });
    setItems(nextItems);
    setSelectedId(id);

    invalidateSavedDesign();
    setEnqMsg(null);
  }

  function removeSelected() {
    if (!selectedId) return;
    const sel = items.find((x) => x.id === selectedId);
    if (!sel) return;
    const group = partsByKey.get(sel.partKey)?.group;
    if (group === "Base") return;
    setItems(items.filter((x) => x.id !== selectedId));
    setSelectedId(null);

    invalidateSavedDesign();
    setEnqMsg(null);
  }

  const renderedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const pa = partsByKey.get(a.partKey);
      const pb = partsByKey.get(b.partKey);
      return (pa?.layerOrder ?? 0) - (pb?.layerOrder ?? 0);
    });
  }, [items, partsByKey]);

  async function saveDesign() {
    setSaveError(null);
    setSaving(true);
    try {
      const stage = stageRef.current;
      if (!stage) throw new Error("Canvas not ready");

      const dataUrl = stage.toDataURL({ pixelRatio: 2 });

      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          templateCategory: "mandir",
          templateSlug,
          sizeKey,
          materialId,
          items,
          dataUrl,
          customSize: {
            enabled: needCustomSize,
            unit,
            width: Number(cWidth || 0),
            height: Number(cHeight || 0),
            depth: Number(cDepth || 0),
          },
          hp,
        }),
      });

      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error ?? "Failed to save design");

      setDesignId(j.designId);
      setPreviewUrl(j.previewImageUrl);
      setVerifiedEstimate(j.verifiedEstimate);

      return { designId: j.designId as string, verifiedEstimate: j.verifiedEstimate as number };
    } catch (e: any) {
      setSaveError(e?.message ?? "Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function submitEnquiry() {
    setEnqMsg(null);
    setSaveError(null);

    if (!enqName.trim()) return setEnqMsg("Please enter your name.");
    const normalizedPhone = normalizeIndiaPhoneToE164(enqPhone);
    if (!normalizedPhone) return setEnqMsg("Enter a valid phone: 10 digits, or +91 followed by 10 digits.");

    setEnqSubmitting(true);
    try {
      setEnqPhone(normalizedPhone);

      let did = designId;
      let ve = verifiedEstimate;

      if (!did) {
        const saved = await saveDesign();
        if (!saved) throw new Error("Please fix save errors and try again.");
        did = saved.designId;
        ve = saved.verifiedEstimate;
      }

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          designId: did,
          name: enqName.trim(),
          phone: normalizedPhone,
          city: enqCity.trim(),
          notes: enqNotes.trim(),
          hp,
        }),
      });

      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error ?? "Failed to submit enquiry");

      const woodName = materials.find((m) => m._id === materialId)?.name ?? "";
      const site = (process.env.NEXT_PUBLIC_SITE_URL as string) || window.location.origin;
      const designUrl = `${site}/design/${did}`;

      let msg =
        `Hi, I want a Mandir quote.\n` +
        `Template: ${activeTemplate?.name ?? templateSlug}\n` +
        `Size preset: ${sizeKey}\n` +
        `Wood: ${woodName}\n` +
        `Estimate: ₹ ${(ve ?? liveEstimate).toLocaleString("en-IN")}\n`;

      if (needCustomSize) {
        msg += `Custom size needed: ${cWidth || 0} x ${cHeight || 0} x ${cDepth || 0} ${unit}\n`;
      }

      msg +=
        `Design: ${designUrl}\n` +
        `Name: ${enqName.trim()}\n` +
        `Phone: ${normalizedPhone}\n` +
        (enqCity.trim() ? `City: ${enqCity.trim()}\n` : "") +
        (enqNotes.trim() ? `Notes: ${enqNotes.trim()}\n` : "");

      window.open(makeWhatsAppLink("918087412575", msg), "_blank", "noopener,noreferrer");
      setEnqMsg("Enquiry submitted. WhatsApp opened.");
    } catch (e: any) {
      setEnqMsg(e?.message ?? "Enquiry failed");
    } finally {
      setEnqSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-12">
      {/* LEFT */}
      <div className="md:col-span-3 rounded border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Parts</div>
          <label className="text-xs flex items-center gap-2 select-none">
            <input type="checkbox" checked={showAnchors} onChange={(e) => setShowAnchors(e.target.checked)} />
            Show anchors
          </label>
        </div>

        {[...partsByGroup.entries()].map(([groupName, groupParts]) => (
          <div key={groupName} className="space-y-2">
            <div className="text-sm font-semibold">{groupName}</div>
            <div className="grid grid-cols-2 gap-2">
              {groupParts.map((p) => (
                <button
                  key={p.key}
                  onClick={() => addPart(p)}
                  className="rounded border bg-white hover:bg-gray-50 p-2 text-left"
                  type="button"
                >
                  <div className="text-xs font-medium line-clamp-2">{p.name}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
                    <span>+₹{(p.pricesBySize[sizeKey] ?? 0).toLocaleString("en-IN")}</span>
                    <span className="opacity-70">{p.key}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CANVAS */}
      <div className="md:col-span-6 rounded border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Design Canvas</div>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={removeSelected}
            disabled={!selectedId}
          >
            Remove
          </button>
        </div>

        <div ref={canvasWrapRef} className="w-full">
          <Stage
            ref={stageRef}
            width={stageSize.w}
            height={stageSize.h}
            onMouseDown={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) setSelectedId(null);
            }}
          >
            <Layer>
              <Rect x={0} y={0} width={stageSize.w} height={stageSize.h} fill="#fafafa" />
              <Text
                x={10}
                y={10}
                text={`Template: ${activeTemplate?.name ?? templateSlug} | Size: ${sizeKey}`}
                fontSize={12}
                fill="#666"
              />

              {renderedItems.map((it) => {
                const part = partsByKey.get(it.partKey);
                const img = imgMap[it.partKey];
                if (!part || !img) return null;

                const isBase = part.group === "Base";
                const isSelected = selectedId === it.id;

                return (
                  <Group
                    key={it.id}
                    x={it.x}
                    y={it.y}
                    draggable={!isBase}
                    onClick={() => setSelectedId(it.id)}
                    onTap={() => setSelectedId(it.id)}
                    onDragEnd={(ev) => {
                      const proposedX = ev.target.x();
                      const proposedY = ev.target.y();
                      const best = findBestSnap(it, proposedX, proposedY);

                      if (!best) {
                        setItems((curr) =>
                          curr.map((x) =>
                            x.id !== it.id
                              ? x
                              : { ...x, x: proposedX, y: proposedY, snappedTo: undefined }
                          )
                        );
                        return;
                      }

                      setItems((curr) =>
                        curr.map((x) =>
                          x.id !== it.id
                            ? x
                            : {
                                ...x,
                                x: Math.round(best.snappedX),
                                y: Math.round(best.snappedY),
                                snappedTo: {
                                  targetItemId: best.target.itemId,
                                  targetAnchorId: best.target.anchorId,
                                  myAnchorId: best.myAnchor.id,
                                },
                              }
                        )
                      );
                      invalidateSavedDesign();
                    }}
                  >
                    <KonvaImage
                      image={img}
                      opacity={isSelected ? 0.92 : 1}
                      stroke={isSelected ? "#111827" : undefined}
                      strokeWidth={isSelected ? 2 : 0}
                    />

                    {showAnchors
                      ? part.anchors.map((a) => {
                          const scaled = getScaledAnchorPx(part.key, a, img);
                          const fill = a.gender === "female" ? "#2563eb" : "#16a34a";
                          return <Circle key={a.id} x={scaled.x} y={scaled.y} radius={5} fill={fill} opacity={0.85} />;
                        })
                      : null}
                  </Group>
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* RIGHT */}
      <div className="md:col-span-3 rounded border p-3 space-y-4">
        {/* Template dropdown */}
        <div>
          <label className="block text-sm font-medium">Template</label>
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={templateSlug}
            onChange={(e) => setTemplateSlug(e.target.value)}
          >
            {templates
              .filter((t) => t.enabled !== false)
              .map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name} {t.isDefault ? "(Default)" : ""}
                </option>
              ))}
          </select>

          {activeTemplate?.isDefault ? (
            <div className="mt-2 inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-semibold">
              DEFAULT
            </div>
          ) : null}

          {activeTemplate?.description ? (
            <div className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">
              {activeTemplate.description}
            </div>
          ) : (
            <div className="mt-2 text-xs text-gray-500">
              No description added for this template yet.
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Size preset</label>
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={sizeKey}
            onChange={(e) => setSizeKey(e.target.value as SizeKey)}
          >
            {activeTemplate?.sizePresets?.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          <div className="text-xs text-gray-600 mt-1">
            Base price for {sizeKey}: <b>₹ {basePrice.toLocaleString("en-IN")}</b>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Wood</label>
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
          >
            {materials.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} (x{m.multiplier})
              </option>
            ))}
          </select>
        </div>

        {/* Custom size */}
        <div className="rounded border p-3 space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <input
              type="checkbox"
              checked={needCustomSize}
              onChange={(e) => setNeedCustomSize(e.target.checked)}
            />
            Need custom size?
          </label>

          {needCustomSize ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  className="rounded border px-2 py-2 text-sm"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                >
                  <option value="inch">inch</option>
                  <option value="mm">mm</option>
                </select>
                <div className="text-xs text-gray-600 self-center">Enter W × H × D</div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input className="rounded border px-2 py-2 text-sm" placeholder="Width" value={cWidth} onChange={(e) => setCWidth(e.target.value)} />
                <input className="rounded border px-2 py-2 text-sm" placeholder="Height" value={cHeight} onChange={(e) => setCHeight(e.target.value)} />
                <input className="rounded border px-2 py-2 text-sm" placeholder="Depth" value={cDepth} onChange={(e) => setCDepth(e.target.value)} />
              </div>

              <div className="text-xs text-gray-500">
                Canvas uses preset size; custom size is included in enquiry for final quote.
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded bg-gray-50 p-3 space-y-1">
          <div className="text-sm font-semibold">Estimate</div>
          <div className="text-xl font-semibold">₹ {liveEstimate.toLocaleString("en-IN")}</div>
          <div className="text-xs text-gray-500">Product estimate only. Final quote may vary.</div>
        </div>

        <div className="rounded border p-3 space-y-2">
          <div className="font-semibold text-sm">Save Design</div>
          {saveError ? <div className="text-xs text-red-600">{saveError}</div> : null}

          <button
            type="button"
            className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
            disabled={saving}
            onClick={saveDesign}
          >
            {saving ? "Saving..." : "Save Design"}
          </button>

          {designId ? (
            <div className="text-xs text-gray-700 space-y-1">
              <div><b>Design ID:</b> {designId}</div>
              {verifiedEstimate != null ? <div><b>Verified:</b> ₹ {verifiedEstimate.toLocaleString("en-IN")}</div> : null}
              {previewUrl ? (
                <a className="text-blue-600 underline" href={previewUrl} target="_blank" rel="noreferrer">
                  View Preview Image
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded border p-3 space-y-2">
          <div className="font-semibold text-sm">Submit Enquiry</div>
          {enqMsg ? <div className="text-xs text-gray-700">{enqMsg}</div> : null}

          {/* Honeypot (hidden) */}
          <div className="hidden" aria-hidden="true">
            <label>Company</label>
            <input
              tabIndex={-1}
              autoComplete="off"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
            />
          </div>

          <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Your Name" value={enqName} onChange={(e) => setEnqName(e.target.value)} />

          <input
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="Phone (WhatsApp) e.g. 9876543210 or +919876543210"
            type="tel"
            inputMode="tel"
            value={enqPhone}
            onChange={(e) => {
              let v = e.target.value;
              v = v.replace(/[^\d+]/g, "");
              if (v.includes("+")) v = (v.startsWith("+") ? "+" : "") + v.replace(/\+/g, "");
              if (v.startsWith("+")) v = v.slice(0, 13);
              else v = v.replace(/\D/g, "").slice(0, 10);
              setEnqPhone(v);
            }}
          />

          <input className="w-full rounded border px-3 py-2 text-sm" placeholder="City (optional)" value={enqCity} onChange={(e) => setEnqCity(e.target.value)} />
          <textarea className="w-full rounded border px-3 py-2 text-sm" placeholder="Notes (optional)" rows={3} value={enqNotes} onChange={(e) => setEnqNotes(e.target.value)} />

          <button
            type="button"
            className="w-full rounded bg-emerald-700 text-white py-2 disabled:opacity-60"
            disabled={enqSubmitting}
            onClick={submitEnquiry}
          >
            {enqSubmitting ? "Submitting..." : "Submit & WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}