import type { ReactNode } from "react";

import woodDesk from "@/assets/desk/wood-desk.jpg";
import envelopeClosed from "@/assets/envelope/envelope-closed.png";
import sonyZve10 from "@/assets/cameras/sony-zve10.png";
import canon77d from "@/assets/cameras/canon-77d.png";
import redmi9 from "@/assets/cameras/redmi-9.png";
import photo1 from "@/assets/polaroids/photo-1.jpg";
import photo2 from "@/assets/polaroids/photo-2.jpg";
import photo3 from "@/assets/polaroids/photo-3.jpg";

export const textures = { woodDesk, envelopeClosed };
export const samplePhotos = [photo1, photo2, photo3];

export type AssetDefinition = {
  id: string;
  /** intrinsic size in desk units */
  w: number;
  h: number;
  /** image assets: replace the src and nothing else changes */
  src?: string;
  /** vector assets drawn inline (placeholders until real SVGs arrive) */
  draw?: () => ReactNode;
};

const shape = (
  id: string,
  w: number,
  h: number,
  draw: () => ReactNode,
): AssetDefinition => ({ id, w, h, draw });

const paperEdge = "rounded-[2px]";

export const assetRegistry: Record<string, AssetDefinition> = {
  "camera.sony-zve10": { id: "camera.sony-zve10", w: 190, h: 190, src: sonyZve10 },
  "camera.canon-77d": { id: "camera.canon-77d", w: 210, h: 210, src: canon77d },
  "camera.redmi-9": { id: "camera.redmi-9", w: 86, h: 138, src: redmi9 },

  "stationery.pencil": shape("stationery.pencil", 18, 160, () => (
    <svg viewBox="0 0 18 160" className="h-full w-full">
      <rect x="4" y="16" width="10" height="130" fill="#c98b3f" />
      <rect x="4" y="16" width="4" height="130" fill="#e0a85c" />
      <polygon points="4,146 14,146 9,160" fill="#e8d7bd" />
      <polygon points="7,154 11,154 9,160" fill="#3a2f28" />
      <rect x="4" y="4" width="10" height="12" fill="#b9574f" />
    </svg>
  )),
  "stationery.marker": shape("stationery.marker", 22, 130, () => (
    <svg viewBox="0 0 22 130" className="h-full w-full">
      <rect x="2" y="26" width="18" height="100" rx="4" fill="#3f4f46" />
      <rect x="4" y="2" width="14" height="26" rx="3" fill="#d8763f" />
      <rect x="2" y="60" width="18" height="10" fill="#2c382f" />
    </svg>
  )),
  "stationery.brush": shape("stationery.brush", 16, 150, () => (
    <svg viewBox="0 0 16 150" className="h-full w-full">
      <rect x="5" y="30" width="6" height="118" rx="3" fill="#8d6647" />
      <rect x="4" y="22" width="8" height="12" fill="#b9b2a4" />
      <path d="M4 22 L12 22 L10 2 L6 2 Z" fill="#45382e" />
    </svg>
  )),
  "stationery.eraser": shape("stationery.eraser", 54, 30, () => (
    <svg viewBox="0 0 54 30" className="h-full w-full">
      <rect width="54" height="30" rx="4" fill="#efe3d4" />
      <rect y="18" width="54" height="12" rx="4" fill="#d9c7b2" />
    </svg>
  )),

  "sticker.star": shape("sticker.star", 56, 56, () => (
    <svg viewBox="0 0 56 56" className="h-full w-full">
      <polygon
        points="28,3 35,21 54,22 39,34 44,53 28,42 12,53 17,34 2,22 21,21"
        fill="#e4b23c"
        stroke="#fdf6e8"
        strokeWidth="3"
      />
    </svg>
  )),
  "sticker.heart": shape("sticker.heart", 52, 48, () => (
    <svg viewBox="0 0 52 48" className="h-full w-full">
      <path
        d="M26 45 C4 30 2 16 12 9 C20 3 26 11 26 13 C26 11 32 3 40 9 C50 16 48 30 26 45 Z"
        fill="#c4645c"
        stroke="#fdf6e8"
        strokeWidth="3"
      />
    </svg>
  )),
  "sticker.stamp": shape("sticker.stamp", 62, 72, () => (
    <svg viewBox="0 0 62 72" className="h-full w-full">
      <rect width="62" height="72" fill="#f3ead8" />
      <rect x="7" y="8" width="48" height="56" fill="#9aa98f" />
      <circle cx="31" cy="30" r="12" fill="#f3ead8" opacity="0.6" />
      <text x="31" y="59" fontSize="9" textAnchor="middle" fill="#f3ead8">
        POST
      </text>
    </svg>
  )),
  "sticker.label": shape("sticker.label", 90, 40, () => (
    <svg viewBox="0 0 90 40" className="h-full w-full">
      <path d="M0 6 Q45 0 90 6 L90 34 Q45 40 0 34 Z" fill="#f6efe1" />
      <path d="M8 20 H70" stroke="#b7a893" strokeWidth="2" />
    </svg>
  )),
  "sticker.washi": shape("sticker.washi", 150, 32, () => (
    <svg viewBox="0 0 150 32" className="h-full w-full">
      <rect width="150" height="32" fill="#cfd8c2" opacity="0.85" />
      <g opacity="0.5" fill="#7c8a6d">
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={10 + i * 15} cy={16} r="3" />
        ))}
      </g>
    </svg>
  )),
  "sticker.postit": shape("sticker.postit", 92, 92, () => (
    <svg viewBox="0 0 92 92" className="h-full w-full">
      <rect width="92" height="92" fill="#e8dc93" />
      <path d="M0 0 L92 0 L92 92 Z" fill="#000" opacity="0.04" />
      <g stroke="#9c9154" strokeWidth="2" opacity="0.6">
        <path d="M12 30 H76" />
        <path d="M12 46 H76" />
        <path d="M12 62 H58" />
      </g>
    </svg>
  )),

  "paper.kraft": shape("paper.kraft", 170, 130, () => (
    <svg viewBox="0 0 170 130" className="h-full w-full">
      <path d="M2 6 L166 2 L168 124 L4 128 Z" fill="#c9a97e" />
      <path d="M2 6 L166 2 L168 20 L4 24 Z" fill="#000" opacity="0.05" />
    </svg>
  )),
  "paper.sheet": shape("paper.sheet", 150, 190, () => (
    <svg viewBox="0 0 150 190" className="h-full w-full">
      <rect width="150" height="190" fill="#f7f2e6" />
      <g stroke="#c7bca6" strokeWidth="1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={`M14 ${30 + i * 19} H136`} />
        ))}
      </g>
    </svg>
  )),
  "paper.newspaper": shape("paper.newspaper", 180, 120, () => (
    <svg viewBox="0 0 180 120" className="h-full w-full">
      <rect width="180" height="120" fill="#e6ddc8" />
      <text x="12" y="28" fontSize="18" fontFamily="Georgia, serif" fill="#3a332a">
        memoria
      </text>
      <g stroke="#8c8373" strokeWidth="2" opacity="0.7">
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={i} d={`M12 ${44 + i * 10} H${100 + ((i * 37) % 60)}`} />
        ))}
      </g>
    </svg>
  )),
  "paper.clipping": shape("paper.clipping", 130, 76, () => (
    <svg viewBox="0 0 130 76" className="h-full w-full">
      <path d="M2 4 L128 0 L126 72 L6 76 Z" fill="#e3d9c2" />
      <g stroke="#8c8373" strokeWidth="2" opacity="0.65">
        {Array.from({ length: 5 }).map((_, i) => (
          <path key={i} d={`M12 ${18 + i * 11} H${70 + ((i * 29) % 45)}`} />
        ))}
      </g>
    </svg>
  )),

  "nature.flower": shape("nature.flower", 80, 86, () => (
    <svg viewBox="0 0 80 86" className="h-full w-full">
      <path d="M40 40 C44 60 42 74 38 84" stroke="#7b7f52" strokeWidth="3" fill="none" />
      <g fill="#cf9aa4" opacity="0.92">
        {Array.from({ length: 6 }).map((_, i) => (
          <ellipse
            key={i}
            cx="40"
            cy="22"
            rx="8"
            ry="17"
            transform={`rotate(${i * 60} 40 40)`}
          />
        ))}
      </g>
      <circle cx="40" cy="40" r="8" fill="#d7b25e" />
    </svg>
  )),
  "nature.leaf": shape("nature.leaf", 70, 96, () => (
    <svg viewBox="0 0 70 96" className="h-full w-full">
      <path d="M35 2 C62 26 62 66 35 94 C8 66 8 26 35 2 Z" fill="#8c9668" />
      <path d="M35 6 V90" stroke="#6b7450" strokeWidth="2" />
    </svg>
  )),
  "nature.branch": shape("nature.branch", 120, 60, () => (
    <svg viewBox="0 0 120 60" className="h-full w-full">
      <path d="M4 50 C40 42 80 28 116 10" stroke="#8a7a5c" strokeWidth="3" fill="none" />
      <g fill="#9aa377">
        {Array.from({ length: 6 }).map((_, i) => (
          <ellipse key={i} cx={20 + i * 16} cy={44 - i * 6} rx="9" ry="5" />
        ))}
      </g>
    </svg>
  )),
};

export function getAsset(assetId: string): AssetDefinition | undefined {
  return assetRegistry[assetId];
}

export { paperEdge };
