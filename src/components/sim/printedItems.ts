import * as THREE from 'three';
import { externalGearPoints, internalGearPoints, gearDims, planetarySet } from './involute';
import { disc, extrudeUp, pathFromPoints, roundedRect, shapeFromPoints } from './profiles';

/**
 * The parts gallery — things this shop actually prints.
 *
 * This gallery only holds parts that come off our own machines — a gearbox, a
 * drag chain, a damping foot, a locating jig and a resin impeller. Five jobs
 * you buy a 245 × 245 × 270 mm wire printer and a resin vat to do. The tooling
 * side of MKRD is a separate site; this one is about what gets printed.
 *
 * Every one is generated from its real engineering geometry rather than
 * downloaded: the gear teeth are involutes, the chain links actually articulate
 * on their pin centres, the spring is a real helix. Nothing here is stock, and
 * nothing here needs a photograph to exist.
 *
 * Millimetres throughout.
 */

export interface PartPiece {
  geometry: THREE.BufferGeometry;
  /** position in mm, y up */
  position: [number, number, number];
  rotation?: [number, number, number];
  /** override the part's material colour, e.g. hardware or a second filament */
  accent?: boolean;
}

export interface PrintedItem {
  id: string;
  name: string;
  use: string;
  /** what it replaces or why it is printed rather than bought */
  why: string;
  material: string;
  /** filament colour on screen */
  color: string;
  roughness: number;
  sizeMm: string;
  layerMm: number;
  printHours: number;
  /** how tall the whole thing stands, for camera framing */
  heightMm: number;
  /** widest dimension, for camera framing */
  spanMm: number;
  build: () => PartPiece[];
  /** slowly rotate a sub-assembly, keyed by piece index */
  animate?: (pieces: THREE.Object3D[], t: number) => void;
}

/* ----------------------------------------------------- 1. planetary gearbox */

const GB_MODULE = 2.0;
const GB = planetarySet(GB_MODULE, 12, 12, 3);
const GB_RING_OD = 88;
const GB_PLATE = 7;
const GB_GEAR = 12;

const gearboxPieces = (): PartPiece[] => {
  const ringPts = internalGearPoints({ module: GB_MODULE, teeth: GB.ringTeeth });
  const sunPts = externalGearPoints({ module: GB_MODULE, teeth: GB.sunTeeth });
  const planetPts = externalGearPoints({ module: GB_MODULE, teeth: GB.planetTeeth });
  const ringD = gearDims({ module: GB_MODULE, teeth: GB.ringTeeth }, true);

  const housing = new THREE.Shape();
  housing.absarc(0, 0, GB_RING_OD / 2, 0, Math.PI * 2, false);
  housing.holes.push(pathFromPoints(ringPts));

  const base = disc(GB_RING_OD / 2 + 8, 0, [0, 1, 2, 3].map((i) => {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    return { x: Math.cos(a) * (GB_RING_OD / 2 + 4), y: Math.sin(a) * (GB_RING_OD / 2 + 4), r: 2.8 };
  }));

  const sun = shapeFromPoints(sunPts);
  sun.holes.push(pathFromPoints(circle(4, 24)));
  const planet = shapeFromPoints(planetPts);
  planet.holes.push(pathFromPoints(circle(3, 20)));

  // The carrier is a three-arm spider rather than a solid disc: it is how a
  // printed carrier is actually made (less material, far less warp on a wide
  // flat top layer), and it leaves the gear train visible underneath.
  const carrierHub = disc(11, 3.4);
  const carrierArm = roundedRect(GB.centreDistance, 11, 4);
  const carrierBoss = disc(8, 3.2);

  const shaft = disc(8, 3.2);

  const planetGeo = extrudeUp(planet, GB_GEAR, { bevel: 0.4, curveSegments: 22 });
  const pieces: PartPiece[] = [
    { geometry: extrudeUp(base, GB_PLATE, { bevel: 0.6, curveSegments: 40 }), position: [0, 0, 0] },
    { geometry: extrudeUp(housing, GB_GEAR, { bevel: 0.45, curveSegments: 44 }), position: [0, GB_PLATE, 0] },
    { geometry: extrudeUp(sun, GB_GEAR, { bevel: 0.4, curveSegments: 22 }), position: [0, GB_PLATE, 0] },
  ];
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    pieces.push({
      geometry: planetGeo,
      position: [Math.cos(a) * GB.centreDistance, GB_PLATE, -Math.sin(a) * GB.centreDistance],
      rotation: [0, GB.planetPhase(i), 0],
      accent: true,
    });
  }
  const carrierY = GB_PLATE + GB_GEAR + 1.5;
  const hubGeo = extrudeUp(carrierHub, 5, { bevel: 0.5, curveSegments: 32 });
  const armGeo = extrudeUp(carrierArm, 5, { bevel: 0.5, curveSegments: 12 });
  const bossGeo = extrudeUp(carrierBoss, 5, { bevel: 0.5, curveSegments: 24 });
  pieces.push({ geometry: hubGeo, position: [0, carrierY, 0] });
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    pieces.push({
      geometry: armGeo,
      position: [(Math.cos(a) * GB.centreDistance) / 2, carrierY, (-Math.sin(a) * GB.centreDistance) / 2],
      rotation: [0, a, 0],
    });
    pieces.push({
      geometry: bossGeo,
      position: [Math.cos(a) * GB.centreDistance, carrierY, -Math.sin(a) * GB.centreDistance],
    });
  }
  pieces.push({
    geometry: extrudeUp(shaft, 16, { bevel: 0.5, curveSegments: 28 }),
    position: [0, carrierY + 5, 0],
    accent: true,
  });
  void ringD;
  return pieces;
};

