"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  animate,
  MotionValue,
} from "framer-motion";

// ─── Layout constants ──────────────────────────────────────────────────────────

const PIECE_SIZE = 130;
const HALF       = PIECE_SIZE / 2;       // 65
const CLUSTER_W  = PIECE_SIZE * 4;       // 520
const CLUSTER_H  = PIECE_SIZE * 2;       // 260

// ─── SVG clip-paths (4×2 interlocking grid, 130×130 bounding box) ─────────────
// Tab math: centre=65, range 52–78, protrusion=15, control-offset=7
// Abbreviations: FT/BT/TT = flat/blank/tab top; FL/BL = flat/blank left; TR/FR = tab/flat right; TB/FB = tab/flat bottom

const CLIP_PATHS = [
  // P1: FT FL TR TB
  "M 0,0 L 130,0 L 130,52 C 137,52 145,58 145,65 S 137,78 130,78 L 130,130 L 78,130 C 78,137 72,145 65,145 S 52,137 52,130 L 0,130 Z",
  // P2: FT BL TR TB
  "M 0,0 L 130,0 L 130,52 C 137,52 145,58 145,65 S 137,78 130,78 L 130,130 L 78,130 C 78,137 72,145 65,145 S 52,137 52,130 L 0,130 L 0,78 C 7,78 15,72 15,65 S 7,52 0,52 Z",
  // P3: same as P2  FT BL TR TB
  "M 0,0 L 130,0 L 130,52 C 137,52 145,58 145,65 S 137,78 130,78 L 130,130 L 78,130 C 78,137 72,145 65,145 S 52,137 52,130 L 0,130 L 0,78 C 7,78 15,72 15,65 S 7,52 0,52 Z",
  // P4: FT BL FR TB
  "M 0,0 L 130,0 L 130,130 L 78,130 C 78,137 72,145 65,145 S 52,137 52,130 L 0,130 L 0,78 C 7,78 15,72 15,65 S 7,52 0,52 Z",
  // P5: BT FL TR FB
  "M 0,0 L 52,0 C 52,7 58,15 65,15 S 78,7 78,0 L 130,0 L 130,52 C 137,52 145,58 145,65 S 137,78 130,78 L 130,130 L 0,130 Z",
  // P6: BT BL TR FB
  "M 0,0 L 52,0 C 52,7 58,15 65,15 S 78,7 78,0 L 130,0 L 130,52 C 137,52 145,58 145,65 S 137,78 130,78 L 130,130 L 0,130 L 0,78 C 7,78 15,72 15,65 S 7,52 0,52 Z",
  // P7: same as P6  BT BL TR FB
  "M 0,0 L 52,0 C 52,7 58,15 65,15 S 78,7 78,0 L 130,0 L 130,52 C 137,52 145,58 145,65 S 137,78 130,78 L 130,130 L 0,130 L 0,78 C 7,78 15,72 15,65 S 7,52 0,52 Z",
  // P8: BT BL FR FB
  "M 0,0 L 52,0 C 52,7 58,15 65,15 S 78,7 78,0 L 130,0 L 130,130 L 0,130 L 0,78 C 7,78 15,72 15,65 S 7,52 0,52 Z",
] as const;

// ─── Piece data ────────────────────────────────────────────────────────────────

interface PieceDefinition {
  readonly id: string;
  readonly clipPath: string;
  readonly label: string;
  readonly gridX: number;
  readonly gridY: number;
  readonly scatterX: number;
  readonly scatterY: number;
  readonly scatterRotate: number;
  readonly placeholder: string;
  readonly imageSrc?: string;
}

