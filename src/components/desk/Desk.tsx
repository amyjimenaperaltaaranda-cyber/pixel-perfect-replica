import { useEffect, useRef, useState } from "react";

import { textures } from "@/lib/desk/assets";
import { useDesk } from "@/lib/desk/store";
import { Album } from "./Album";
import { CornerMenu } from "./CornerMenu";
import { DeskObject } from "./DeskObject";
import { Drawers } from "./Drawers";
import { Envelope } from "./Envelope";
import { STAGE_H, STAGE_W, StageProvider } from "./stage-context";

export function Desk() {
  const stageRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const objects = useDesk((s) => s.objects);
  const select = useDesk((s) => s.select);

  useEffect(() => {
    const fit = () => {
      const k = Math.max(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
      scaleRef.current = k;
      setScale(k);
    };
    fit();
    setReady(true);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const onDesk = objects.filter((o) => o.location === "desk");

  return (
    <StageProvider value={{ scaleRef, stageRef }}>
      <main
        className="relative h-screen w-screen overflow-hidden bg-wood-deep"
        onPointerDown={() => select(null)}
      >
        <h1 className="sr-only">My Photographic Desk</h1>
        <div
          ref={stageRef}
          className={`absolute left-1/2 top-1/2 origin-top-left transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `scale(${scale}) translate(-50%, -50%)`,
            transformOrigin: "0 0",
            backgroundImage: `url(${textures.woodDesk})`,
            backgroundSize: "cover",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-desk-light" />

          {ready ? (
            <>
              <Album />
              <Envelope />
              {onDesk.map((o) => (
                <DeskObject key={o.id} obj={o} />
              ))}
              <Drawers />
            </>
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-vignette" style={{ zIndex: 9000 }} />
        </div>
        {ready ? <CornerMenu /> : null}
      </main>
    </StageProvider>
  );
}
