import type { Bike, Category } from "@/lib/types";
import { brandColor } from "@/lib/bikes";

/**
 * Consistent, theme-aware side-profile illustration for every bike.
 * Shape is chosen by category; paint comes from the brand.
 * Real photography can replace this later without touching layouts (same 5:3 box).
 */
export function BikeArt({
  bike,
  className = "",
  shadow = true,
}: {
  bike: Pick<Bike, "id" | "brand" | "category" | "brakes" | "engine"> & { model?: string };
  className?: string;
  shadow?: boolean;
}) {
  const c = brandColor(bike.brand);
  const uid = bike.id.replace(/[^a-z0-9]/gi, "");
  const discF = bike.brakes.front === "disc";
  const discR = bike.brakes.rear === "disc";
  const spoke = bike.category === "classic" || (bike.category === "commuter" && bike.engine.fuel === "carb" && bike.engine.cc < 115);
  const twoStroke = bike.engine.stroke === 2;
  const liquid = bike.engine.cooling === "liquid";

  return (
    <svg viewBox="0 0 400 240" className={className} role="img" aria-label={`${bike.brand} ${bike.model ?? ""} illustration`}>
      <defs>
        <linearGradient id={`paint-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c} stopOpacity="1" />
          <stop offset="1" stopColor={c} stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {shadow && <ellipse cx="200" cy="216" rx="160" ry="7" fill="var(--art-ground)" />}
      <Shape category={bike.category} paint={`url(#paint-${uid})`} sheen={`url(#sheen-${uid})`} spoke={spoke} discF={discF} discR={discR} twoStroke={twoStroke} liquid={liquid} />
    </svg>
  );
}

type ShapeProps = {
  category: Category;
  paint: string;
  sheen: string;
  spoke: boolean;
  discF: boolean;
  discR: boolean;
  twoStroke: boolean;
  liquid: boolean;
};

const INK = "var(--art-ink)";
const METAL = "var(--art-metal)";
const TYRE = "var(--art-tyre)";

function Wheel({ cx, cy, r, spoke, disc, fat = false }: { cx: number; cy: number; r: number; spoke: boolean; disc: boolean; fat?: boolean }) {
  const tw = fat ? 13 : 10;
  const inner = r - tw / 2 - 2;
  const spokes = spoke ? 18 : 5;
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={TYRE} strokeWidth={tw} />
      <circle cx={cx} cy={cy} r={inner} fill="none" stroke={METAL} strokeWidth={spoke ? 2.2 : 2.6} />
      {disc && <circle cx={cx} cy={cy} r={r * 0.42} fill="none" stroke={METAL} strokeWidth={3} strokeDasharray="2 2.6" />}
      {Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2 + 0.3;
        const r0 = spoke ? 5 : 7;
        return (
          <line
            key={i}
            x1={r2(cx + Math.cos(a) * r0)}
            y1={r2(cy + Math.sin(a) * r0)}
            x2={r2(cx + Math.cos(a + (spoke ? 0.18 : 0)) * (inner - 1))}
            y2={r2(cy + Math.sin(a + (spoke ? 0.18 : 0)) * (inner - 1))}
            stroke={spoke ? METAL : INK}
            strokeWidth={spoke ? 0.9 : 4}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={spoke ? 6 : 8} fill={INK} />
      <circle cx={cx} cy={cy} r={2.4} fill={METAL} />
    </g>
  );
}

function Engine({ x, y, w = 70, h = 46, fins = true, liquid = false }: { x: number; y: number; w?: number; h?: number; fins?: boolean; liquid?: boolean }) {
  return (
    <g>
      <path
        d={`M${x + 6} ${y} h${w - 22} l14 ${h * 0.34} q4 6 4 12 v${h * 0.3} q0 10 -10 10 h${-(w - 18)} q-12 0 -14 -12 l-4 -${h * 0.5} q-1 -10 10 -${h * 0.18}z`}
        fill={INK}
      />
      {fins &&
        !liquid &&
        [0, 1, 2, 3].map((i) => (
          <line key={i} x1={x + 12 + i * 2} y1={y + 6 + i * 6} x2={x + w - 26 + i * 3} y2={y + 6 + i * 6} stroke={METAL} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        ))}
      {liquid && <rect x={x + 10} y={y + 6} width={w - 34} height={14} rx={4} fill={METAL} opacity="0.35" />}
      <circle cx={x + w - 18} cy={y + h - 10} r={9} fill="none" stroke={METAL} strokeWidth="2" opacity="0.65" />
    </g>
  );
}

function Shape(p: ShapeProps) {
  switch (p.category) {
    case "scooter":
      return <Scooter {...p} />;
    case "sport":
      return <Sport {...p} />;
    case "adventure":
      return <Adventure {...p} />;
    case "cruiser":
      return <Cruiser {...p} />;
    case "classic":
      return <Classic {...p} />;
    case "naked":
      return <Naked {...p} />;
    case "commuter":
      return <Commuter {...p} />;
    default:
      return <Street {...p} />;
  }
}

/* ---------------- Street (150–165cc all-rounder) ---------------- */
function Street({ paint, sheen, spoke, discF, discR, liquid }: ShapeProps) {
  return (
    <g strokeLinejoin="round">
      {/* swingarm + frame */}
      <path d="M96 166 L186 156" stroke={INK} strokeWidth="8" strokeLinecap="round" />
      <path d="M270 86 L196 138 L150 112" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M118 126 L170 150" stroke={METAL} strokeWidth="4" strokeLinecap="round" />
      {/* rear shock */}
      <path d="M128 162 L150 110" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <Wheel cx={96} cy={166} r={45} spoke={spoke} disc={discR} />
      <Wheel cx={302} cy={166} r={45} spoke={spoke} disc={discF} />
      <Engine x={168} y={128} liquid={liquid} />
      {/* exhaust */}
      <path d="M214 180 C190 192, 160 170, 150 158" stroke={METAL} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M112 140 L160 152 L156 166 L106 152 Z" fill={INK} />
      <path d="M108 146 L156 158" stroke={METAL} strokeWidth="2" opacity="0.6" />
      {/* fork */}
      <path d="M302 166 L270 78" stroke={METAL} strokeWidth="8" strokeLinecap="round" />
      <path d="M296 150 L274 92" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* tail */}
      <path d="M92 96 L150 104 L172 122 L128 124 Z" fill={paint} />
      <path d="M86 94 L100 95 L98 103 L86 101 Z" fill="var(--signal)" opacity="0.9" />
      {/* seat */}
      <path d="M112 98 C140 92, 176 92, 204 100 L200 112 C172 112, 140 110, 116 106 Z" fill={INK} />
      {/* tank + shroud */}
      <path d="M196 98 C206 78, 246 70, 272 82 L266 112 C252 124, 218 124, 200 116 Z" fill={paint} />
      <path d="M196 98 C206 78, 246 70, 272 82 L270 92 C246 82, 214 86, 200 104 Z" fill={sheen} />
      <path d="M232 104 L276 96 L268 128 L238 128 Z" fill={paint} opacity="0.9" />
      {/* headlight + bars */}
      <path d="M276 78 L296 82 L300 98 L284 104 L274 92 Z" fill={INK} />
      <path d="M290 86 L298 88 L298 96 L290 98 Z" fill="#fff8d6" opacity="0.9" />
      <path d="M252 68 L272 72 L282 70" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* front fender */}
      <path d="M280 126 Q302 112 324 126" stroke={paint} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Commuter (100–125cc) ---------------- */
function Commuter({ paint, sheen, spoke, discF, discR }: ShapeProps) {
  return (
    <g strokeLinejoin="round">
      <path d="M100 168 L186 160" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M266 90 L196 144" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M134 164 L150 112" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      {/* chain guard */}
      <path d="M104 160 L182 152 L184 160 L106 168 Z" fill={paint} opacity="0.85" />
      <Wheel cx={100} cy={168} r={43} spoke={spoke} disc={discR} />
      <Wheel cx={298} cy={168} r={43} spoke={spoke} disc={discF} />
      <Engine x={172} y={134} w={62} h={42} />
      <path d="M214 182 C180 192, 150 180, 130 170" stroke={METAL} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M96 156 L146 168 L144 178 L92 166 Z" fill={METAL} opacity="0.9" />
      <path d="M298 168 L266 82" stroke={METAL} strokeWidth="7" strokeLinecap="round" />
      {/* side panel + tail */}
      <path d="M100 104 L170 108 L180 132 L136 132 Z" fill={paint} />
      <path d="M94 102 L106 103 L104 110 L94 109 Z" fill="var(--signal)" opacity="0.9" />
      {/* long flat seat */}
      <path d="M104 102 C140 96, 186 96, 212 104 L208 114 C176 114, 136 112, 106 110 Z" fill={INK} />
      {/* tank */}
      <path d="M204 104 C210 86, 244 80, 266 88 L262 114 C246 124, 220 124, 206 118 Z" fill={paint} />
      <path d="M204 104 C210 86, 244 80, 266 88 L264 96 C244 90, 220 94, 206 108 Z" fill={sheen} />
      {/* headlamp cowl */}
      <path d="M268 80 C280 76, 292 80, 294 92 L284 104 L270 96 Z" fill={paint} />
      <circle cx="288" cy="92" r="6" fill="#fff8d6" opacity="0.9" />
      <path d="M250 70 L270 74 L282 72" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M276 128 Q298 114 320 128" stroke={paint} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Naked / streetfighter ---------------- */
function Naked({ paint, sheen, spoke, discF, discR, liquid }: ShapeProps) {
  return (
    <g strokeLinejoin="round">
      <path d="M98 166 L188 154" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      {/* trellis frame */}
      <path d="M272 84 L200 132 L160 108 M236 106 L204 140 M200 132 L172 140" stroke={paint} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M140 160 L162 108" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <Wheel cx={98} cy={166} r={45} spoke={spoke} disc={discR} fat />
      <Wheel cx={302} cy={166} r={45} spoke={spoke} disc={discF} />
      <Engine x={170} y={126} liquid={liquid} />
      {/* underbelly exhaust */}
      <path d="M200 180 L236 184 L244 176 L210 170 Z" fill={INK} />
      <path d="M204 176 L238 180" stroke={METAL} strokeWidth="2" />
      {/* USD fork */}
      <path d="M302 166 L272 80" stroke={INK} strokeWidth="10" strokeLinecap="round" />
      <path d="M298 156 L284 116" stroke={METAL} strokeWidth="6" strokeLinecap="round" />
      {/* sharp tail */}
      <path d="M80 86 L156 104 L176 120 L132 118 Z" fill={paint} />
      <path d="M76 84 L90 87 L88 92 L76 90 Z" fill="var(--signal)" />
      <path d="M118 98 C146 96, 178 100, 200 104 L196 114 C170 114, 144 110, 120 106 Z" fill={INK} />
      {/* muscular tank + shrouds */}
      <path d="M192 100 L222 76 L270 80 L276 96 L256 120 L204 120 Z" fill={paint} />
      <path d="M192 100 L222 76 L270 80 L272 88 L226 86 L200 106 Z" fill={sheen} />
      <path d="M236 100 L284 94 L276 134 L246 132 Z" fill={INK} opacity="0.85" />
      <path d="M244 104 L280 100 L276 118 Z" fill={paint} />
      {/* angular headlight */}
      <path d="M276 76 L298 80 L304 94 L290 104 L278 94 Z" fill={INK} />
      <path d="M292 86 L302 90 L292 96 Z" fill="#fff8d6" />
      <path d="M248 70 L270 70 L286 66" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M286 122 Q304 114 320 126" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Sport (faired) ---------------- */
function Sport({ paint, sheen, spoke, discF, discR, liquid }: ShapeProps) {
  return (
    <g strokeLinejoin="round">
      <path d="M98 166 L190 152" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M142 160 L160 108" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <Wheel cx={98} cy={166} r={45} spoke={spoke} disc={discR} fat />
      <Wheel cx={304} cy={166} r={45} spoke={spoke} disc={discF} />
      <Engine x={172} y={128} liquid={liquid} />
      <path d="M210 178 C176 186, 150 170, 140 150" stroke={METAL} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M118 136 L156 146 L152 160 L112 150 Z" fill={INK} />
      <path d="M304 166 L274 84" stroke={METAL} strokeWidth="8" strokeLinecap="round" />
      {/* tail section */}
      <path d="M76 84 L150 100 L178 122 L126 122 Z" fill={paint} />
      <path d="M76 84 L150 100 L156 106 L84 92 Z" fill={sheen} />
      <path d="M72 82 L86 85 L84 90 L72 88 Z" fill="var(--signal)" />
      {/* split seat */}
      <path d="M120 98 L156 104 L154 110 L118 104 Z" fill={INK} />
      <path d="M156 104 C176 104, 192 106, 206 110 L202 118 C186 118, 170 116, 154 112 Z" fill={INK} />
      {/* tank */}
      <path d="M196 106 C206 86, 238 78, 262 84 L256 112 L204 118 Z" fill={paint} />
      {/* full fairing */}
      <path d="M232 92 L272 76 C290 74, 304 82, 306 96 L296 118 C286 142, 262 160, 226 158 L214 148 L230 120 Z" fill={paint} />
      <path d="M232 92 L272 76 C290 74, 304 82, 306 96 L300 104 C292 92, 270 88, 238 104 Z" fill={sheen} />
      <path d="M244 122 L282 112 L272 134 L242 138 Z" fill={INK} opacity="0.85" />
      {/* screen + headlight */}
      <path d="M266 74 L290 62 L298 72 L282 78 Z" fill={INK} opacity="0.55" />
      <path d="M292 94 L306 96 L300 104 L288 102 Z" fill="#fff8d6" />
      <path d="M258 86 L274 84" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M286 126 Q306 116 324 128" stroke={paint} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Adventure / dual-sport ---------------- */
function Adventure({ paint, sheen, spoke, discF, discR }: ShapeProps) {
  return (
    <g strokeLinejoin="round">
      <path d="M92 160 L184 148" stroke={INK} strokeWidth="8" strokeLinecap="round" />
      <path d="M272 70 L198 128 L150 96" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M134 152 L156 96" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <Wheel cx={92} cy={160} r={47} spoke={true} disc={discR} />
      <Wheel cx={310} cy={158} r={50} spoke={true} disc={discF} />
      <Engine x={170} y={120} />
      {/* skid plate */}
      <path d="M168 168 L232 168 L244 152 L240 170 L226 180 L176 178 Z" fill={METAL} opacity="0.8" />
      {/* high exhaust */}
      <path d="M206 168 C186 160, 168 126, 150 112" stroke={METAL} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M112 100 L150 110 L146 124 L106 114 Z" fill={INK} />
      {/* long-travel fork */}
      <path d="M310 158 L270 60" stroke={METAL} strokeWidth="8" strokeLinecap="round" />
      <path d="M300 138 L280 88" stroke={INK} strokeWidth="9" strokeLinecap="round" opacity="0.8" />
      {/* tail + rack */}
      <path d="M78 82 L146 88 L170 108 L118 108 Z" fill={paint} />
      <path d="M74 78 L112 80" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M70 80 L82 81 L80 88 L70 87 Z" fill="var(--signal)" />
      {/* long flat seat */}
      <path d="M104 84 C140 80, 186 82, 214 90 L210 100 C178 100, 140 96, 106 94 Z" fill={INK} />
      {/* tall tank + shroud */}
      <path d="M204 92 C212 70, 244 62, 270 70 L268 104 C252 114, 222 114, 206 108 Z" fill={paint} />
      <path d="M204 92 C212 70, 244 62, 270 70 L270 78 C246 72, 220 78, 206 98 Z" fill={sheen} />
      <path d="M238 92 L282 84 L276 120 L244 122 Z" fill={paint} opacity="0.9" />
      {/* screen + headlight + beak */}
      <path d="M272 56 L290 46 L298 62 L282 68 Z" fill={INK} opacity="0.55" />
      <path d="M278 64 L300 68 L304 84 L288 92 L278 80 Z" fill={INK} />
      <circle cx="294" cy="78" r="5" fill="#fff8d6" />
      <path d="M298 92 L328 100 L304 104 Z" fill={paint} />
      <path d="M248 54 L270 58 L288 54" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Cruiser ---------------- */
function Cruiser({ paint, sheen, spoke, discF, discR }: ShapeProps) {
  return (
    <g strokeLinejoin="round">
      <path d="M86 168 L176 162" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M268 92 L196 146 L132 128" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M118 164 L132 122" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <Wheel cx={86} cy={168} r={44} spoke={spoke} disc={discR} fat />
      <Wheel cx={316} cy={166} r={46} spoke={spoke} disc={discF} />
      <Engine x={166} y={134} w={74} />
      {/* long low exhaust */}
      <path d="M200 186 L120 180" stroke={METAL} strokeWidth="7" strokeLinecap="round" />
      <path d="M150 180 L84 172" stroke={METAL} strokeWidth="9" strokeLinecap="round" />
      {/* raked fork */}
      <path d="M316 166 L272 84" stroke={METAL} strokeWidth="8" strokeLinecap="round" />
      {/* rear fender + stepped seat */}
      <path d="M50 150 C56 110, 100 104, 132 118 L130 128 C100 118, 70 126, 64 152 Z" fill={paint} />
      <path d="M96 108 C112 100, 126 102, 132 112 L170 116 C176 116, 190 116, 200 112 L198 124 C178 128, 150 128, 120 126 C104 126, 96 118, 96 108 Z" fill={INK} />
      {/* teardrop tank */}
      <path d="M196 112 C204 92, 246 86, 270 98 L264 116 C246 126, 214 126, 198 122 Z" fill={paint} />
      <path d="M196 112 C204 92, 246 86, 270 98 L268 104 C244 96, 214 100, 200 116 Z" fill={sheen} />
      {/* headlamp + wide bars */}
      <circle cx="290" cy="96" r="11" fill={INK} />
      <circle cx="292" cy="96" r="7" fill="#fff8d6" />
      <path d="M244 72 C256 70, 266 74, 270 84 L282 82" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M294 130 Q316 116 338 130" stroke={paint} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Classic / retro ---------------- */
function Classic({ paint, sheen, discF, discR, twoStroke }: ShapeProps) {
  return (
    <g strokeLinejoin="round">
      <path d="M98 168 L184 160" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M266 86 L198 146 L148 112" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M130 164 L146 112" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <Wheel cx={98} cy={168} r={44} spoke disc={discR} />
      <Wheel cx={300} cy={168} r={44} spoke disc={discF} />
      {/* fenders */}
      <path d="M48 160 C50 118, 92 108, 128 120" stroke={paint} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M268 140 C276 116, 314 112, 336 138" stroke={paint} strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* tall single (or 2-stroke) engine */}
      <path d="M182 118 h40 v30 h-40z" fill={INK} />
      {!twoStroke &&
        [0, 1, 2, 3, 4].map((i) => <line key={i} x1="180" y1={122 + i * 6} x2="224" y2={122 + i * 6} stroke={METAL} strokeWidth="1.8" opacity="0.7" />)}
      <Engine x={170} y={142} w={72} h={38} fins={false} />
      {/* pea-shooter exhaust */}
      <path d="M204 160 C200 178, 180 182, 150 182 L84 180" stroke={METAL} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M300 168 L266 84" stroke={METAL} strokeWidth="7" strokeLinecap="round" />
      {/* tool box + sprung seats */}
      <path d="M126 116 L164 118 L162 138 L130 136 Z" fill={paint} />
      <path d="M150 96 C164 90, 186 92, 198 100 L194 108 L154 106 Z" fill={INK} />
      <path d="M100 98 C112 94, 132 94, 146 98 L144 106 L104 106 Z" fill={INK} />
      <path d="M160 108 L156 118 M188 108 L192 118" stroke={METAL} strokeWidth="2" />
      {/* teardrop tank with knee pad */}
      <path d="M196 102 C204 84, 244 78, 266 90 L260 112 C244 120, 214 120, 198 116 Z" fill={paint} />
      <path d="M196 102 C204 84, 244 78, 266 90 L264 96 C244 88, 214 92, 200 108 Z" fill={sheen} />
      <rect x="214" y="100" width="22" height="10" rx="4" fill={INK} opacity="0.55" />
      {/* round chrome headlamp */}
      <circle cx="284" cy="90" r="13" fill={METAL} />
      <circle cx="286" cy="90" r="9" fill="#fff8d6" />
      <path d="M248 68 C258 66, 268 70, 272 78 L284 76" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Scooter ---------------- */
function Scooter({ paint, sheen, discF, discR }: ShapeProps) {
  return (
    <g strokeLinejoin="round">
      <Wheel cx={112} cy={178} r={35} spoke={false} disc={discR} />
      <Wheel cx={298} cy={178} r={35} spoke={false} disc={discF} />
      {/* CVT casing */}
      <path d="M100 168 C110 150, 160 146, 196 156 L192 178 L120 184 Z" fill={INK} />
      <path d="M86 170 L130 176" stroke={METAL} strokeWidth="6" strokeLinecap="round" />
      {/* rear body */}
      <path d="M66 140 C70 112, 106 98, 152 104 L204 112 C214 114, 220 126, 214 144 L206 160 C172 166, 128 164, 96 160 C80 158, 66 154, 66 140 Z" fill={paint} />
      <path d="M66 140 C70 112, 106 98, 152 104 L204 112 L204 120 C160 112, 100 112, 74 134 Z" fill={sheen} />
      <path d="M62 124 L74 120 L74 130 L62 132 Z" fill="var(--signal)" />
      {/* seat */}
      <path d="M100 100 C130 88, 180 92, 206 104 L202 114 C170 108, 130 106, 102 110 Z" fill={INK} />
      {/* floorboard */}
      <path d="M196 158 L252 158 L258 170 L190 172 Z" fill={INK} />
      {/* fork */}
      <path d="M298 178 L280 128" stroke={METAL} strokeWidth="7" strokeLinecap="round" />
      {/* front apron + leg shield */}
      <path d="M252 62 L272 58 C288 80, 300 112, 304 140 L292 150 L256 160 C246 130, 242 96, 252 62 Z" fill={paint} />
      <path d="M252 62 L272 58 C280 70, 288 86, 292 100 L280 96 C272 82, 262 72, 254 70 Z" fill={sheen} />
      {/* handlebar cover + headlight */}
      <path d="M234 56 C248 46, 274 46, 286 54 L282 64 L240 66 Z" fill={paint} />
      <path d="M276 50 L290 56 L286 62 Z" fill="#fff8d6" />
      <path d="M276 144 Q298 130 320 144" stroke={paint} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  );
}