/* ------------------------------------------------------- 2. cable drag chain */

const DC_PITCH = 26;
const DC_WIDTH = 30;
const DC_PLATE = 3.5;
const DC_HEIGHT = 20;
const DC_LINKS = 7;

const dragChainPieces = (): PartPiece[] => {
  // a side plate: a rounded slab with a pin boss at one end and a slot at the other
  const plate = new THREE.Shape();
  const r = DC_HEIGHT / 2;
  plate.absarc(0, 0, r, Math.PI / 2, -Math.PI / 2, true);
  plate.lineTo(DC_PITCH, -r);
  plate.absarc(DC_PITCH, 0, r, -Math.PI / 2, Math.PI / 2, true);
  plate.closePath();
  plate.holes.push(pathFromPoints(circle(3.6, 18)));
  plate.holes.push(pathFromPoints(circle(3.6, 18, DC_PITCH, 0)));

  const plateGeo = extrudeUp(plate, DC_PLATE, { bevel: 0.5, curveSegments: 22 });
  const barGeo = extrudeUp(roundedRect(DC_WIDTH - DC_PLATE * 2 + 1, 7, 2), 3, { bevel: 0.4 });
  const pinGeo = extrudeUp(disc(3.2), DC_WIDTH + 2, { bevel: 0.4, curveSegments: 20 });

  const pieces: PartPiece[] = [];
  // the run curves: straight for a while, then bends over its radius
  let x = -DC_PITCH * 3;
  let y = 0;
  let ang = 0;
  for (let i = 0; i < DC_LINKS; i++) {
    const bend = i >= 4 ? -0.42 : 0;
    ang += bend;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    for (const z of [-(DC_WIDTH / 2), DC_WIDTH / 2 - DC_PLATE]) {
      pieces.push({ geometry: plateGeo, position: [x, y, z], rotation: [0, 0, ang] });
    }
    pieces.push({
      geometry: barGeo,
      position: [x + (DC_PITCH / 2) * c, y + (DC_PITCH / 2) * s + DC_HEIGHT / 2 - 1, -DC_WIDTH / 2 + DC_PLATE - 0.5],
      rotation: [0, 0, ang],
      accent: true,
    });
    pieces.push({
      geometry: pinGeo,
      position: [x, y, -(DC_WIDTH / 2) - 1],
      rotation: [Math.PI / 2, 0, 0],
      accent: true,
    });
    x += DC_PITCH * c;
    y += DC_PITCH * s;
  }
  return pieces;
};

