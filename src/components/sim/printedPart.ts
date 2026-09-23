import * as THREE from 'three';
import { externalGearPoints, internalGearPoints, gearDims, planetarySet } from './involute';
import { disc, extrudeUp, pathFromPoints, shapeFromPoints } from './profiles';

/**
 * The part on the build plate: a 4:1 planetary reduction gearbox.
 *
 * It is modelled the way it would actually be printed — as prismatic features
 * stacked up the Z axis, each with a base height and a height of its own. The
 * scene shows the print in progress by scaling each feature between 0 and 1,
 * which is exact for a prism and gives a real flat top face at the nozzle
 * instead of the squashed whole-model scaling the previous scene used.
 *
 * Dimensions in millimetres. Total height 32 mm — 160 layers at 0.2 mm, which
 * fits the 245 × 245 × 270 mm envelope with room to spare.
 */

export const MODULE = 1.6;
export const SET = planetarySet(MODULE, 12, 12, 3);

const RING_OD = 68;
const HOUSING_H = 6;
const GEAR_H = 10;
const CARRIER_H = 4;
const SHAFT_H = 12;

export const PART_HEIGHT = HOUSING_H + GEAR_H + CARRIER_H + SHAFT_H; // 32 mm
export const LAYER_HEIGHT = 0.2;
export const LAYER_COUNT = Math.round(PART_HEIGHT / LAYER_HEIGHT); // 160

export interface Feature {
  id: string;
  /** height of this feature's underside, mm */
  baseY: number;
  /** its own height, mm */
  height: number;
  geometry: THREE.BufferGeometry;
  /** the 2D outline the nozzle traces on this feature, mm */
  outline: Array<[number, number]>;
  /** spin rate multiplier once the gearbox is driven */
  spin?: 'sun' | 'planet' | 'carrier';
  /** offset from the part centre, mm */
  offset?: [number, number];
  /** baked-in rotation, radians */
  phase?: number;
}

const ringDims = gearDims({ module: MODULE, teeth: SET.ringTeeth }, true);

/** the four mounting ears on the housing flange */
const earCentres: Array<[number, number]> = [0, 1, 2, 3].map((i) => {
  const a = Math.PI / 4 + (i * Math.PI) / 2;
  return [Math.cos(a) * (RING_OD / 2 + 5), Math.sin(a) * (RING_OD / 2 + 5)];
});

const housingShape = () => {
  const s = new THREE.Shape();
  s.absarc(0, 0, RING_OD / 2, 0, Math.PI * 2, false);
  return s;
};

