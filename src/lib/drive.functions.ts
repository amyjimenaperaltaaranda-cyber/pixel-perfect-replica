import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

export type DrivePhoto = { id: string; name: string; width: number | null; height: number | null };

/** Reads the image files inside a Drive folder (metadata only, no image data). */
export const listDriveFolder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ folderId: z.string().regex(/^[\w-]{10,100}$/) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ photos: DrivePhoto[]; error: string | null }> => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const driveKey = process.env["GOOGLE_DRIVE_API_KEY"];
    if (!lovableKey || !driveKey) return { photos: [], error: "Google Drive no está conectado." };

    const q = `'${data.folderId}' in parents and mimeType contains 'image/' and trashed=false`;
    const params = new URLSearchParams({
      q,
      fields: "files(id,name,mimeType,imageMediaMetadata(width,height))",
      pageSize: "300",
      orderBy: "name",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    const res = await fetch(`${GATEWAY_URL}/files?${params}`, {
      headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": driveKey },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Drive list failed [${res.status}]: ${body}`);
      if (res.status === 404) return { photos: [], error: "No se encontró la carpeta. Revisa el enlace." };
      if (res.status === 403) return { photos: [], error: "No hay permiso para leer esa carpeta de Drive." };
      return { photos: [], error: `Drive respondió con un error (${res.status}).` };
    }
    const json = (await res.json()) as {
      files?: { id: string; name: string; imageMediaMetadata?: { width?: number; height?: number } }[];
    };
    const photos = (json.files ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      width: f.imageMediaMetadata?.width ?? null,
      height: f.imageMediaMetadata?.height ?? null,
    }));
    return { photos, error: photos.length ? null : "La carpeta no contiene imágenes." };
  });
