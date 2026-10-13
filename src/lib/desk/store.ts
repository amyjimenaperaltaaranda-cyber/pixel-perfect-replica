import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Album, ObjectLocation, PhotoEnvelope, WorkspaceObject } from "./types";
import { samplePhotos } from "./assets";

const uid = () => Math.random().toString(36).slice(2, 10);
const jitter = (n: number) => (Math.random() - 0.5) * n;

export type DrawerId = "writing" | "scrapbook" | "paper" | "nature";

export const drawers: {
  id: DrawerId;
  name: string;
  items: { assetId: string; type: string; label: string }[];
}[] = [
  {
    id: "writing",
    name: "Writing",
    items: [
      { assetId: "stationery.pencil", type: "stationery", label: "Lápiz" },
      { assetId: "stationery.marker", type: "stationery", label: "Marcador" },
      { assetId: "stationery.brush", type: "stationery", label: "Pincel" },
      { assetId: "stationery.eraser", type: "stationery", label: "Goma" },
    ],
  },
  {
    id: "scrapbook",
    name: "Scrapbook",
    items: [
      { assetId: "sticker.star", type: "sticker", label: "Estrella" },
      { assetId: "sticker.heart", type: "sticker", label: "Corazón" },
      { assetId: "sticker.washi", type: "tape", label: "Washi tape" },
      { assetId: "sticker.stamp", type: "sticker", label: "Sello" },
      { assetId: "sticker.label", type: "sticker", label: "Etiqueta" },
      { assetId: "sticker.postit", type: "paper", label: "Post-it" },
    ],
  },
  {
    id: "paper",
    name: "Paper",
    items: [
      { assetId: "paper.sheet", type: "paper", label: "Hoja" },
      { assetId: "paper.kraft", type: "paper", label: "Papel kraft" },
      { assetId: "paper.newspaper", type: "paper", label: "Periódico" },
      { assetId: "paper.clipping", type: "paper", label: "Recorte" },
    ],
  },
  {
    id: "nature",
    name: "Nature",
    items: [
      { assetId: "nature.flower", type: "nature", label: "Flor seca" },
      { assetId: "nature.leaf", type: "nature", label: "Hoja" },
      { assetId: "nature.branch", type: "nature", label: "Rama" },
    ],
  },
];

function initialAlbums(): Album[] {
  return [
    {
      id: "album-2026",
      name: "2026",
      pages: Array.from({ length: 6 }, (_, i) => ({ id: `album-2026-p${i + 1}` })),
    },
  ];
}

function initialObjects(): WorkspaceObject[] {
  const objects: WorkspaceObject[] = [];
  let z = 1;

  const cameras = [
    { assetId: "camera.sony-zve10", label: "Sony ZV-E10", x: 180, y: 190, rot: -9 },
    { assetId: "camera.canon-77d", label: "Canon EOS 77D", x: 1360, y: 180, rot: 11 },
    { assetId: "camera.redmi-9", label: "Xiaomi Redmi 9", x: 1420, y: 470, rot: -5 },
  ];
  for (const c of cameras) {
    objects.push({
      id: uid(),
      type: "camera",
      assetId: c.assetId,
      label: c.label,
      x: c.x,
      y: c.y,
      rotation: c.rot,
      scale: 1,
      zIndex: z++,
      location: "desk",
    });
  }

  // polaroids waiting inside the envelope
  for (let i = 0; i < 6; i++) {
    objects.push({
      id: uid(),
      type: "polaroid",
      assetId: "polaroid.frame",
      photoSrc: samplePhotos[i % samplePhotos.length],
      caption: ["verano", "camino", "café", "campo", "tarde", "casa"][i],
      x: 0,
      y: 0,
      rotation: jitter(7),
      scale: 1,
      zIndex: z++,
      location: "envelope",
    });
  }

  // a little organic clutter on the desk
  const clutter = [
    { assetId: "stationery.pencil", type: "stationery", x: 300, y: 760, rot: 24 },
    { assetId: "stationery.marker", type: "stationery", x: 355, y: 790, rot: 38 },
    { assetId: "nature.leaf", type: "nature", x: 1330, y: 760, rot: -22 },
    { assetId: "nature.flower", type: "nature", x: 1230, y: 800, rot: 14 },
    { assetId: "paper.newspaper", type: "paper", x: 155, y: 600, rot: -7 },
    { assetId: "sticker.washi", type: "tape", x: 1300, y: 640, rot: 9 },
  ];
  for (const c of clutter) {
    objects.push({
      id: uid(),
      type: c.type,
      assetId: c.assetId,
      x: c.x,
      y: c.y,
      rotation: c.rot,
      scale: 1,
      zIndex: z++,
      location: "desk",
    });
  }

  return objects;
}

