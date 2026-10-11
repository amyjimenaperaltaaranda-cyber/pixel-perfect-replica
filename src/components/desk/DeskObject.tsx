import { useRef, useState } from "react";

import { toStage, useStage } from "./stage-context";
import { ObjectView } from "./ObjectView";
import { useDesk } from "@/lib/desk/store";
import type { WorkspaceObject } from "@/lib/desk/types";
import { playSound } from "@/lib/desk/sounds";
import { albumObjectBounds, PAGE_HEIGHT, PAGE_WIDTH } from "@/lib/desk/album-geometry";

type Props = { obj: WorkspaceObject };

export function DeskObject({ obj }: Props) {
  const stage = useStage();
  const { select, update, bringToFront, sendBackward, remove, moveTo } = useDesk();
  const selected = useDesk((s) => s.selectedId === obj.id);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);
  const [tilt, setTilt] = useState({ r: 0, x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    select(obj.id);
    bringToFront(obj.id);
    setDragging(true);

    const k = () => stage.scaleRef.current || 1;
    const start = { cx: e.clientX, cy: e.clientY, x: obj.x, y: obj.y };
    if (obj.location === "envelope" || obj.location === "drawer") {
      const element = ref.current;
      if (!element) return;
      const r = element.getBoundingClientRect();
      const p = toStage(stage, r.left + r.width / 2, r.top + r.height / 2);
      moveTo(obj.id, "desk", p.x, p.y, undefined);
      start.x = p.x;
      start.y = p.y;
      playSound("paper");
    }

    let lx = e.clientX;
    let ly = e.clientY;
    let lt = performance.now();
    let vx = 0;
    let vy = 0;
    const onMove = (ev: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(8, now - lt);
      vx = vx * 0.75 + ((ev.clientX - lx) / dt) * 0.25;
      vy = vy * 0.75 + ((ev.clientY - ly) / dt) * 0.25;
      lx = ev.clientX;
      ly = ev.clientY;
      lt = now;
      const c = (n: number, m: number) => Math.max(-m, Math.min(m, n));
      // subtle lean toward the motion, like a sheet held by one corner
      setTilt({ r: c(vx * 2.2, 2.5), x: c(-vy * 6, 7), y: c(vx * 6, 7) });
      update(obj.id, {
        x: start.x + (ev.clientX - start.cx) / k(),
        y: start.y + (ev.clientY - start.cy) / k(),
      });
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragging(false);
      setTilt({ r: 0, x: 0, y: 0 });
      setSettling(true);
      window.setTimeout(() => setSettling(false), 450);
      drop(ev.clientX, ev.clientY);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const drop = (clientX: number, clientY: number) => {
    // A center outside the page is not a detachment: keep the original page
    // while any part of the positioned keepsake still overlaps its sheet.
    const current = useDesk.getState().objects.find((o) => o.id === obj.id);
    if (current?.location === "album_page") {
      const b = albumObjectBounds(current);
      if (b.right > 0 && b.left < PAGE_WIDTH && b.bottom > 0 && b.top < PAGE_HEIGHT) {
        playSound("paper");
        return;
      }
    }
    const page = document
      .elementsFromPoint(clientX, clientY)
      .find((el) => el instanceof HTMLElement && el.dataset["pageId"]) as HTMLElement | undefined;

    if (page) {
      const rect = page.getBoundingClientRect();
      const k = stage.scaleRef.current || 1;
      moveTo(
        obj.id,
        "album_page",
        (clientX - rect.left) / k,
        (clientY - rect.top) / k,
        page.dataset["pageId"],
      );
      playSound("paper");
      return;
    }

    if (obj.location !== "desk") {
      const p = toStage(stage, clientX, clientY);
      moveTo(obj.id, "desk", p.x, p.y, undefined);
    }
    playSound(obj.type === "camera" ? "camera-on-wood" : "paper");
  };

  const startRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const base = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) - obj.rotation;

    const onMove = (ev: PointerEvent) => {
      const a = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) - base;
      update(obj.id, { rotation: Math.round(a) });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startScale = (e: React.PointerEvent) => {
    e.stopPropagation();
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const d0 = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
    const s0 = obj.scale;

    const onMove = (ev: PointerEvent) => {
      const d = Math.hypot(ev.clientX - cx, ev.clientY - cy);
      update(obj.id, { scale: Math.min(3, Math.max(0.35, (s0 * d) / d0)) });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={ref}
      onPointerDown={startDrag}
      className={`absolute touch-none ease-settle ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        left: obj.x,
        top: obj.y,
        zIndex: dragging ? 9999 : obj.zIndex,
        // light lag while carried gives weight; a slower settle on release
        transition: dragging
          ? "left 70ms ease-out, top 70ms ease-out, transform 160ms ease-out, filter 200ms ease-out"
          : settling
            ? "transform 420ms cubic-bezier(.2,1.4,.4,1), filter 380ms ease-out"
            : "filter 200ms ease-out",
        transform: `translate(-50%, ${dragging ? "calc(-50% - 6px)" : "-50%"}) perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotate(${
          obj.rotation + tilt.r
        }deg) scale(${obj.scale * (dragging ? 1.04 : 1)})`,
        filter: dragging
          ? "drop-shadow(0 26px 22px rgb(43 28 16 / 0.38))"
          : "drop-shadow(0 6px 7px rgb(43 28 16 / 0.22))",
      }}
    >
      <ObjectView obj={obj} />

      {selected ? (
        <>
          <div className="pointer-events-none absolute -inset-2 rounded-sm border border-dashed border-ink/25" />
          <button
            type="button"
            aria-label="Rotar"
            onPointerDown={startRotate}
            className="absolute -left-4 -top-4 h-6 w-6 rounded-full border border-ink/20 bg-paper text-[11px] text-ink/70 shadow-sm"
            style={{ transform: `rotate(${-obj.rotation}deg)` }}
          >
            ⟳
          </button>
          <button
            type="button"
            aria-label="Escalar"
            onPointerDown={startScale}
            className="absolute -bottom-4 -right-4 h-6 w-6 rounded-full border border-ink/20 bg-paper text-[11px] text-ink/70 shadow-sm"
            style={{ transform: `rotate(${-obj.rotation}deg)` }}
          >
            ⤢
          </button>
          <div
            className="absolute left-1/2 top-full mt-5 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-sm border border-ink/15 bg-paper/95 px-2 py-1 font-hand text-xs text-ink/80 shadow-paper"
            style={{ transform: `translateX(-50%) rotate(${-obj.rotation}deg) scale(${1 / obj.scale})` }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {obj.label ? <span className="pr-1 text-ink/50">{obj.label}</span> : null}
            <MenuButton onClick={() => bringToFront(obj.id)}>Al frente</MenuButton>
            <MenuButton onClick={() => sendBackward(obj.id)}>Atrás</MenuButton>
            <MenuButton onClick={() => update(obj.id, { rotation: 0, scale: 1 })}>
              Enderezar
            </MenuButton>
            <MenuButton onClick={() => remove(obj.id)}>Quitar</MenuButton>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MenuButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[3px] px-1.5 py-0.5 transition-colors hover:bg-ink/10"
    >
      {children}
    </button>
  );
}
