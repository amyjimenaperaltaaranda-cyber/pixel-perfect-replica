import { createFileRoute } from "@tanstack/react-router";

import { Desk } from "@/components/desk/Desk";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Photographic Desk" },
      {
        name: "description",
        content: "Un escritorio fotográfico interactivo para sacar Polaroids del sobre y construir álbumes.",
      },
      { property: "og:title", content: "My Photographic Desk" },
      {
        property: "og:description",
        content: "Un escritorio fotográfico interactivo para sacar Polaroids del sobre y construir álbumes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Desk,
});
