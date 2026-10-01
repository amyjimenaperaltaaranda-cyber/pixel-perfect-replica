import { createContext, useContext, type RefObject } from "react";

export const STAGE_W = 1600;
export const STAGE_H = 1000;

export type StageCtx = {
  scaleRef: RefObject<number>;
  stageRef: RefObject<HTMLDivElement | null>;
};

const Ctx = createContext<StageCtx | null>(null);

export const StageProvider = Ctx.Provider;

export function useStage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStage must be used inside the desk stage");
  return ctx;
}

/** Converts a client point into stage coordinates. */
export function toStage(ctx: StageCtx, clientX: number, clientY: number) {
  const rect = ctx.stageRef.current?.getBoundingClientRect();
  const k = ctx.scaleRef.current || 1;
  if (!rect) return { x: clientX, y: clientY };
  return { x: (clientX - rect.left) / k, y: (clientY - rect.top) / k };
}