// Grid positions:  col1→-195  col2→-65  col3→65  col4→195
//                  row1→-65              row2→65
const PIECES: readonly PieceDefinition[] = [
  { id:"p1", clipPath:CLIP_PATHS[0], label:"Personal photo",
    gridX:-195, gridY:-65, scatterX:-80, scatterY:40,  scatterRotate:-6,
    placeholder:"#BFDBFE", imageSrc:"/images/portfolio pics/IMG_8279.jpeg" },
  { id:"p2", clipPath:CLIP_PATHS[1], label:"My pet",
    gridX:-65,  gridY:-65, scatterX:60,  scatterY:-60, scatterRotate:4,
    placeholder:"#FDE68A", imageSrc:"/images/portfolio pics/pet.png" },
  { id:"p3", clipPath:CLIP_PATHS[2], label:"SolidWorks project",
    gridX:65,   gridY:-65, scatterX:-50, scatterY:-70, scatterRotate:-3,
    placeholder:"#BBF7D0", imageSrc:"/images/portfolio pics/solidworks.png" },
  { id:"p4", clipPath:CLIP_PATHS[3], label:"Where I'm from",
    gridX:195,  gridY:-65, scatterX:80,  scatterY:30,  scatterRotate:5,
    placeholder:"#F5D0FE", imageSrc:"/images/portfolio pics/where im from.png" },
  { id:"p5", clipPath:CLIP_PATHS[4], label:"",
    gridX:-195, gridY:65,  scatterX:-70, scatterY:-30, scatterRotate:5,
    placeholder:"#E0E7FF" },
  { id:"p6", clipPath:CLIP_PATHS[5], label:"",
    gridX:-65,  gridY:65,  scatterX:50,  scatterY:60,  scatterRotate:-4,
    placeholder:"#FCE7F3" },
  { id:"p7", clipPath:CLIP_PATHS[6], label:"",
    gridX:65,   gridY:65,  scatterX:90,  scatterY:-50, scatterRotate:3,
    placeholder:"#D1FAE5" },
  { id:"p8", clipPath:CLIP_PATHS[7], label:"",
    gridX:195,  gridY:65,  scatterX:-60, scatterY:80,  scatterRotate:-5,
    placeholder:"#FEF9C3" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) =>
  a + (b - a) * Math.min(Math.max(t, 0), 1);

const SPRING = { type: "spring" as const, stiffness: 300, damping: 28 };

// ─── PuzzlePiece ───────────────────────────────────────────────────────────────

interface PuzzlePieceProps {
  readonly def: PieceDefinition;
  readonly x: MotionValue<number>;
  readonly y: MotionValue<number>;
  readonly rotate: MotionValue<number>;
  readonly scale: MotionValue<number>;
  readonly opacity: MotionValue<number>;
  readonly isAssembled: boolean;
  readonly frameRef: React.RefObject<HTMLDivElement | null>;
  readonly onDragEnd: () => void;
}

function PuzzlePiece({ def, x, y, rotate, scale, opacity, isAssembled, frameRef, onDragEnd }: PuzzlePieceProps) {
  return (
    <motion.div
      aria-label={def.label || undefined}
      drag={isAssembled}
      dragConstraints={frameRef}
      dragMomentum={false}
      dragElastic={0.05}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.06, filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.22))", zIndex: 30 }}
      className="absolute"
      style={{
        width: PIECE_SIZE,
        height: PIECE_SIZE,
        left: "50%",
        top: "50%",
        marginLeft: -HALF,
        marginTop: -HALF,
        clipPath: `path('${def.clipPath}')`,
        filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.12))",
        cursor: isAssembled ? "grab" : "default",
        willChange: "transform",
        x, y, rotate, scale, opacity,
      }}
    >
      {def.imageSrc ? (
        <img
          src={def.imageSrc}
          alt={def.label}
          draggable={false}
          className="block w-full h-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="w-full h-full"
          style={{ background: def.placeholder }}
        />
      )}
    </motion.div>
  );
}

// ─── HeroPuzzle ────────────────────────────────────────────────────────────────

