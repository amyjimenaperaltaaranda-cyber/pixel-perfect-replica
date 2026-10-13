import { getAsset } from "./assets";
import type { WorkspaceObject } from "./types";

export const PAGE_WIDTH = 420;
export const PAGE_HEIGHT = 560;

/** Conservative bounds, including caption space, for culling only. */
export function albumObjectBounds(obj: WorkspaceObject) {
  const asset = getAsset(obj.assetId);
  const w = obj.type === "polaroid" ? 190 : (obj.w ?? asset?.w ?? 120);
  const h = obj.type === "polaroid" ? (obj.caption ? 266 : 216) : (obj.h ?? asset?.h ?? 120);
  const angle = obj.rotation * Math.PI / 180;
  const halfW = (Math.abs(Math.cos(angle)) * w + Math.abs(Math.sin(angle)) * h) * obj.scale / 2;
  const halfH = (Math.abs(Math.sin(angle)) * w + Math.abs(Math.cos(angle)) * h) * obj.scale / 2;
  return { left: obj.x - halfW, right: obj.x + halfW, top: obj.y - halfH, bottom: obj.y + halfH };
}

export function protrudesFromPage(obj: WorkspaceObject) {
  const b = albumObjectBounds(obj);
  return b.left < 0 || b.right > PAGE_WIDTH || b.top < 0 || b.bottom > PAGE_HEIGHT;
}

/** Outer strips own overflow; internal strips only draw intersecting content. */
export function intersectsPageStrip(obj: WorkspaceObject, offset: number, width: number) {
  const b = albumObjectBounds(obj);
  const left = offset === 0 ? -Infinity : offset;
  const right = offset + width >= PAGE_WIDTH ? Infinity : offset + width;
  return b.right > left && b.left < right;
}