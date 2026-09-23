import * as THREE from 'three';
import { disc, extrudeUp, roundedRect } from './profiles';

/**
 * A two-impression, two-plate injection mould, in millimetres.
 *
 * This is the object MKRD actually sells: tool design and the flow analysis
 * that goes with it. It is also, not coincidentally, the same object as the
 * company mark — two plates split on a parting line — so the entrance, the page
 * transition, the logo and this simulation are all one idea seen from different
 * angles.
 *
 * The moulding is a lamp bezel: 120 × 70 mm, 3 mm nominal wall, 18 mm deep,
 * centre-fed through a cold runner to two edge gates. Ordinary sizes for the
 * automotive-lighting work on the client roster.
 */

export const TOOL = {
  bolster: { w: 380, h: 200, t: 46 },
  insert: { w: 300, h: 118, t: 24 },
  pillar: { d: 24, inset: 24 },
  cavityCount: 2,
  cavityPitch: 72,       // centre-to-centre across the tool
  openStroke: 210,       // daylight when the tool is open, mm
  part: { w: 120, h: 70, depth: 18, wall: 3, aperture: [92, 44] as [number, number] },
  runner: { d: 8, spread: 36 },
  cooling: { d: 10, rows: 2 },
  /** the process card shown alongside — a design study, not a machine spec */
  process: {
    material: 'PC/ABS, 20% glass',
    shotWeight: 84,       // g, both impressions plus runner
    fillTime: 1.9,        // s
    meltTemp: 265,        // °C
    mouldTemp: 80,        // °C
    coolingTime: 14.5,    // s
    cycleTime: 32,        // s
    clampForce: 120,      // tonnes, estimated from projected area
    draft: 1.5,           // °
  },
} as const;

export interface ToolGeometries {
  bolster: THREE.ExtrudeGeometry;
  insert: THREE.ExtrudeGeometry;
  cavityInsert: THREE.ExtrudeGeometry;
  core: THREE.ExtrudeGeometry;
  part: THREE.ExtrudeGeometry;
  pillar: THREE.CylinderGeometry;
  bush: THREE.CylinderGeometry;
  ejector: THREE.CylinderGeometry;
  coolingRun: THREE.CylinderGeometry;
  runnerBar: THREE.CylinderGeometry;
  sprue: THREE.CylinderGeometry;
  locatingRing: THREE.ExtrudeGeometry;
  dispose(): void;
}

const cavityCentres = (): number[] => {
  const half = (TOOL.cavityCount - 1) / 2;
  return Array.from({ length: TOOL.cavityCount }, (_, i) => (i - half) * TOOL.cavityPitch * 2);
};

export const CAVITY_X = cavityCentres();

/** the bezel: a rounded frame with a moulded lip round the aperture */
const partShape = (): THREE.Shape => {
  const s = roundedRect(TOOL.part.w, TOOL.part.h, 9);
  const [aw, ah] = TOOL.part.aperture;
  s.holes.push(roundedHole(0, aw, ah, 6));
  return s;
};

/** a rounded-rect Path, centred on (cx, 0) — used for the cavity pockets */
const roundedHole = (cx: number, w: number, h: number, r: number): THREE.Path => {
  const p = new THREE.Path();
  const x = cx - w / 2;
  const y = -h / 2;
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
  return p;
};

/** one insert carrying both impressions, pocketed to the part outline plus clearance */
const cavityPocketShape = (): THREE.Shape => {
  const s = roundedRect(TOOL.insert.w, TOOL.insert.h, 8);
  for (const cx of cavityCentres()) {
    s.holes.push(roundedHole(cx, TOOL.part.w + 0.6, TOOL.part.h + 0.6, 9));
  }
  return s;
};

/** the core: a raised block that forms the inside of the bezel */
const coreShape = (): THREE.Shape => {
  const [aw, ah] = TOOL.part.aperture;
  return roundedRect(aw - 0.4, ah - 0.4, 5.6);
};

