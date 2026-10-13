import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

/** Streams one Drive image so the desk can show it without storing image data. Images only. */
export const Route = createFileRoute("/api/public/drive-image/$fileId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.fileId;
        if (!/^[\w-]{10,100}$/.test(id)) return new Response("Bad id", { status: 400 });
        const lovableKey = process.env.LOVABLE_API_KEY;
        const driveKey = process.env.GOOGLE_DRIVE_API_KEY;
        if (!lovableKey || !driveKey) return new Response("Drive not connected", { status: 503 });
        const headers = { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": driveKey };

        const meta = await fetch(`${GATEWAY_URL}/files/${id}?fields=mimeType&supportsAllDrives=true`, { headers });
        if (!meta.ok) return new Response("Not found", { status: meta.status === 403 ? 403 : 404 });
        const { mimeType } = (await meta.json()) as { mimeType?: string };
        if (!mimeType?.startsWith("image/")) return new Response("Not an image", { status: 415 });

        const file = await fetch(`${GATEWAY_URL}/files/${id}?alt=media&supportsAllDrives=true`, { headers });
        if (!file.ok || !file.body) return new Response("Unavailable", { status: 502 });
        return new Response(file.body, {
          headers: { "Content-Type": mimeType, "Cache-Control": "public, max-age=86400, immutable" },
        });
      },
    },
  },
});