type DeskState = {
  objects: WorkspaceObject[];
  albums: Album[];
  activeAlbumId: string;
  spreadIndex: number;
  openDrawerId: DrawerId | null;
  envelopeOpen: boolean;
  selectedId: string | null;
  lastSavedAt: number | null;
  envelopes: PhotoEnvelope[];
  categories: string[];
  openEnvelopeId: string | null;
  setOpenEnvelope: (id: string | null) => void;
  addEnvelope: (
    env: Omit<PhotoEnvelope, "id" | "x" | "y" | "rotation">,
    photos: { src: string; name: string; w: number; h: number }[],
  ) => void;

  select: (id: string | null) => void;
  update: (id: string, patch: Partial<WorkspaceObject>) => void;
  bringToFront: (id: string) => void;
  sendBackward: (id: string) => void;
  remove: (id: string) => void;
  addObject: (obj: Omit<WorkspaceObject, "id" | "zIndex"> & { id?: string }) => string;
  moveTo: (
    id: string,
    location: ObjectLocation,
    x: number,
    y: number,
    pageId?: string | undefined,
  ) => void;

  setSpread: (index: number) => void;
  setActiveAlbum: (id: string) => void;
  addAlbum: (name: string) => void;
  toggleDrawer: (id: DrawerId) => void;
  setEnvelopeOpen: (open: boolean) => void;
  markSaved: () => void;
  resetDesk: () => void;
};

const topZ = (objects: WorkspaceObject[]) =>
  objects.reduce((m, o) => Math.max(m, o.zIndex), 0) + 1;

export const useDesk = create<DeskState>()(
  persist(
    (set) => ({
      objects: initialObjects(),
      albums: initialAlbums(),
      activeAlbumId: "album-2026",
      spreadIndex: 0,
      openDrawerId: null,
      envelopeOpen: false,
      selectedId: null,
      lastSavedAt: null,
      envelopes: [],
      categories: ["Viajes", "Familia", "Amigos", "Cotidiano"],
      openEnvelopeId: null,
      setOpenEnvelope: (id) => set({ openEnvelopeId: id }),
      addEnvelope: (env, photos) =>
        set((s) => {
          const id = `env-${uid()}`;
          const n = s.envelopes.length;
          let z = topZ(s.objects);
          const objs: WorkspaceObject[] = photos.map((p) => ({
            id: uid(), type: "photo", assetId: "photo.drive", assetSrc: p.src, label: p.name,
            w: p.w, h: p.h, photoDate: env.date, x: 0, y: 0, rotation: jitter(7), scale: 1,
            zIndex: z++, location: "envelope", envelopeId: id,
          }));
          return {
            envelopes: [...s.envelopes, { ...env, id, x: 1440 - (n % 3) * 18, y: 600 + (n % 4) * 44, rotation: jitter(10) }],
            categories: s.categories.includes(env.category) ? s.categories : [...s.categories, env.category],
            objects: [...s.objects, ...objs],
          };
        }),

      select: (id) => set({ selectedId: id }),
      update: (id, patch) =>
        set((s) => ({
          objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),
      bringToFront: (id) =>
        set((s) => {
          const z = topZ(s.objects);
          return { objects: s.objects.map((o) => (o.id === id ? { ...o, zIndex: z } : o)) };
        }),
      sendBackward: (id) =>
        set((s) => ({
          objects: s.objects.map((o) =>
            o.id === id ? { ...o, zIndex: Math.max(0, o.zIndex - 3) } : o,
          ),
        })),
      remove: (id) =>
        set((s) => ({
          objects: s.objects.filter((o) => o.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),
      addObject: (obj) => {
        const id = obj.id ?? uid();
        set((s) => ({
          objects: [...s.objects, { ...obj, id, zIndex: topZ(s.objects) } as WorkspaceObject],
        }));
        return id;
      },
      moveTo: (id, location, x, y, pageId) =>
        set((s) => ({
          objects: s.objects.map((o) =>
            o.id === id ? { ...o, location, x, y, pageId, zIndex: topZ(s.objects) } : o,
          ),
        })),

      setSpread: (index) => set({ spreadIndex: index }),
      setActiveAlbum: (id) => set({ activeAlbumId: id, spreadIndex: 0 }),
      addAlbum: (name) =>
        set((s) => {
          const id = `album-${uid()}`;
          return {
            albums: [
              ...s.albums,
              { id, name, pages: Array.from({ length: 6 }, (_, i) => ({ id: `${id}-p${i + 1}` })) },
            ],
            activeAlbumId: id,
            spreadIndex: 0,
          };
        }),
      toggleDrawer: (id) =>
        set((s) => ({ openDrawerId: s.openDrawerId === id ? null : id })),
      setEnvelopeOpen: (open) => set({ envelopeOpen: open }),
      markSaved: () => set({ lastSavedAt: Date.now() }),
      resetDesk: () =>
        set({
          objects: initialObjects(),
          albums: initialAlbums(),
          activeAlbumId: "album-2026",
          spreadIndex: 0,
          selectedId: null,
          openDrawerId: null,
          envelopeOpen: false,
          envelopes: [],
          openEnvelopeId: null,
        }),
    }),
    { name: "my-photographic-desk-v1", version: 1 },
  ),
);

export { uid };