const bolsterShape = (): THREE.Shape => {
  const s = roundedRect(TOOL.bolster.w, TOOL.bolster.h, 10);
  const px = TOOL.bolster.w / 2 - TOOL.pillar.inset;
  const py = TOOL.bolster.h / 2 - TOOL.pillar.inset;
  for (const [x, y] of [[-px, -py], [px, -py], [px, py], [-px, py]] as Array<[number, number]>) {
    const p = new THREE.Path();
    p.absarc(x, y, TOOL.pillar.d / 2 + 0.4, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  return s;
};

export const buildToolGeometries = (): ToolGeometries => {
  const g: ToolGeometries = {
    bolster: extrudeUp(bolsterShape(), TOOL.bolster.t, { bevel: 1.2, curveSegments: 20 }),
    insert: extrudeUp(roundedRect(TOOL.insert.w, TOOL.insert.h, 8), TOOL.insert.t, { bevel: 0.8, curveSegments: 16 }),
    cavityInsert: extrudeUp(cavityPocketShape(), TOOL.insert.t, { bevel: 0.8, curveSegments: 16 }),
    core: extrudeUp(coreShape(), TOOL.part.depth - TOOL.part.wall, { bevel: 0.9, curveSegments: 16 }),
    part: extrudeUp(partShape(), TOOL.part.depth, { bevel: 0.7, curveSegments: 20 }),
    pillar: new THREE.CylinderGeometry(TOOL.pillar.d / 2, TOOL.pillar.d / 2, TOOL.openStroke + TOOL.bolster.t * 2, 20),
    bush: new THREE.CylinderGeometry(TOOL.pillar.d / 2 + 5, TOOL.pillar.d / 2 + 5, 16, 20),
    ejector: new THREE.CylinderGeometry(4, 4, 120, 14),
    coolingRun: new THREE.CylinderGeometry(TOOL.cooling.d / 2, TOOL.cooling.d / 2, TOOL.bolster.w - 20, 16),
    runnerBar: new THREE.CylinderGeometry(TOOL.runner.d / 2, TOOL.runner.d / 2, TOOL.cavityPitch * 2, 12),
    sprue: new THREE.CylinderGeometry(4, 7.5, TOOL.bolster.t, 16),
    locatingRing: extrudeUp(disc(48, 16), 8, { bevel: 0.6, curveSegments: 28 }),
    dispose() {
      for (const [k, v] of Object.entries(this)) {
        if (k !== 'dispose' && v && typeof (v as THREE.BufferGeometry).dispose === 'function') {
          (v as THREE.BufferGeometry).dispose();
        }
      }
    },
  };
  return g;
};

/* ------------------------------------------------------------------- cycle */

export type Stage = 'clamp' | 'fill' | 'pack' | 'cool' | 'open' | 'eject';

export interface StageSpan {
  id: Stage;
  label: string;
  from: number;
  to: number;
  note: string;
}

/**
 * The moulding cycle as a normalised timeline. The proportions are the ones a
 * 32 s cycle actually has — cooling is roughly half of it, which is the whole
 * reason cooling layout is worth analysing before the steel is cut.
 */
export const STAGES: StageSpan[] = [
  { id: 'clamp', label: 'Clamp', from: 0, to: 0.06, note: 'Halves close on the guide pillars; the parting line shuts.' },
  { id: 'fill', label: 'Fill', from: 0.06, to: 0.2, note: 'Melt runs sprue → runner → edge gates, both impressions together.' },
  { id: 'pack', label: 'Pack & hold', from: 0.2, to: 0.32, note: 'Pressure held while the gates freeze, to feed shrinkage.' },
  { id: 'cool', label: 'Cool', from: 0.32, to: 0.62, note: 'Conformal-ish channel layout pulls heat out of the core side first.' },
  { id: 'open', label: 'Open', from: 0.62, to: 0.8, note: 'Moving half retracts; the moulding stays on the core, as intended.' },
  { id: 'eject', label: 'Eject', from: 0.8, to: 1, note: 'Ejector pins push the moulding clear of the core.' },
];

export const stageAt = (t: number): StageSpan =>
  STAGES.find((s) => t >= s.from && t < s.to) ?? STAGES[STAGES.length - 1];

/** 0 → 1 progress within whichever stage `t` is in */
export const stageProgress = (t: number): number => {
  const s = stageAt(t);
  return THREE.MathUtils.clamp((t - s.from) / (s.to - s.from), 0, 1);
};

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Everything the scene needs to pose itself for a given point in the cycle. */
export const poseAt = (t: number) => {
  const s = stageAt(t);
  const p = stageProgress(t);

  let open = 0;         // 0 shut, 1 fully open
  let fill = 0;         // 0 empty, 1 packed out
  let eject = 0;        // 0 home, 1 pins fully forward
  let temp = 0;         // 1 melt-hot, 0 at mould temperature
  let partOnCore = 1;   // 1 on the core, 0 released
  let coolFlow = 0;     // cooling water animation strength

  switch (s.id) {
    case 'clamp':
      open = 1 - ease(p);
      break;
    case 'fill':
      fill = p;
      temp = 1;
      break;
    case 'pack':
      fill = 1;
      temp = 1 - p * 0.18;
      break;
    case 'cool':
      fill = 1;
      temp = 0.82 * (1 - ease(p));
      coolFlow = 1;
      break;
    case 'open':
      fill = 1;
      open = ease(p);
      coolFlow = 1 - p;
      break;
    case 'eject':
      fill = 1;
      open = 1;
      eject = ease(Math.min(p / 0.7, 1));
      partOnCore = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
      break;
  }
  return { stage: s, p, open, fill, eject, temp, partOnCore, coolFlow };
};
