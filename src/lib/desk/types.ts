export type ObjectLocation = "desk" | "drawer" | "envelope" | "album_page";

/** Every physical thing on the desk uses this shape. */
export type WorkspaceObject = {
  id: string;
  /** behaviour family: polaroid | camera | sticker | paper | nature | stationery ... */
  type: string;
  /** visual asset key, resolved through the asset registry. Swap freely. */
  assetId: string;
  /** optional user-supplied asset (uploaded SVG/PNG as data URL) */
  assetSrc?: string | undefined;
  /** photo shown inside a polaroid frame */
  photoSrc?: string | undefined;
  label?: string | undefined;
  caption?: string | undefined;

  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;

  location: ObjectLocation;
  pageId?: string | undefined;
  drawerId?: string | undefined;
};

export type AlbumPage = { id: string };
export type Album = { id: string; name: string; pages: AlbumPage[] };