/* --------------------------------------------------- 3. damping machine foot */

const damperPieces = (): PartPiece[] => {
  const baseGeo = extrudeUp(disc(34, 0, [0, 1, 2].map((i) => {
    const a = (i * 2 * Math.PI) / 3 + Math.PI / 6;
    return { x: Math.cos(a) * 26, y: Math.sin(a) * 26, r: 3.4 };
  })), 6, { bevel: 0.7, curveSegments: 40 });
  const capGeo = extrudeUp(disc(24, 7), 8, { bevel: 0.8, curveSegments: 36 });

  // the compliant element: a real helix, swept as a tube
  const turns = 4.5;
  const height = 44;
  const radius = 17;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 240; i++) {
    const u = i / 240;
    const a = u * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 6 + u * height, Math.sin(a) * radius));
  }
  const spring = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 260, 3.4, 10, false);

  return [
    { geometry: baseGeo, position: [0, 0, 0] },
    { geometry: spring, position: [0, 0, 0], accent: true },
    { geometry: capGeo, position: [0, 6 + height - 2, 0] },
  ];
};

/* ------------------------------------------------ 4. resin impeller rotor */

const impellerPieces = (): PartPiece[] => {
  const HUB_R = 9;
  const HUB_H = 20;
  const TIP_R = 33;
  const BLADES = 7;

  // Open-face impeller: no shroud. A closed face would need the cover to follow
  // the blade tips, which fall away outboard — a flat ring hovering over them
  // reads as a mistake, and the open form shows the blade sweep anyway.
  const hub = extrudeUp(disc(HUB_R, 3), HUB_H, { bevel: 0.6, curveSegments: 40 });
  const backplate = extrudeUp(disc(TIP_R + 2, 0), 3, { bevel: 0.6, curveSegments: 64 });

  // one blade: a thin aerofoil section swept along a curve that climbs and
  // wraps as it goes outboard. ExtrudeGeometry orients the section along the
  // path on its own, so the twist comes out of the geometry rather than being
  // faked with a rotation.
  const section = new THREE.Shape();
  {
    const chord = 13;
    const thick = 1.9;
    const n = 22;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = (u - 0.5) * chord;
      const y = (thick / 2) * Math.sin(Math.PI * u) * (1 - 0.35 * u);
      if (i === 0) section.moveTo(x, y); else section.lineTo(x, y);
    }
    for (let i = n; i >= 0; i--) {
      const u = i / n;
      const x = (u - 0.5) * chord;
      const y = -(thick / 2) * Math.sin(Math.PI * u) * (1 - 0.35 * u) * 0.55;
      section.lineTo(x, y);
    }
    section.closePath();
  }

  const path: THREE.Vector3[] = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const r = HUB_R - 1 + (TIP_R - HUB_R + 1) * u;
    const wrap = u * 0.95;                       // the blade wraps as it goes out
    const rise = 3 + (HUB_H - 8) * (1 - u) * 0.9; // and drops toward the tip
    path.push(new THREE.Vector3(Math.cos(wrap) * r, rise, Math.sin(wrap) * r));
  }
  const blade = new THREE.ExtrudeGeometry(section, {
    steps: 44,
    bevelEnabled: false,
    extrudePath: new THREE.CatmullRomCurve3(path),
  });
  blade.computeVertexNormals();

  const pieces: PartPiece[] = [
    { geometry: backplate, position: [0, 0, 0] },
    { geometry: hub, position: [0, 3, 0] },
  ];
  for (let i = 0; i < BLADES; i++) {
    pieces.push({
      geometry: blade,
      position: [0, 3, 0],
      rotation: [0, (i * Math.PI * 2) / BLADES, 0],
      accent: true,
    });
  }
  return pieces;
};

/* -------------------------------------------------------- 5. locating jig */

