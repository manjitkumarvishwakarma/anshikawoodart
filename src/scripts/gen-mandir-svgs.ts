import fs from "node:fs";
import path from "node:path";

type SizeKey = "M24" | "M30";

type PartDef = {
  id: string;
  w24: number; h24: number;
  w30: number; h30: number;
  stroke: string;
  fill: string;
};

const parts: PartDef[] = [
  { id: "base_a", w24: 520, h24: 120, w30: 640, h30: 140, stroke: "#6b3f2a", fill: "rgba(193,132,87,0.20)" },
  { id: "base_b", w24: 520, h24: 120, w30: 640, h30: 140, stroke: "#6b3f2a", fill: "rgba(183,119,79,0.20)" },

  { id: "back_plain", w24: 520, h24: 420, w30: 640, h30: 480, stroke: "#5a3a22", fill: "rgba(214,164,106,0.12)" },
  { id: "back_carved", w24: 520, h24: 420, w30: 640, h30: 480, stroke: "#5a3a22", fill: "rgba(204,154,97,0.14)" },

  { id: "pillar_set_1", w24: 520, h24: 420, w30: 640, h30: 480, stroke: "#5a3a22", fill: "rgba(185,138,93,0.10)" },
  { id: "pillar_set_2", w24: 520, h24: 420, w30: 640, h30: 480, stroke: "#5a3a22", fill: "rgba(174,128,86,0.10)" },

  { id: "canopy_1", w24: 520, h24: 120, w30: 640, h30: 140, stroke: "#5a3a22", fill: "rgba(178,124,78,0.14)" },
  { id: "canopy_2", w24: 520, h24: 120, w30: 640, h30: 140, stroke: "#5a3a22", fill: "rgba(167,114,70,0.14)" },

  { id: "frontframe_1", w24: 520, h24: 460, w30: 640, h30: 520, stroke: "#4b2f1c", fill: "rgba(193,138,87,0.08)" },
  { id: "frontframe_2", w24: 520, h24: 460, w30: 640, h30: 520, stroke: "#4b2f1c", fill: "rgba(184,127,82,0.08)" },

  { id: "doors_plain", w24: 460, h24: 420, w30: 560, h30: 480, stroke: "#4b2f1c", fill: "rgba(209,160,106,0.12)" },
  { id: "doors_jali", w24: 460, h24: 420, w30: 560, h30: 480, stroke: "#4b2f1c", fill: "rgba(199,149,98,0.12)" },

  { id: "drawer_2", w24: 440, h24: 110, w30: 540, h30: 130, stroke: "#4b2f1c", fill: "rgba(178,123,81,0.14)" },

  { id: "shelf_1", w24: 360, h24: 30, w30: 440, h30: 30, stroke: "#4b2f1c", fill: "rgba(168,115,73,0.14)" },
  { id: "shelf_2", w24: 360, h24: 60, w30: 440, h30: 60, stroke: "#4b2f1c", fill: "rgba(159,109,69,0.14)" },

  { id: "orn_corners", w24: 80, h24: 80, w30: 90, h30: 90, stroke: "#3a2416", fill: "rgba(143,94,61,0.20)" },
  { id: "finial", w24: 70, h24: 90, w30: 80, h30: 110, stroke: "#3a2416", fill: "rgba(127,81,53,0.20)" },
];

