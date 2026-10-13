import { useState } from "react";

import { textures } from "@/lib/desk/assets";
import { useDesk } from "@/lib/desk/store";
import { playSound } from "@/lib/desk/sounds";
import { listDriveFolder } from "@/lib/drive.functions";
import type { PhotoEnvelope } from "@/lib/desk/types";
import { DeskObject } from "./DeskObject";

const MAX_SIDE = 200;

export function parseDriveFolderId(url: string): string | null {
  const t = url.trim();
  const m = t.match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([\w-]{10,})/) ?? t.match(/drive\.google\.com\/.*[?&]id=([\w-]{10,})/);
  return m?.[1] ?? null;
}

/** Little tin mailbox on the desk: opens the form to make a new envelope. */
export function Mailbox() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => { setOpen(true); playSound("paper"); }}
        className="absolute cursor-pointer drop-shadow-object transition-transform hover:-translate-y-1"
        style={{ left: 560, top: 70, width: 120, zIndex: 6, transform: "rotate(-4deg)" }}
        aria-label="Crear un sobre nuevo"
      >
        <svg viewBox="0 0 120 96" width={120} height={96} aria-hidden>
          <rect x="6" y="30" width="96" height="58" rx="6" fill="oklch(0.55 0.09 35)" />
          <path d="M6 40 Q6 8 40 8 H70 Q102 8 102 40 Z" fill="oklch(0.6 0.1 35)" />
          <rect x="22" y="44" width="54" height="8" rx="2" fill="oklch(0.25 0.03 40)" opacity=".65" />
          <rect x="102" y="18" width="5" height="44" fill="oklch(0.42 0.04 60)" />
          <path d="M107 18 h12 v12 h-12z" fill="oklch(0.62 0.17 30)" />
          <rect x="14" y="66" width="80" height="16" rx="2" fill="oklch(0.93 0.03 85)" opacity=".9" />
        </svg>
        <span className="absolute left-[14px] top-[67px] w-[80px] text-center font-hand text-[13px] text-ink/70">correo</span>
      </button>
      {open ? <EnvelopeForm onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function EnvelopeForm({ onClose }: { onClose: () => void }) {
  const categories = useDesk((s) => s.categories);
  const addEnvelope = useDesk((s) => s.addEnvelope);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = category === "__new" ? newCategory.trim() : category;
    const folderId = parseDriveFolderId(url);
    const errs: Record<string, string> = {};
    if (!name.trim()) errs["name"] = "Ponle un nombre al sobre.";
    if (!date) errs["date"] = "Indica la fecha.";
    if (!cat) errs["category"] = "Elige o escribe una categoría.";
    if (!url.trim()) errs["url"] = "Pega el enlace de la carpeta de Drive.";
    else if (!folderId) errs["url"] = "Ese enlace no parece una carpeta de Google Drive.";
    setErrors(errs);
    if (Object.keys(errs).length || !folderId) return;

    setBusy(true);
    try {
      const res = await listDriveFolder({ data: { folderId } });
      if (res.error) { setErrors({ url: res.error }); return; }
      const photos = res.photos.map((p) => {
        const w0 = p.width ?? 3, h0 = p.height ?? 4;
        const k = MAX_SIDE / Math.max(w0, h0);
        return { src: `/api/public/drive-image/${p.id}`, name: p.name, w: Math.round(w0 * k), h: Math.round(h0 * k) };
      });
      const [y, m, d] = date.split("-");
      addEnvelope({ name: name.trim(), date: `${Number(d)}/${Number(m)}/${y}`, category: cat, driveUrl: url.trim(), driveFolderId: folderId }, photos);
      playSound("paper");
      onClose();
    } catch {
      setErrors({ url: "No se pudo leer la carpeta. Inténtalo de nuevo." });
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-[3px] border border-ink/20 bg-paper/70 px-2 py-1.5 font-serif text-ink outline-none focus:border-ink/50";
  const label = "block font-hand text-lg text-ink/75";
  const err = (k: string) => (errors[k] ? <p className="mt-0.5 font-hand text-sm text-destructive">{errors[k]}</p> : null);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-ink/30"
      style={{ zIndex: 9500 }}
      onPointerDown={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={submit}
        className="relative w-[420px] rotate-[-1deg] bg-photo-back p-7 shadow-album"
        style={{ borderRadius: 2 }}
      >
        <h2 className="mb-4 font-hand text-3xl text-ink/85">Un sobre nuevo</h2>
        <div className="space-y-3">
          <div>
            <label className={label} htmlFor="env-name">Nombre del sobre</label>
            <input id="env-name" className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Verano en la costa" />
            {err("name")}
          </div>
          <div>
            <label className={label} htmlFor="env-date">Fecha</label>
            <input id="env-date" type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
            {err("date")}
          </div>
          <div>
            <label className={label} htmlFor="env-cat">Categoría</label>
            <select id="env-cat" className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="__new">+ nueva categoría…</option>
            </select>
            {category === "__new" ? (
              <input className={`${field} mt-2`} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} maxLength={30} placeholder="Nombre de la categoría" />
            ) : null}
            {err("category")}
          </div>
          <div>
            <label className={label} htmlFor="env-url">Carpeta de Google Drive</label>
            <input id="env-url" className={field} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/drive/folders/…" />
            {err("url")}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 font-hand text-lg">
          <button type="button" onClick={onClose} className="px-3 py-1 text-ink/60 hover:text-ink">cancelar</button>
          <button type="submit" disabled={busy} className="rounded-[3px] bg-ink/85 px-4 py-1 text-paper hover:bg-ink disabled:opacity-60">
            {busy ? "buscando fotos…" : "guardar sobre"}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Envelopes created from the mailbox, each with its own photos. */
export function PhotoEnvelopes() {
  const envelopes = useDesk((s) => s.envelopes);
  return <>{envelopes.map((env) => <OneEnvelope key={env.id} env={env} />)}</>;
}

function OneEnvelope({ env }: { env: PhotoEnvelope }) {
  const openId = useDesk((s) => s.openEnvelopeId);
  const setOpen = useDesk((s) => s.setOpenEnvelope);
  const objects = useDesk((s) => s.objects);
  const inside = objects.filter((o) => o.location === "envelope" && o.envelopeId === env.id);
  const open = openId === env.id;

  return (
    <>
      <div className="absolute" style={{ left: env.x, top: env.y, width: 190, transform: `translate(-50%, -50%) rotate(${env.rotation}deg)`, zIndex: 4 }}>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => { setOpen(open ? null : env.id); playSound("paper"); }}
          className="relative block w-full cursor-pointer"
          aria-label={open ? `Cerrar el sobre ${env.name}` : `Abrir el sobre ${env.name}`}
        >
          <img src={textures.envelopeClosed} alt="" draggable={false} className="w-full select-none drop-shadow-object" />
          <span className="absolute left-1/2 top-[38%] max-w-[85%] -translate-x-1/2 truncate font-hand text-lg leading-none text-ink/75">{env.name}</span>
          <span className="absolute left-1/2 top-[56%] -translate-x-1/2 whitespace-nowrap font-hand text-xs text-ink/50">
            {env.category} · {open ? "cerrar" : `${inside.length} fotos`}
          </span>
          {/* hand-stamped date */}
          <span className="absolute right-2 top-2 rotate-[8deg] rounded-full border border-destructive/50 px-1.5 py-0.5 font-hand text-[11px] text-destructive/70">
            {env.date}
          </span>
        </button>
      </div>
      {open ? (
        <div className="absolute" style={{ left: env.x - 560, top: env.y - 260, zIndex: 40 }}>
          {inside.map((o, i) => (
            <div key={o.id} className="absolute animate-lift" style={{ left: (i % 8) * 60, top: Math.floor(i / 8) * 70 - (i % 8) * 6, animationDelay: `${Math.min(i, 12) * 30}ms` }}>
              <DeskObject obj={{ ...o, x: 0, y: 0 }} />
            </div>
          ))}
          {inside.length === 0 ? <p className="font-hand text-sm text-paper/70">este sobre está vacío</p> : null}
        </div>
      ) : null}
    </>
  );
}