const flangeShape = () => {
  const s = new THREE.Shape();
  // a rounded square flange, so the ears are part of one solid rather than blobs
  const r = RING_OD / 2 + 9;
  const k = RING_OD / 2 + 1;
  s.moveTo(k, -r + 6);
  for (let i = 0; i < 4; i++) {
    const a0 = -Math.PI / 4 + (i * Math.PI) / 2;
    const a1 = Math.PI / 4 + (i * Math.PI) / 2;
    for (let j = 0; j <= 10; j++) {
      const a = a0 + ((a1 - a0) * j) / 10;
      const rr = k + (r - k) * Math.sin(((j / 10) * Math.PI));
      s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
  }
  s.closePath();
  const bore = new THREE.Path();
  bore.absarc(0, 0, ringDims.tipRadius - 1.5, 0, Math.PI * 2, true);
  s.holes.push(bore);
  for (const [x, y] of earCentres) {
    const p = new THREE.Path();
    p.absarc(x, y, 2.6, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  return s;
};

export const buildPart = (): Feature[] => {
  const ringPts = internalGearPoints({ module: MODULE, teeth: SET.ringTeeth });
  const sunPts = externalGearPoints({ module: MODULE, teeth: SET.sunTeeth });
  const planetPts = externalGearPoints({ module: MODULE, teeth: SET.planetTeeth });

  // ring gear: the rim disc with the toothed bore cut out of it
  const ringShape = housingShape();
  ringShape.holes.push(pathFromPoints(ringPts));

  const sunShape = shapeFromPoints(sunPts);
  sunShape.holes.push(new THREE.Path().absarc(0, 0, 3.2, 0, Math.PI * 2, true) as unknown as THREE.Path);

  const planetShape = shapeFromPoints(planetPts);
  planetShape.holes.push(new THREE.Path().absarc(0, 0, 2.4, 0, Math.PI * 2, true) as unknown as THREE.Path);

  const planetGeo = extrudeUp(planetShape, GEAR_H, { bevel: 0.3, curveSegments: 20 });

  const carrierHoles = [0, 1, 2].map((i) => {
    const a = (i * 2 * Math.PI) / 3;
    return { x: Math.cos(a) * SET.centreDistance, y: Math.sin(a) * SET.centreDistance, r: 2.2 };
  });
  const carrierShape = disc(SET.centreDistance + 6, 0, carrierHoles);

  // output shaft: a D-flatted boss, the way a real printed output stub is made
  const shaftShape = new THREE.Shape();
  {
    const r = 7;
    const flat = 5.4;
    const aFlat = Math.acos(flat / r);
    shaftShape.absarc(0, 0, r, aFlat, Math.PI * 2 - aFlat, false);
    shaftShape.closePath();
    const bore = new THREE.Path();
    bore.absarc(0, 0, 2.6, 0, Math.PI * 2, true);
    shaftShape.holes.push(bore);
  }

  const features: Feature[] = [
    {
      id: 'flange',
      baseY: 0,
      height: HOUSING_H,
      geometry: extrudeUp(flangeShape(), HOUSING_H, { bevel: 0.5, curveSegments: 32 }),
      outline: [],
    },
    {
      id: 'ring',
      baseY: HOUSING_H,
      height: GEAR_H,
      geometry: extrudeUp(ringShape, GEAR_H, { bevel: 0.35, curveSegments: 40 }),
      outline: ringPts,
    },
    {
      id: 'sun',
      baseY: HOUSING_H,
      height: GEAR_H,
      geometry: extrudeUp(sunShape, GEAR_H, { bevel: 0.3, curveSegments: 20 }),
      outline: sunPts,
      spin: 'sun',
    },
    ...[0, 1, 2].map((i): Feature => {
      const a = (i * 2 * Math.PI) / 3;
      return {
        id: `planet-${i}`,
        baseY: HOUSING_H,
        height: GEAR_H,
        geometry: planetGeo, // one geometry, three instances of it
        outline: planetPts,
        spin: 'planet',
        offset: [Math.cos(a) * SET.centreDistance, Math.sin(a) * SET.centreDistance],
        phase: SET.planetPhase(i),
      };
    }),
    {
      id: 'carrier',
      baseY: HOUSING_H + GEAR_H,
      height: CARRIER_H,
      geometry: extrudeUp(carrierShape, CARRIER_H, { bevel: 0.4, curveSegments: 40 }),
      outline: circleOutline(SET.centreDistance + 6, 64),
      spin: 'carrier',
    },
    {
      id: 'shaft',
      baseY: HOUSING_H + GEAR_H + CARRIER_H,
      height: SHAFT_H,
      geometry: extrudeUp(shaftShape, SHAFT_H, { bevel: 0.4, curveSegments: 32 }),
      outline: circleOutline(7, 40),
      spin: 'carrier',
    },
  ];
  return features;
};

function circleOutline(r: number, n: number): Array<[number, number]> {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * r, Math.sin(a) * r] as [number, number];
  });
}

/** The feature being printed at a given height, and how far into it we are. */
export const featureAt = (features: Feature[], heightMm: number) => {
  let active: Feature | null = null;
  for (const f of features) {
    if (heightMm > f.baseY && heightMm <= f.baseY + f.height) {
      if (!active || f.baseY > active.baseY) active = f;
      if (f.outline.length) active = f;
    }
  }
  return active;
};
