import { memo } from "react";
import { getAsset } from "@/lib/desk/assets";
import type { WorkspaceObject } from "@/lib/desk/types";
import { PhotoBack } from "./PhotoBack";

/** Pure visual layer: swap an asset here and behaviour stays untouched. */
export const ObjectView = memo(function ObjectView({ obj, face = "front" }: { obj: WorkspaceObject; face?: "front" | "back" }) {
  if (face === "back") return <PhotoBack obj={obj} />;
  if (obj.type === "polaroid") {
    return <PolaroidView obj={obj} />;
  }

  const asset = getAsset(obj.assetId);
  const w = obj.w ?? asset?.w ?? 120;
  const h = obj.h ?? asset?.h ?? 120;

  if (obj.assetSrc) {
    return (
      <img
        src={obj.assetSrc}
        alt={obj.label ?? obj.type}
        draggable={false}
        style={{ width: w, height: h }}
        className="object-contain drop-shadow-object select-none"
      />
    );
  }

  if (asset?.src) {
    return (
      <img
        src={asset.src}
        alt={obj.label ?? obj.type}
        draggable={false}
        loading="lazy"
        style={{ width: w, height: h }}
        className="object-contain drop-shadow-object select-none"
      />
    );
  }

  return (
    <div style={{ width: w, height: h }} className="drop-shadow-paper select-none">
      {asset?.draw?.()}
    </div>
  );
});

export function PolaroidView({
  obj,
  width = 190,
}: {
  obj: WorkspaceObject;
  width?: number;
}) {
  return (
    <div
      className="bg-polaroid shadow-polaroid select-none"
      style={{ width, padding: width * 0.055, paddingBottom: width * 0.19 }}
    >
      <div className="relative overflow-hidden bg-ink/10" style={{ aspectRatio: "1 / 1" }}>
        {obj.photoSrc ? (
          <img
            src={obj.photoSrc}
            alt={obj.caption ?? "fotografía"}
            draggable={false}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-photo-sheen" />
      </div>
      {obj.caption ? (
        <p className="mt-2 text-center font-hand text-ink/70" style={{ fontSize: width * 0.1 }}>
          {obj.caption}
        </p>
      ) : null}
    </div>
  );
}
