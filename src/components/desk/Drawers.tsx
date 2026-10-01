import { getAsset } from "@/lib/desk/assets";
import { drawers, useDesk, type DrawerId } from "@/lib/desk/store";
import { playSound } from "@/lib/desk/sounds";
import { toStage, useStage } from "./stage-context";

export function Drawers() {
  const openDrawerId = useDesk((s) => s.openDrawerId);
  const toggleDrawer = useDesk((s) => s.toggleDrawer);
  const addObject = useDesk((s) => s.addObject);
  const update = useDesk((s) => s.update);
  const moveTo = useDesk((s) => s.moveTo);
  const select = useDesk((s) => s.select);
  const stage = useStage();

  const pullOut = (
    e: React.PointerEvent,
    item: { assetId: string; type: string; label: string },
  ) => {
    e.preventDefault();
    const p = toStage(stage, e.clientX, e.clientY);
    const id = addObject({
      type: item.type,
      assetId: item.assetId,
      label: item.label,
      x: p.x,
      y: p.y,
      rotation: (Math.random() - 0.5) * 14,
      scale: 1,
      location: "desk",
    });
    select(id);
    playSound("drawer");

    const onMove = (ev: PointerEvent) => {
      const q = toStage(stage, ev.clientX, ev.clientY);
      update(id, { x: q.x, y: q.y });
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const page = document
        .elementsFromPoint(ev.clientX, ev.clientY)
        .find(
          (el) => el instanceof HTMLElement && el.dataset["pageId"],
        ) as HTMLElement | undefined;
      if (page) {
        const rect = page.getBoundingClientRect();
        const k = stage.scaleRef.current || 1;
        moveTo(
          id,
          "album_page",
          (ev.clientX - rect.left) / k,
          (ev.clientY - rect.top) / k,
          page.dataset["pageId"],
        );
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 60 }}>
      {drawers.map((d, i) => {
        const open = openDrawerId === d.id;
        return (
          <div
            key={d.id}
            className="absolute bottom-0"
            style={{ left: 170 + i * 330, width: 300 }}
          >
            <div
              className="relative rounded-t-[4px] bg-drawer-front shadow-drawer transition-transform duration-300 ease-settle"
              style={{ transform: open ? "translateY(0)" : "translateY(62px)" }}
            >
              <button
                type="button"
                onClick={() => {
                  toggleDrawer(d.id as DrawerId);
                  playSound("drawer");
                }}
                className="flex h-[86px] w-full flex-col items-center justify-start gap-2 pt-3"
              >
                <span className="h-[7px] w-20 rounded-full bg-brass shadow-sm" />
                <span className="font-hand text-base text-paper/80">{d.name}</span>
              </button>

              {open ? (
                <div className="flex min-h-[110px] flex-wrap items-end justify-center gap-5 border-t border-ink/20 bg-drawer-inside px-5 py-4">
                  {d.items.map((item) => {
                    const asset = getAsset(item.assetId);
                    const w = Math.min(asset?.w ?? 60, 54);
                    const h = ((asset?.h ?? 60) / (asset?.w ?? 60)) * w;
                    return (
                      <button
                        key={item.assetId}
                        type="button"
                        title={item.label}
                        onPointerDown={(e) => pullOut(e, item)}
                        className="cursor-grab touch-none transition-transform duration-150 hover:-translate-y-1"
                      >
                        <span className="block" style={{ width: w, height: Math.min(h, 72) }}>
                          {asset?.src ? (
                            <img
                              src={asset.src}
                              alt={item.label}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            asset?.draw?.()
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
