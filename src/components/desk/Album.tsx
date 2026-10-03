import { useEffect, useRef, useState } from "react";

import { DeskObject } from "./DeskObject";
import { ObjectView } from "./ObjectView";
import { useDesk } from "@/lib/desk/store";
import { playSound } from "@/lib/desk/sounds";

const PW = 420;
const PH = 560;
const STRIPS = 10;
const SW = PW / STRIPS;

type Dir = "next" | "prev";
type Flip = { dir: Dir; p: number; v: number; grabY: number };

export function Album() {
  const albums = useDesk((s) => s.albums);
  const activeAlbumId = useDesk((s) => s.activeAlbumId);
  const spreadIndex = useDesk((s) => s.spreadIndex);
  const setSpread = useDesk((s) => s.setSpread);

  const [flip, setFlip] = useState<Flip | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const sim = useRef({ p: 0, v: 0, target: 0, dragging: false, dir: "next" as Dir, grabY: 0.8, active: false });
  const raf = useRef<number | null>(null);
  const spreadRef = useRef(spreadIndex);
  spreadRef.current = spreadIndex;

  const album = albums.find((a) => a.id === activeAlbumId) ?? albums[0];
  const maxSpread = album ? Math.ceil(album.pages.length / 2) - 1 : 0;

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  if (!album) return null;
  const pageId = (i: number) => album.pages[i]?.id;

  const loop = () => {
    let last = performance.now();
    const step = (now: number) => {
      const s = sim.current;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      // springy follow: stiffer while held, heavier & softer when released
      const k = s.dragging ? 170 : 95;
      const c = s.dragging ? 22 : 13;
      s.v += ((s.target - s.p) * k - s.v * c) * dt;
      s.p += s.v * dt;
      if (!s.dragging) {
        // the page can't pass through the album: soft bounce at the ends
        if (s.p > 1) { s.p = 1; s.v = -s.v * 0.18; }
        if (s.p < 0) { s.p = 0; s.v = -s.v * 0.18; }
      } else {
        s.p = Math.max(0, Math.min(1, s.p));
      }
      setFlip({ dir: s.dir, p: s.p, v: s.v, grabY: s.grabY });

      const settled = !s.dragging && Math.abs(s.v) < 0.02 && Math.abs(s.target - s.p) < 0.002;
      if (settled) {
        s.active = false;
        raf.current = null;
        if (s.target === 1) {
          setSpread(spreadRef.current + (s.dir === "next" ? 1 : -1));
        }
        setFlip(null);
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(step);
  };

  const canTurn = (dir: Dir) => (dir === "next" ? spreadIndex < maxSpread : spreadIndex > 0);

  const progressFromPointer = (dir: Dir, clientX: number) => {
    const r = bookRef.current?.getBoundingClientRect();
    if (!r) return 0;
    const outerL = r.left;
    const outerR = r.right;
    const span = outerR - outerL;
    // a touch past halfway across the spread equals fully turned
    const raw = dir === "next" ? (outerR - clientX) / span : (clientX - outerL) / span;
    return Math.max(0, Math.min(1, raw * 1.08));
  };

  const startDrag = (dir: Dir) => (e: React.PointerEvent) => {
    if (!canTurn(dir) || sim.current.active) return;
    e.stopPropagation();
    e.preventDefault();
    const r = bookRef.current?.getBoundingClientRect();
    const s = sim.current;
    s.dir = dir;
    s.dragging = true;
    s.active = true;
    s.p = 0;
    s.v = 0;
    s.grabY = r ? Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) : 0.8;
    s.target = Math.max(0.04, progressFromPointer(dir, e.clientX));
    playSound("page-turn");
    loop();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    let lastX = e.clientX;
    let lastT = performance.now();
    let vel = 0;
    const move = (ev: PointerEvent) => {
      const now = performance.now();
      const dx = dir === "next" ? lastX - ev.clientX : ev.clientX - lastX;
      vel = vel * 0.6 + (dx / Math.max(1, now - lastT)) * 0.4;
      lastX = ev.clientX;
      lastT = now;
      s.target = progressFromPointer(dir, ev.clientX);
    };
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
      s.dragging = false;
      // a flick carries the page over even if it hasn't crossed the middle
      const flick = vel > 0.45 ? 1 : vel < -0.45 ? 0 : null;
      s.target = flick ?? (s.p > 0.45 ? 1 : 0);
      s.v += vel * 1.6;
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };

  const turnButton = (dir: Dir) => {
    if (!canTurn(dir) || sim.current.active) return;
    const s = sim.current;
    s.dir = dir;
    s.dragging = false;
    s.active = true;
    s.p = 0;
    s.v = 2.2;
    s.grabY = 0.82;
    s.target = 1;
    playSound("page-turn");
    loop();
  };

  // which pages sit flat underneath while a sheet is in the air
  const L = spreadIndex * 2;
  let baseLeft = pageId(L);
  let baseRight = pageId(L + 1);
  let sheetFront: string | undefined;
  let sheetBack: string | undefined;
  if (flip?.dir === "next") {
    baseRight = pageId(L + 3);
    sheetFront = pageId(L + 1);
    sheetBack = pageId(L + 2);
  } else if (flip?.dir === "prev") {
    baseLeft = pageId(L - 2);
    sheetFront = pageId(L);
    sheetBack = pageId(L - 1);
  }
  const lift = flip ? Math.sin(flip.p * Math.PI) : 0;

  return (
    <div
      className="absolute"
      style={{ left: 800, top: 520, transform: "translate(-50%, -50%) rotate(-0.6deg)", zIndex: 5 }}
    >
      <div ref={bookRef} className="relative rounded-[6px] bg-album-cover p-4 shadow-album">
        <div className="relative flex gap-[10px] rounded-[3px]">
          <Page pageId={baseLeft} side="left" shadow={flip?.dir === "prev" ? flip.p : flip?.dir === "next" ? 0 : 0} castFrom={flip ? flip.p : null} />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-album-spine" style={{ zIndex: 2 }} />
          <Page pageId={baseRight} side="right" shadow={0} castFrom={flip ? flip.p : null} />
        </div>

        <button
          type="button"
          onClick={() => turnButton("prev")}
          disabled={spreadIndex === 0}
          className="absolute -left-10 top-1/2 -translate-y-1/2 font-hand text-2xl text-paper/70 transition-opacity hover:text-paper disabled:opacity-20"
          aria-label="Página anterior"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => turnButton("next")}
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

      {/* objects living on the flat pages */}
      <PageObjects pageId={baseLeft} left={16} />
      <PageObjects pageId={baseRight} left={446} />

      {/* the sheet in the air */}
      {flip ? (
        <div
          className="pointer-events-none absolute"
          style={{ left: 16, top: 16, width: PW * 2 + 10, height: PH, perspective: 2400, zIndex: 40 }}
        >
          <Sheet
            dir={flip.dir}
            p={flip.p}
            v={flip.v}
            grabY={flip.grabY}
            front={sheetFront}
            back={sheetBack}
            lift={lift}
          />
        </div>
      ) : null}

      {/* grab zones: page edges & corners */}
      {canTurn("prev") ? (
        <div
          onPointerDown={startDrag("prev")}
          className="absolute touch-none"
          style={{ left: 0, top: 16, width: 46, height: PH, cursor: "grab", zIndex: 30 }}
          aria-hidden
        />
      ) : null}
      {canTurn("next") ? (
        <div
          onPointerDown={startDrag("next")}
          className="absolute touch-none"
          style={{ left: 16 + PW * 2 + 10 - 30, top: 16, width: 46, height: PH, cursor: "grab", zIndex: 30 }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function Sheet({
  dir,
  p,
  v,
  grabY,
  front,
  back,
  lift,
}: {
  dir: Dir;
  p: number;
  v: number;
  grabY: number;
  front?: string | undefined;
  back?: string | undefined;
  lift: number;
}) {
  const sign = dir === "next" ? -1 : 1;
  // ease the hinge so the sheet lingers a moment when lifted and falls with weight
  const angle = sign * 180 * p;
  // paper curl: grows when lifted, leans against the motion (drag lags the free edge)
  const vel = Math.max(-3, Math.min(3, v));
  const curl = (lift * 2.6 + vel * 0.9 * (dir === "next" ? 1 : 1)) * sign * -1;
  const tilt = (grabY - 0.5) * -7 * lift;
  const z = lift * 18;

  const hingeLeft = dir === "next" ? PW + 10 : 0;

  // nested strips build a smooth bend from the spine to the free edge
  const strips = [];
  let node: React.ReactNode = null;
  for (let i = STRIPS - 1; i >= 0; i--) {
    const bendI = i === 0 ? 0 : curl * (0.4 + (i / STRIPS) * 1.4);
    // per-strip light: the curled part catches light / falls into shade
    const shade = Math.min(0.32, Math.abs(curl) * 0.012 * (i / STRIPS) + lift * 0.08);
    node = (
      <Strip key={i} i={i} dir={dir} bend={bendI} front={front} back={back} shade={shade} p={p}>
        {node}
      </Strip>
    );
  }
  strips.push(node);

  return (
    <div
      style={{
        position: "absolute",
        left: hingeLeft,
        top: 0,
        width: PW,
        height: PH,
        transformStyle: "preserve-3d",
        transformOrigin: dir === "next" ? "left center" : "right center",
        transform: `translateZ(${z}px) rotateX(${tilt}deg) rotateY(${angle}deg)`,
        filter: `drop-shadow(${sign * -lift * 22}px ${6 + lift * 14}px ${8 + lift * 18}px rgb(30 18 8 / ${0.18 + lift * 0.25}))`,
      }}
    >
      {strips}
    </div>
  );
}

function Strip({
  i,
  dir,
  bend,
  front,
  back,
  shade,
  p,
  children,
}: {
  i: number;
  dir: Dir;
  bend: number;
  front?: string | undefined;
  back?: string | undefined;
  shade: number;
  p: number;
  children: React.ReactNode;
}) {
  const fromLeft = dir === "next"; // strips grow away from the spine
  // horizontal offset of this strip within the front page
  const frontOffset = fromLeft ? i * SW : PW - (i + 1) * SW;
  const backOffset = PW - frontOffset - SW;
  const frontSide: "left" | "right" = dir === "next" ? "right" : "left";
  const backSide: "left" | "right" = dir === "next" ? "left" : "right";
  const isFirst = i === 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        width: SW + 0.6,
        height: PH,
        ...(isFirst
          ? fromLeft
            ? { left: 0 }
            : { right: 0 }
          : fromLeft
            ? { left: SW }
            : { right: SW }),
        transformStyle: "preserve-3d",
        transformOrigin: fromLeft ? "left center" : "right center",
        transform: `rotateY(${bend}deg)`,
      }}
    >
      <Face pageId={front} offset={frontOffset} side={frontSide} shade={shade + p * 0.12} flipped={false} />
      <Face pageId={back} offset={backOffset} side={backSide} shade={Math.max(0, shade * 0.6 + (1 - p) * 0.22)} flipped />
      {children}
    </div>
  );
}

function Face({
  pageId,
  offset,
  side,
  shade,
  flipped,
}: {
  pageId?: string | undefined;
  offset: number;
  side: "left" | "right";
  shade: number;
  flipped: boolean;
}) {
  const objects = useDesk((s) => s.objects);
  const onPage = pageId ? objects.filter((o) => o.location === "album_page" && o.pageId === pageId) : [];
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: flipped ? "rotateY(180deg)" : undefined,
      }}
    >
      <div className="absolute top-0 bg-album-page" style={{ left: -offset, width: PW, height: PH }}>
        <div className="pointer-events-none absolute inset-0 bg-paper-grain opacity-60" />
        <div
          className={`pointer-events-none absolute inset-y-0 w-14 ${
            side === "left" ? "right-0 bg-page-shade-r" : "left-0 bg-page-shade-l"
          }`}
        />
        {onPage.map((o) => (
          <div
            key={o.id}
            className="absolute"
            style={{
              left: o.x,
              top: o.y,
              zIndex: o.zIndex,
              transform: `translate(-50%, -50%) rotate(${o.rotation}deg) scale(${o.scale})`,
            }}
          >
            <ObjectView obj={o} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: shade }} />
    </div>
  );
}

function Page({
  pageId,
  side,
  castFrom,
}: {
  pageId?: string | undefined;
  side: "left" | "right";
  shadow: number;
  castFrom: number | null;
}) {
  // shadow cast by the sheet above, sweeping across as it travels
  const cast = castFrom === null ? 0 : Math.sin(castFrom * Math.PI);
  return (
    <div data-page-id={pageId} className="relative h-[560px] w-[420px] bg-album-page shadow-page">
      <div className="pointer-events-none absolute inset-0 bg-paper-grain opacity-60" />
      <div
        className={`pointer-events-none absolute inset-y-0 w-14 ${
          side === "left" ? "right-0 bg-page-shade-r" : "left-0 bg-page-shade-l"
        }`}
      />
      {cast > 0 ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 20,
            background: `linear-gradient(${side === "left" ? 270 : 90}deg, rgb(30 18 8 / ${0.42 * cast}), rgb(30 18 8 / ${0.12 * cast}) ${30 + 50 * (1 - cast)}%, transparent)`,
          }}
        />
      ) : null}
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
