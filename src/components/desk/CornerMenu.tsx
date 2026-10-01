import { useRef, useState } from "react";

import { useDesk } from "@/lib/desk/store";
import { toStage, useStage } from "./stage-context";

export function CornerMenu() {
  const [hovered, setHovered] = useState(false);
  const [panel, setPanel] = useState<"albums" | "cameras" | null>(null);
  const albums = useDesk((s) => s.albums);
  const activeAlbumId = useDesk((s) => s.activeAlbumId);
  const setActiveAlbum = useDesk((s) => s.setActiveAlbum);
  const addAlbum = useDesk((s) => s.addAlbum);
  const addObject = useDesk((s) => s.addObject);
  const markSaved = useDesk((s) => s.markSaved);
  const lastSavedAt = useDesk((s) => s.lastSavedAt);
  const resetDesk = useDesk((s) => s.resetDesk);
  const stage = useStage();

  const fileRef = useRef<HTMLInputElement>(null);
  const [cameraName, setCameraName] = useState("");

  const addCamera = (dataUrl: string) => {
    const p = toStage(stage, window.innerWidth / 2, window.innerHeight / 2);
    addObject({
      type: "camera",
      assetId: "camera.custom",
      assetSrc: dataUrl,
      label: cameraName || "Mi cámara",
      x: p.x,
      y: p.y,
      rotation: (Math.random() - 0.5) * 10,
      scale: 1,
      location: "desk",
    });
    setCameraName("");
    setPanel(null);
  };

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addCamera(String(reader.result));
    reader.readAsDataURL(file);
  };

  const visible = hovered || panel !== null;

  return (
    <div
      className="fixed right-0 top-0 z-[200] p-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 ${
          visible ? "opacity-100" : "pointer-events-none opacity-0 translate-x-2"
        }`}
      >
        <div className="flex gap-1 rounded-sm border border-ink/15 bg-paper/95 px-2 py-1 font-hand text-sm text-ink/80 shadow-paper">
          <Item active={panel === "albums"} onClick={() => setPanel(panel === "albums" ? null : "albums")}>
            Álbumes
          </Item>
          <Item active={panel === "cameras"} onClick={() => setPanel(panel === "cameras" ? null : "cameras")}>
            Cámaras
          </Item>
          <Item
            onClick={() => {
              markSaved();
            }}
          >
            Guardar
          </Item>
          <Item
            onClick={() => {
              if (confirm("¿Volver al escritorio inicial? Perderás tu composición.")) resetDesk();
            }}
          >
            Reiniciar
          </Item>
        </div>

        {lastSavedAt && !panel ? (
          <p className="font-hand text-xs text-paper/70">
            guardado {new Date(lastSavedAt).toLocaleTimeString()}
          </p>
        ) : null}

        {panel === "albums" ? (
          <div className="w-60 rounded-sm border border-ink/15 bg-paper/97 p-3 font-hand text-sm text-ink/80 shadow-paper">
            <ul className="space-y-1">
              {albums.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setActiveAlbum(a.id)}
                    className={`w-full rounded-[3px] px-2 py-1 text-left transition-colors hover:bg-ink/10 ${
                      a.id === activeAlbumId ? "bg-ink/10" : ""
                    }`}
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
            <NewAlbum onAdd={addAlbum} />
          </div>
        ) : null}

        {panel === "cameras" ? (
          <div className="w-60 rounded-sm border border-ink/15 bg-paper/97 p-3 font-hand text-sm text-ink/80 shadow-paper">
            <p className="mb-2 text-ink/55">Añadir cámara</p>
            <input
              value={cameraName}
              onChange={(e) => setCameraName(e.target.value)}
              placeholder="Nombre, p. ej. Sony ZV-E10"
              className="mb-2 w-full rounded-[3px] border border-ink/20 bg-paper px-2 py-1 outline-none placeholder:text-ink/35"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/svg+xml,image/png,image/webp"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-[3px] border border-ink/20 px-2 py-1 transition-colors hover:bg-ink/10"
            >
              Subir SVG y poner en el escritorio
            </button>
          </div>
        ) : null}
      </div>

      {!visible ? (
        <div className="pointer-events-none absolute right-4 top-4 font-hand text-sm text-paper/40">
          ···
        </div>
      ) : null}
    </div>
  );
}

function NewAlbum({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <form
      className="mt-2 flex gap-1 border-t border-ink/15 pt-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name.trim());
        setName("");
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nuevo álbum"
        className="min-w-0 flex-1 rounded-[3px] border border-ink/20 bg-paper px-2 py-1 outline-none placeholder:text-ink/35"
      />
      <button type="submit" className="rounded-[3px] px-2 transition-colors hover:bg-ink/10">
        +
      </button>
    </form>
  );
}

function Item({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[3px] px-2 py-0.5 transition-colors hover:bg-ink/10 ${
        active ? "bg-ink/10" : ""
      }`}
    >
      {children}
    </button>
  );
}
