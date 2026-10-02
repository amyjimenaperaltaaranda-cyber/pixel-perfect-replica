import { useState } from "react";

import { DeskObject } from "./DeskObject";
import { useDesk } from "@/lib/desk/store";
import { playSound } from "@/lib/desk/sounds";

export function Album() {
  const albums = useDesk((s) => s.albums);
  const activeAlbumId = useDesk((s) => s.activeAlbumId);
  const spreadIndex = useDesk((s) => s.spreadIndex);
  const setSpread = useDesk((s) => s.setSpread);
  const [turning, setTurning] = useState<"next" | "prev" | null>(null);

  const album = albums.find((a) => a.id === activeAlbumId) ?? albums[0];
  if (!album) return null;
  const left = album.pages[spreadIndex * 2];
  const right = album.pages[spreadIndex * 2 + 1];
  const maxSpread = Math.ceil(album.pages.length / 2) - 1;

  const turn = (dir: "next" | "prev") => {
    const next = spreadIndex + (dir === "next" ? 1 : -1);
    if (next < 0 || next > maxSpread) return;
    setTurning(dir);
    playSound("page-turn");
    window.setTimeout(() => {
      setSpread(next);
      setTurning(null);
    }, 330);
  };

  return (
    <div
      className="absolute"
      style={{ left: 800, top: 520, transform: "translate(-50%, -50%) rotate(-0.6deg)", zIndex: 5 }}
    >
      <div className="relative rounded-[6px] bg-album-cover p-4 shadow-album">
        <div className="relative flex gap-[10px] rounded-[3px]">
          <Page pageId={left?.id} side="left" turning={turning === "prev"} />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-album-spine" />
          <Page pageId={right?.id} side="right" turning={turning === "next"} />
        </div>

        <button
          type="button"
          onClick={() => turn("prev")}
          disabled={spreadIndex === 0}
          className="absolute -left-10 top-1/2 -translate-y-1/2 font-hand text-2xl text-paper/70 transition-opacity hover:text-paper disabled:opacity-20"
          aria-label="Página anterior"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => turn("next")}
          disabled={spreadIndex >= maxSpread}
          className="absolute -right-10 top-1/2 -translate-y-1/2 font-hand text-2xl text-paper/70 transition-opacity hover:text-paper disabled:opacity-20"
          aria-label="Página siguiente"
        >
          ›
        </button>

        <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-hand text-sm text-paper/60">
          {album.name} · páginas {spreadIndex * 2 + 1}–{Math.min(spreadIndex * 2 + 2, album.pages.length)}
        </p>
      </div>

      {/* objects living on the visible pages */}
      <PageObjects pageId={left?.id} left={16} />
      <PageObjects pageId={right?.id} left={446} />
    </div>
  );
}

function Page({
  pageId,
  side,
  turning,
}: {
  pageId?: string | undefined;
  side: "left" | "right";
  turning: boolean;
}) {
  return (
    <div
      data-page-id={pageId}
      className="relative h-[560px] w-[420px] bg-album-page shadow-page transition-transform duration-300 ease-settle"
      style={{
        transformOrigin: side === "left" ? "right center" : "left center",
        transform: turning ? `rotateY(${side === "left" ? 28 : -28}deg)` : "none",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-paper-grain opacity-60" />
      <div
        className={`pointer-events-none absolute inset-y-0 w-14 ${
          side === "left" ? "right-0 bg-page-shade-r" : "left-0 bg-page-shade-l"
        }`}
      />
    </div>
  );
}

function PageObjects({ pageId, left }: { pageId?: string | undefined; left: number }) {
  const objects = useDesk((s) => s.objects);
  if (!pageId) return null;
  const onPage = objects.filter((o) => o.location === "album_page" && o.pageId === pageId);
  return (
    <div className="absolute h-[560px] w-[420px]" style={{ left, top: 16 }}>
      {onPage.map((o) => (
        <DeskObject key={o.id} obj={o} />
      ))}
    </div>
  );
}