export default function HeroPuzzle() {
  const sectionRef  = useRef<HTMLElement>(null);
  const frameRef    = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const [isAssembled, setIsAssembled] = useState(prefersReducedMotion);
  const isAssembledRef = useRef(prefersReducedMotion);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end center"],
  });

  // ── Motion values (8 pieces × 5 props = 40, all at top level) ────────────────

  const sx = (i: number) => prefersReducedMotion ? PIECES[i].gridX : PIECES[i].gridX + PIECES[i].scatterX;
  const sy = (i: number) => prefersReducedMotion ? PIECES[i].gridY : PIECES[i].gridY + PIECES[i].scatterY;
  const sr = (i: number) => prefersReducedMotion ? 0 : PIECES[i].scatterRotate;
  const initSc = prefersReducedMotion ? 1 : 0.94;
  const initOp = prefersReducedMotion ? 1 : 0.75;

  const p0x = useMotionValue(sx(0)); const p0y = useMotionValue(sy(0)); const p0r = useMotionValue(sr(0)); const p0sc = useMotionValue(initSc); const p0op = useMotionValue(initOp);
  const p1x = useMotionValue(sx(1)); const p1y = useMotionValue(sy(1)); const p1r = useMotionValue(sr(1)); const p1sc = useMotionValue(initSc); const p1op = useMotionValue(initOp);
  const p2x = useMotionValue(sx(2)); const p2y = useMotionValue(sy(2)); const p2r = useMotionValue(sr(2)); const p2sc = useMotionValue(initSc); const p2op = useMotionValue(initOp);
  const p3x = useMotionValue(sx(3)); const p3y = useMotionValue(sy(3)); const p3r = useMotionValue(sr(3)); const p3sc = useMotionValue(initSc); const p3op = useMotionValue(initOp);
  const p4x = useMotionValue(sx(4)); const p4y = useMotionValue(sy(4)); const p4r = useMotionValue(sr(4)); const p4sc = useMotionValue(initSc); const p4op = useMotionValue(initOp);
  const p5x = useMotionValue(sx(5)); const p5y = useMotionValue(sy(5)); const p5r = useMotionValue(sr(5)); const p5sc = useMotionValue(initSc); const p5op = useMotionValue(initOp);
  const p6x = useMotionValue(sx(6)); const p6y = useMotionValue(sy(6)); const p6r = useMotionValue(sr(6)); const p6sc = useMotionValue(initSc); const p6op = useMotionValue(initOp);
  const p7x = useMotionValue(sx(7)); const p7y = useMotionValue(sy(7)); const p7r = useMotionValue(sr(7)); const p7sc = useMotionValue(initSc); const p7op = useMotionValue(initOp);

  const blueprintOp = useMotionValue(prefersReducedMotion ? 0.55 : 0);

  const pieceMotion = [
    { x: p0x, y: p0y, rotate: p0r, scale: p0sc, opacity: p0op },
    { x: p1x, y: p1y, rotate: p1r, scale: p1sc, opacity: p1op },
    { x: p2x, y: p2y, rotate: p2r, scale: p2sc, opacity: p2op },
    { x: p3x, y: p3y, rotate: p3r, scale: p3sc, opacity: p3op },
    { x: p4x, y: p4y, rotate: p4r, scale: p4sc, opacity: p4op },
    { x: p5x, y: p5y, rotate: p5r, scale: p5sc, opacity: p5op },
    { x: p6x, y: p6y, rotate: p6r, scale: p6sc, opacity: p6op },
    { x: p7x, y: p7y, rotate: p7r, scale: p7sc, opacity: p7op },
  ];

  // ── Scroll-driven updates ──────────────────────────────────────────────────────

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (prefersReducedMotion) return;

    if (v > 0.92 && !isAssembledRef.current) {
      // Lock to assembled positions and enable drag
      isAssembledRef.current = true;
      setIsAssembled(true);
      pieceMotion.forEach((mv, i) => {
        mv.x.set(PIECES[i].gridX);
        mv.y.set(PIECES[i].gridY);
        mv.rotate.set(0);
        mv.scale.set(1);
        mv.opacity.set(1);
      });
      blueprintOp.set(0.55);
      return;
    }

    if (isAssembledRef.current) return;

    // Animate pieces toward assembled positions
    pieceMotion.forEach((mv, i) => {
      const p = PIECES[i];
      mv.x.set(lerp(p.gridX + p.scatterX, p.gridX, v));
      mv.y.set(lerp(p.gridY + p.scatterY, p.gridY, v));
      mv.rotate.set(lerp(p.scatterRotate, 0, v));
      mv.scale.set(lerp(0.94, 1, v));
      mv.opacity.set(lerp(0.75, 1, v));
    });

    // Blueprint fades in from 50% → 85% scroll
    blueprintOp.set(lerp(0, 0.55, Math.min(Math.max((v - 0.5) / 0.35, 0), 1)));
  });

  // ── Snap to nearest slot after drag ───────────────────────────────────────────

  function snapToSlot(mx: MotionValue<number>, my: MotionValue<number>) {
    const cx = mx.get(), cy = my.get();
    let best = PIECES[0];
    let minD = Infinity;
    PIECES.forEach(p => {
      const d = Math.hypot(cx - p.gridX, cy - p.gridY);
      if (d < minD) { minD = d; best = p; }
    });
    if (minD < PIECE_SIZE * 0.9) {
      animate(mx, best.gridX, SPRING);
      animate(my, best.gridY, SPRING);
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#F7F7F5]"
      style={{ minHeight: prefersReducedMotion ? "auto" : "180vh" }}
    >
      {/* Sticky viewport — puzzle is centred here while user scrolls */}
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: "100vh",
          position: prefersReducedMotion ? "relative" : "sticky",
          top: 0,
        }}
      >
        {/* Cluster + drag frame */}
        <div
          ref={frameRef}
          className="relative overflow-visible"
          style={{ width: CLUSTER_W, height: CLUSTER_H }}
        >
          {/* Blueprint: outer dashed frame + inner grid lines */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: blueprintOp }}
          >
            <div className="absolute inset-0 border-[1.5px] border-dashed border-gray-300" />
            {[1, 2, 3].map(c => (
              <div
                key={c}
                className="absolute top-0 bottom-0 border-l border-dashed border-gray-200"
                style={{ left: c * PIECE_SIZE }}
              />
            ))}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-gray-200"
              style={{ top: PIECE_SIZE }}
            />
          </motion.div>

          {/* 8 puzzle pieces */}
          {PIECES.map((piece, i) => (
            <PuzzlePiece
              key={piece.id}
              def={piece}
              {...pieceMotion[i]}
              isAssembled={isAssembled}
              frameRef={frameRef}
              onDragEnd={() => snapToSlot(pieceMotion[i].x, pieceMotion[i].y)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