const jigPieces = (): PartPiece[] => {
  const W = 150;
  const H = 96;
  const plate = roundedRect(W, H, 8);
  // the nest the component drops into
  const nest = new THREE.Path();
  const nw = 74;
  const nh = 44;
  const nr = 7;
  nest.moveTo(-nw / 2 + nr, -nh / 2);
  nest.lineTo(nw / 2 - nr, -nh / 2);
  nest.quadraticCurveTo(nw / 2, -nh / 2, nw / 2, -nh / 2 + nr);
  nest.lineTo(nw / 2, nh / 2 - nr);
  nest.quadraticCurveTo(nw / 2, nh / 2, nw / 2 - nr, nh / 2);
  nest.lineTo(-nw / 2 + nr, nh / 2);
  nest.quadraticCurveTo(-nw / 2, nh / 2, -nw / 2, nh / 2 - nr);
  nest.lineTo(-nw / 2, -nh / 2 + nr);
  nest.quadraticCurveTo(-nw / 2, -nh / 2, -nw / 2 + nr, -nh / 2);
  plate.holes.push(nest);
  // clamp slots and fixing holes
  for (const sx of [-1, 1]) {
    plate.holes.push(pathFromPoints(circle(4, 20, sx * (W / 2 - 12), H / 2 - 12)));
    plate.holes.push(pathFromPoints(circle(4, 20, sx * (W / 2 - 12), -(H / 2 - 12))));
  }

  const plateGeo = extrudeUp(plate, 10, { bevel: 0.8, curveSegments: 30 });
  const dowelGeo = extrudeUp(disc(5), 16, { bevel: 0.6, curveSegments: 24 });
  const restGeo = extrudeUp(roundedRect(16, 10, 2.5), 6, { bevel: 0.5 });

  const pieces: PartPiece[] = [{ geometry: plateGeo, position: [0, 0, 0] }];
  for (const [dx, dz] of [[-52, 0], [52, 0]] as Array<[number, number]>) {
    pieces.push({ geometry: dowelGeo, position: [dx, 10, dz], accent: true });
  }
  for (const [dx, dz] of [[-28, 30], [28, 30], [-28, -30], [28, -30]] as Array<[number, number]>) {
    pieces.push({ geometry: restGeo, position: [dx, 10, dz] });
  }
  return pieces;
};

/* ------------------------------------------------------------------ helper */

function circle(r: number, n: number, cx = 0, cy = 0): Array<[number, number]> {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number];
  });
}

/* ------------------------------------------------------------------- items */