function svgFor(id: string, w: number, h: number, stroke: string, fill: string) {
  const s = 3; // stroke width

  // Transparent background. Shapes only.
  if (id.startsWith("base_")) {
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <path d="M20 ${h-20} L${w-20} ${h-20} L${w-40} ${h-5} L40 ${h-5} Z" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
  <rect x="50" y="${h-70}" width="${w-100}" height="45" rx="8" fill="rgba(0,0,0,0)" stroke="${stroke}" stroke-width="${s}"/>
</svg>`;
  }

  if (id.startsWith("back_")) {
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="20" y="20" width="${w-40}" height="${h-40}" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
  <path d="M${w/2} 70 C ${w/2-80} 70, ${w/2-120} 170, ${w/2-120} 230
           C ${w/2-120} 330, ${w/2+120} 330, ${w/2+120} 230
           C ${w/2+120} 170, ${w/2+80} 70, ${w/2} 70 Z"
        fill="rgba(255,255,255,0.03)" stroke="rgba(0,0,0,0.18)" stroke-width="2"/>
</svg>`;
  }

  if (id.startsWith("pillar_set_")) {
    const colW = Math.round(w * 0.12);
    const colH = Math.round(h * 0.86);
    const y = Math.round(h * 0.08);
    const leftX = Math.round(w * 0.12);
    const rightX = Math.round(w * 0.76);
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="${leftX}" y="${y}" width="${colW}" height="${colH}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
  <rect x="${rightX}" y="${y}" width="${colW}" height="${colH}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
  <rect x="${leftX-10}" y="${y-10}" width="${colW+20}" height="26" rx="10" fill="rgba(0,0,0,0)" stroke="${stroke}" stroke-width="${s}"/>
  <rect x="${rightX-10}" y="${y-10}" width="${colW+20}" height="26" rx="10" fill="rgba(0,0,0,0)" stroke="${stroke}" stroke-width="${s}"/>
</svg>`;
  }

  if (id.startsWith("canopy_")) {
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <path d="M20 ${h-20} L${w/2} 15 L${w-20} ${h-20} Z" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
  <rect x="30" y="${h-35}" width="${w-60}" height="18" rx="8" fill="rgba(0,0,0,0)" stroke="${stroke}" stroke-width="${s}"/>
</svg>`;
  }

  if (id.startsWith("frontframe_")) {
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="28" y="28" width="${w-56}" height="${h-56}" rx="24" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
  <path d="M${w/2} 90 C ${w/2-120} 90, ${w/2-150} 220, ${w/2-150} 290
           C ${w/2-150} 390, ${w/2+150} 390, ${w/2+150} 290
           C ${w/2+150} 220, ${w/2+120} 90, ${w/2} 90 Z"
        fill="rgba(255,255,255,0.02)" stroke="rgba(0,0,0,0.25)" stroke-width="2"/>
</svg>`;
  }

  if (id.startsWith("doors_")) {
    const pad = 20;
    const mid = Math.round(w / 2);
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="${pad}" y="${pad}" width="${mid-pad-4}" height="${h-2*pad}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
  <rect x="${mid+4}" y="${pad}" width="${mid-pad-4}" height="${h-2*pad}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
  <circle cx="${mid-18}" cy="${Math.round(h/2)}" r="5" fill="${stroke}"/>
  <circle cx="${mid+18}" cy="${Math.round(h/2)}" r="5" fill="${stroke}"/>
</svg>`;
  }

  if (id === "drawer_2") {
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="20" y="15" width="${w-40}" height="${h-30}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
  <line x1="20" y1="${Math.round(h/2)}" x2="${w-20}" y2="${Math.round(h/2)}" stroke="${stroke}" stroke-width="2" opacity="0.5"/>
</svg>`;
  }

  if (id.startsWith("shelf_")) {
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="10" y="6" width="${w-20}" height="${h-12}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
</svg>`;
  }

  if (id === "orn_corners") {
    return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <path d="M10 10 H${w-10} V${Math.round(h*0.55)} C ${w-10} ${Math.round(h*0.7)}, ${Math.round(w*0.65)} ${h-10}, ${Math.round(w*0.5)} ${h-10}
           H10 Z" fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
</svg>`;
  }

  // finial
  return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <path d="M${w/2} 10
           C ${w*0.18} ${h*0.35}, ${w*0.28} ${h*0.82}, ${w/2} ${h-10}
           C ${w*0.72} ${h*0.82}, ${w*0.82} ${h*0.35}, ${w/2} 10 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="${s}"/>
</svg>`;
}

function outPath(size: SizeKey, id: string) {
  return path.join(process.cwd(), "public", "parts", "mandir", size, `${id}.svg`);
}

for (const p of parts) {
  fs.writeFileSync(outPath("M24", p.id), svgFor(p.id, p.w24, p.h24, p.stroke, p.fill), "utf8");
  fs.writeFileSync(outPath("M30", p.id), svgFor(p.id, p.w30, p.h30, p.stroke, p.fill), "utf8");
}

console.log("Generated improved mandir SVGs:", parts.length * 2);