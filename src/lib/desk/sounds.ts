/**
 * Sound architecture placeholder.
 * Drop real files in src/assets/sounds and map them here; nothing else changes.
 */
export type DeskSound =
  | "paper"
  | "drawer"
  | "page-turn"
  | "camera-on-wood"
  | "tape";

const registry: Partial<Record<DeskSound, string>> = {};

let enabled = false;

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function playSound(name: DeskSound) {
  const src = registry[name];
  if (!enabled || !src) return;
  const audio = new Audio(src);
  audio.volume = 0.4;
  void audio.play().catch(() => {});
}
