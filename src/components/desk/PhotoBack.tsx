import { memo } from "react";
import { getAsset } from "@/lib/desk/assets";
import type { WorkspaceObject } from "@/lib/desk/types";

/**
 * Designed reverse of a photo or paper. The silhouette is the mirror of the
 * front (as a real flipped sheet), while handwriting stays readable.
 * One shared texture + a small doodle set; each object gets a stable variation
 * from its id, so nothing changes between renders.
 */
const PHRASES = [
  "un día bonito", "para recordar", "pequeños momentos", "qué bonito fue",
  "otra vez, por favor", "luz de tarde", "nosotros", "no olvidar", "casa", "siempre",
];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const DOODLES: ((c: string) => React.ReactNode)[] = [
  (c) => <path d="M12 2l2.6 6.6 7 .5-5.4 4.5 1.8 6.9L12 16.8 6 20.5l1.8-6.9L2.4 9.1l7-.5z" fill="none" stroke={c} strokeWidth="1.3" strokeLinejoin="round" />,
  (c) => <path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20z" fill="none" stroke={c} strokeWidth="1.3" />,
  (c) => <g fill="none" stroke={c} strokeWidth="1.2"><circle cx="12" cy="12" r="4" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M12 4.5V2" transform={`rotate(${a} 12 12)`} />)}</g>,
  (c) => <g fill="none" stroke={c} strokeWidth="1.2"><circle cx="12" cy="12" r="2" />{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="12" cy="6.5" rx="2.6" ry="4" transform={`rotate(${a} 12 12)`} />)}</g>,
  (c) => <path d="M2 14c3-5 5 3 8-2s5 3 8-2 3 2 4 1" fill="none" stroke={c} strokeWidth="1.2" strokeLinecap="round" />,
  (c) => <g fill={c}><circle cx="5" cy="12" r="1" /><circle cx="11" cy="10" r="1.1" /><circle cx="17" cy="13" r=".9" /></g>,
];

function sizeOf(obj: WorkspaceObject) {
  if (obj.type === "polaroid") return { w: 190, h: obj.caption ? 250 : 216 };
  const a = getAsset(obj.assetId);
  return { w: obj.w ?? a?.w ?? 120, h: obj.h ?? a?.h ?? 120 };
}

export const PhotoBack = memo(function PhotoBack({ obj }: { obj: WorkspaceObject }) {
  const { w, h } = sizeOf(obj);
  const src = obj.assetSrc ?? getAsset(obj.assetId)?.src;
  const isPhoto = obj.type === "polaroid" || obj.type === "photo";
  const isPaper = obj.type === "paper" || obj.assetId.startsWith("paper.");

  // Non-paper keepsakes (flowers, stickers, pens) have no designed reverse.
  if (!isPhoto && !isPaper && obj.type !== "photo") {
    return <div style={{ transform: "scaleX(-1)", filter: "brightness(0.82) saturate(0.7)" }}>
      <ShapeOnly obj={obj} w={w} h={h} src={src} />
    </div>;
  }

  const rnd = hash(obj.id);
  const ink = rnd() > 0.5 ? "rgb(112 74 42 / 0.6)" : "rgb(70 60 55 / 0.45)";
  const phrase = PHRASES[Math.floor(rnd() * PHRASES.length)];
  const date = obj.photoDate ?? `${1 + Math.floor(rnd() * 28)} ${MONTHS[Math.floor(rnd() * 12)]} ${2019 + Math.floor(rnd() * 8)}`;
  const doodles = Array.from({ length: 2 + Math.floor(rnd() * 2) }, () => ({
    d: Math.floor(rnd() * DOODLES.length), x: 8 + rnd() * 70, y: 10 + rnd() * 70, r: (rnd() - 0.5) * 40, s: 0.7 + rnd() * 0.6,
  }));
  const textX = 8 + rnd() * 30;
  const textY = 40 + rnd() * 35;
  const fs = Math.max(10, Math.min(w, h) * 0.085);

  // silhouette: PNGs use their own alpha; polaroids/drawn papers get a soft rect
  const mask = obj.type === "polaroid" || !src
    ? { borderRadius: obj.type === "polaroid" ? 3 : 2 }
    : { WebkitMaskImage: `url("${src}")`, maskImage: `url("${src}")`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" };

  return (
    <div className="relative select-none" style={{ width: w, height: h }}>
      <div className="absolute inset-0 bg-photo-back" style={{ ...mask, transform: "scaleX(-1)" }} />
      {isPhoto ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden font-hand" style={{ color: ink }}>
          {doodles.map((d, i) => (
            <svg key={i} viewBox="0 0 24 24" width={22 * d.s} height={22 * d.s} className="absolute"
              style={{ left: `${d.x}%`, top: `${d.y}%`, transform: `rotate(${d.r}deg)` }}>
              {DOODLES[d.d]?.(ink)}
            </svg>
          ))}
          <p className="absolute whitespace-nowrap" style={{ left: `${textX}%`, top: `${textY}%`, fontSize: fs * 1.1, transform: `rotate(${(rnd() - 0.5) * 8}deg)` }}>
            {phrase}
          </p>
          <p className="absolute whitespace-nowrap" style={{ right: "9%", bottom: "8%", fontSize: fs, transform: `rotate(${(rnd() - 0.5) * 6}deg)` }}>
            {date}
          </p>
        </div>
      ) : null}
    </div>
  );
});

function ShapeOnly({ obj, w, h, src }: { obj: WorkspaceObject; w: number; h: number; src?: string | undefined }) {
  if (src) return <img src={src} alt="" draggable={false} style={{ width: w, height: h }} className="object-contain" />;
  return <div style={{ width: w, height: h }}>{getAsset(obj.assetId)?.draw?.()}</div>;
}