export const PRINTED_ITEMS: PrintedItem[] = [
  {
    id: 'gearbox',
    name: '4:1 Planetary Gearbox',
    use: 'Reduction stage for a low-load actuator or a hand-cranked test rig.',
    why:
      'Twelve involute teeth on the sun, twelve on each planet, thirty-six in the ring — the ratio in the name is the one the tooth counts give. Printed in one build with the clearances set for a printed fit, not a machined one.',
    material: 'Carbon-Filled Nylon',
    // a true carbon black vanishes against the page's own ink, so this is the
    // same filament read one stop up — still matte, still unmistakably CF nylon
    color: '#262A3E',
    roughness: 0.9,
    sizeMm: 'Ø104 × 40 mm',
    layerMm: 0.2,
    printHours: 11,
    heightMm: 40,
    spanMm: 104,
    build: gearboxPieces,
    animate: (pieces, t) => {
      // sun drives, carrier and output shaft follow at the real ratio
      const sun = pieces[2];
      if (sun) sun.rotation.y = t * 0.9;
      for (let i = 0; i < 3; i++) {
        const pl = pieces[3 + i];
        if (!pl) continue;
        const psi = (i * 2 * Math.PI) / 3 + t * 0.9 * GB.carrierRate;
        pl.position.x = Math.cos(psi) * GB.centreDistance;
        pl.position.z = -Math.sin(psi) * GB.centreDistance;
        pl.rotation.y = GB.planetPhase(i) + t * 0.9 * GB.planetRate;
      }
      // hub (6), then arm/boss pairs (7-12), then the output shaft (13) — the
      // whole carrier assembly turns together at the carrier rate
      const rate = t * 0.9 * GB.carrierRate;
      for (let i = 6; i <= 13; i++) {
        const piece = pieces[i];
        if (!piece) continue;
        if (i === 6 || i === 13) { piece.rotation.y = rate; continue; }
        const isArm = (i - 7) % 2 === 0;
        const idx = Math.floor((i - 7) / 2);
        const a = (idx * 2 * Math.PI) / 3 + rate;
        const rad = isArm ? GB.centreDistance / 2 : GB.centreDistance;
        piece.position.x = Math.cos(a) * rad;
        piece.position.z = -Math.sin(a) * rad;
        if (isArm) piece.rotation.y = a;
      }
    },
  },
  {
    id: 'dragchain',
    name: 'Cable Drag Chain',
    use: 'Carries power and signal cable along a moving axis without letting it snag or fatigue.',
    why:
      'The commercial part comes in a fixed width and a fixed bend radius, on a lead time. Printed, it is whatever width the cable bundle actually is, and a replacement link is an hour away.',
    material: 'PETG',
    color: '#6E7BD9',
    roughness: 0.3,
    sizeMm: '7 links · 26 mm pitch · 30 mm wide',
    layerMm: 0.2,
    printHours: 6,
    heightMm: 60,
    spanMm: 190,
    build: dragChainPieces,
  },
  {
    id: 'damper',
    name: 'Vibration-Damping Foot',
    use: 'Sits under a compressor, pump or bench machine to keep it off the floor slab.',
    why:
      'A real helical spring printed in flexible TPU, so the stiffness is set by the geometry and can be tuned in the model rather than ordered from a catalogue.',
    material: 'TPU (Flexible)',
    color: '#C4161C',
    roughness: 0.74,
    sizeMm: 'Ø68 × 56 mm',
    layerMm: 0.2,
    printHours: 8,
    heightMm: 56,
    spanMm: 68,
    build: damperPieces,
    animate: (pieces, t) => {
      // it is a spring, so let it breathe under load
      const squash = 1 - 0.05 * (0.5 + 0.5 * Math.sin(t * 1.6));
      const spring = pieces[1];
      const cap = pieces[2];
      if (spring) spring.scale.y = squash;
      if (cap) cap.position.y = (6 + 44 - 2) * squash;
    },
  },
  {
    id: 'impeller',
    name: 'Pump Impeller Rotor',
    use: 'A closed-face impeller for a small pump or blower, printed to test a flow profile before anything is cast.',
    why:
      'This is the liquid printer\'s job, not the wire one. Seven blades at 1.9 mm thickness, each one swept and twisted from hub to tip — a 0.4 mm nozzle cannot resolve a section that thin with that much curvature, and resin can.',
    material: 'Tough / ABS-Like Resin',
    // a near-white resin blows out under the studio softbox and the bloom picks
    // up the rim; this is the same grey resin one stop down
    color: '#AEB4DE',
    roughness: 0.36,
    sizeMm: 'Ø70 × 24 mm',
    layerMm: 0.05,
    printHours: 5,
    heightMm: 24,
    spanMm: 70,
    build: impellerPieces,
    animate: (pieces, t) => {
      // it is a rotor, so spin the blades and the hub together
      for (let i = 1; i <= 8; i++) {
        const piece = pieces[i];
        if (!piece) continue;
        const base = i === 1 ? 0 : ((i - 2) * Math.PI * 2) / 7;
        piece.rotation.y = base + t * 1.5;
      }
    },
  },
  {
    id: 'jig',
    name: 'Locating & Inspection Jig',
    use: 'Holds a component in a repeatable position for marking out, pad printing or a dimensional check.',
    why:
      'The nest is cut from the component model itself, so the fixture matches the part exactly. When the part revises, the jig is reprinted overnight instead of remade.',
    material: 'PLA+ (Engineering Grade)',
    color: '#E4E2F2',
    roughness: 0.42,
    sizeMm: '150 × 96 × 26 mm',
    layerMm: 0.2,
    printHours: 9,
    heightMm: 26,
    spanMm: 150,
    build: jigPieces,
  },
];
