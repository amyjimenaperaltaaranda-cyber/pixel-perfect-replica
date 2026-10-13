import { textures } from "@/lib/desk/assets";
import { useDesk } from "@/lib/desk/store";
import { playSound } from "@/lib/desk/sounds";
import { DeskObject } from "./DeskObject";

const ENVELOPE = { x: 330, y: 470, w: 300, h: 225 };

export function Envelope() {
  const open = useDesk((s) => s.envelopeOpen);
  const setOpen = useDesk((s) => s.setEnvelopeOpen);
  const objects = useDesk((s) => s.objects);
  const inside = objects.filter((o) => o.location === "envelope" && !o.envelopeId);

  return (
    <>
      <div
        className="absolute"
        style={{
          left: ENVELOPE.x,
          top: ENVELOPE.y,
          width: ENVELOPE.w,
          transform: "translate(-50%, -50%) rotate(-6deg)",
          zIndex: 3,
        }}
      >
        <button
          type="button"
          onClick={() => {
            setOpen(!open);
            playSound("paper");
          }}
          className="relative block w-full cursor-pointer"
          aria-label={open ? "Cerrar el sobre" : "Abrir el sobre"}
        >
          <img
            src={textures.envelopeClosed}
            alt="Sobre de papel con fotografías"
            width={1024}
            height={768}
            loading="lazy"
            draggable={false}
            className="w-full select-none drop-shadow-object"
          />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-hand text-sm text-ink/45">
            {open ? "cerrar" : `${inside.length} fotos`}
          </span>
        </button>
      </div>

      {open ? (
        <div
          className="absolute"
          style={{ left: ENVELOPE.x - 40, top: ENVELOPE.y - 210, zIndex: 40 }}
        >
          {inside.map((o, i) => (
            <div
              key={o.id}
              className="absolute animate-lift"
              style={{ left: i * 54, top: -i * 7, animationDelay: `${i * 35}ms` }}
            >
              <DeskObject obj={{ ...o, x: 0, y: 0, rotation: o.rotation }} />
            </div>
          ))}
          <p className="absolute -top-10 left-0 whitespace-nowrap font-hand text-sm text-paper/70">
            arrastra una fotografía al álbum
          </p>
        </div>
      ) : null}
    </>
  );
}
