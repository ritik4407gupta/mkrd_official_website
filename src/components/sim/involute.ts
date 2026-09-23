/**
 * Involute spur-gear profiles.
 *
 * The previous printer scene put a smooth TorusGeometry on the bed and called
 * it a gear. Nobody who works with gears reads that as a gear. These are the
 * real profiles — flanks generated from the involute of the base circle, with
 * a trochoidal-ish root fillet — so the part on the build plate is an actual
 * planetary set that meshes, at a real module and pressure angle.
 *
 *   involute of a circle:  x = rb(cos t + t sin t),  y = rb(sin t - t cos t)
 *
 * Everything is in millimetres. The scenes scale to world units themselves.
 */

export interface GearSpec {
  /** module, mm of pitch diameter per tooth */
  module: number;
  /** tooth count */
  teeth: number;
  /** pressure angle, radians (20° is the industry default) */
  pressureAngle?: number;
  /** addendum coefficient (×module) */
  addendum?: number;
  /** dedendum coefficient (×module) */
  dedendum?: number;
  /** points sampled along each flank */
  flankSegments?: number;
  /** circumferential backlash at the pitch circle, mm — printed gears need it */
  backlash?: number;
}

export interface GearDims {
  pitchRadius: number;
  baseRadius: number;
  tipRadius: number;
  rootRadius: number;
}

const inv = (a: number) => Math.tan(a) - a;

export const gearDims = (
  { module: m, teeth: z, pressureAngle = (20 * Math.PI) / 180, addendum = 1, dedendum = 1.25 }: GearSpec,
  internal = false,
): GearDims => {
  const pitchRadius = (m * z) / 2;
  const baseRadius = pitchRadius * Math.cos(pressureAngle);
  return internal
    ? {
        pitchRadius,
        baseRadius,
        tipRadius: pitchRadius - addendum * m, // internal teeth point inward
        rootRadius: pitchRadius + dedendum * m,
      }
    : {
        pitchRadius,
        baseRadius,
        tipRadius: pitchRadius + addendum * m,
        rootRadius: pitchRadius - dedendum * m,
      };
};

/** the involute parameter t at which the curve reaches radius r */
const tAt = (rb: number, r: number) => (r <= rb ? 0 : Math.sqrt((r * r) / (rb * rb) - 1));

/**
 * One external gear as a closed ring of [x, y] points, CCW, tooth 0 centred on +X.
 */
export const externalGearPoints = (spec: GearSpec): Array<[number, number]> => {
  const { module: m, teeth: z, pressureAngle = (20 * Math.PI) / 180, flankSegments = 10, backlash = 0.08 * m } = spec;
  const { baseRadius: rb, pitchRadius: rp, tipRadius: ra, rootRadius: rf } = gearDims(spec);

  // half the angular tooth thickness, measured at the base circle, thinned by
  // half the backlash so the flanks clear instead of interfering
  const halfBase = Math.PI / (2 * z) + inv(pressureAngle) - backlash / (4 * rp);
  const tTip = tAt(rb, ra);
  const rStart = Math.max(rb, rf);
  const tStart = tAt(rb, rStart);

  // right flank, root → tip, as (radius, polar angle from tooth centreline)
  const flank: Array<[number, number]> = [];
  for (let i = 0; i <= flankSegments; i++) {
    const t = tStart + ((tTip - tStart) * i) / flankSegments;
    const r = rb * Math.sqrt(1 + t * t);
    const theta = halfBase - (t - Math.atan(t)); // involute polar angle
    flank.push([r, theta]);
  }

  const pts: Array<[number, number]> = [];
  const push = (r: number, a: number) => pts.push([r * Math.cos(a), r * Math.sin(a)]);
  const pitch = (2 * Math.PI) / z;
  const thetaRoot = flank[0][1];               // half-angle where the flank leaves the root
  const thetaTip = flank[flank.length - 1][1]; // half-angle at the tip land
  const undercut = rStart > rf;                // the involute starts above the root circle
  const gap = pitch * 0.06;                    // angular width of the root fillet

  const arc = (r: number, a0: number, a1: number, n: number) => {
    for (let i = 0; i <= n; i++) push(r, a0 + ((a1 - a0) * i) / n);
  };
  /**
   * The root fillet. Real tooling cuts a trochoid here; this eases radially from
   * the root circle onto the start of the involute, which at this module differs
   * by well under one printed layer.  `dir` +1 runs root→flank, -1 flank→root.
   */
  const fillet = (c: number, side: number, dir: number) => {
    if (!undercut) return;
    for (let i = 0; i <= 4; i++) {
      const u = dir > 0 ? i / 4 : 1 - i / 4;
      const r = rf + (rStart - rf) * u;
      push(r, c + side * (thetaRoot + gap * (1 - u) * (1 - u)));
    }
  };

  for (let k = 0; k < z; k++) {
    const c = k * pitch;
    arc(rf, c - pitch / 2, c - thetaRoot - gap, 3);                                  // root land in
    fillet(c, -1, 1);                                                                // fillet up
    for (let i = 0; i < flank.length; i++) push(flank[i][0], c - flank[i][1]);       // left flank, root → tip
    arc(ra, c - thetaTip, c + thetaTip, 3);                                          // tip land
    for (let i = flank.length - 1; i >= 0; i--) push(flank[i][0], c + flank[i][1]);  // right flank, tip → root
    fillet(c, 1, -1);                                                                // fillet down
    arc(rf, c + thetaRoot + gap, c + pitch / 2, 3);                                  // root land out
  }
  void rp;
  return pts;
};

/**
 * The internal (ring) tooth profile, as a closed ring of points, CW so it can be
 * used directly as a hole in a THREE.Shape. Teeth point inward from the rim.
 */
export const internalGearPoints = (spec: GearSpec): Array<[number, number]> => {
  const { teeth: z, pressureAngle = (20 * Math.PI) / 180, flankSegments = 10 } = spec;
  const { baseRadius: rb, tipRadius: ra, rootRadius: rf } = gearDims(spec, true);

  // for an internal gear the SPACE carries the pitch-circle thickness
  const halfBase = Math.PI / (2 * z) - inv(pressureAngle);
  const tRoot = tAt(rb, rf);
  const rTipStart = Math.max(rb, ra);
  const tTip = tAt(rb, rTipStart);

  const flank: Array<[number, number]> = [];
  for (let i = 0; i <= flankSegments; i++) {
    const t = tTip + ((tRoot - tTip) * i) / flankSegments;
    const r = rb * Math.sqrt(1 + t * t);
    const theta = halfBase + (t - Math.atan(t));
    flank.push([r, theta]);
  }

  const pts: Array<[number, number]> = [];
  const push = (r: number, a: number) => pts.push([r * Math.cos(a), r * Math.sin(a)]);
  const pitch = (2 * Math.PI) / z;

  for (let k = 0; k < z; k++) {
    const c = k * pitch;
    for (let i = 0; i <= 3; i++) {
      const a = flank[0][1];
      push(ra, c - a + (2 * a * i) / 3); // inward-pointing tip land
    }
    for (let i = 0; i < flank.length; i++) push(flank[i][0], c + flank[i][1]);
    const rootHalf = pitch / 2 - flank[flank.length - 1][1];
    for (let i = 0; i <= 3; i++) push(rf, c + flank[flank.length - 1][1] + (rootHalf * 2 * i) / 3);
    for (let i = flank.length - 1; i >= 0; i--) push(flank[i][0], c + pitch - flank[i][1]);
  }
  return pts;
};

/**
 * Planetary set sizing. Ring teeth must equal sun + 2×planet for the centres to
 * line up, and (sun + ring) must divide by the planet count for the planets to
 * sit at equal spacing and still mesh.
 */
export const planetarySet = (module: number, sunTeeth: number, planetTeeth: number, planetCount: number) => {
  const ringTeeth = sunTeeth + 2 * planetTeeth;
  const centreDistance = (module * (sunTeeth + planetTeeth)) / 2;
  const spacingOk = (sunTeeth + ringTeeth) % planetCount === 0;
  const ratio = 1 + ringTeeth / sunTeeth; // ring held, sun in, carrier out
  /**
   * The rotation each planet needs so its flanks mesh instead of clashing —
   * a tooth of the planet has to sit in a space of the sun on the line of
   * centres. Solved numerically against the generated profiles, then reduced
   * to this closed form.
   */
  const planetPhase = (i: number) => {
    const psi = (i * 2 * Math.PI) / planetCount;
    return -(sunTeeth / planetTeeth) * psi + Math.PI / planetTeeth;
  };
  /** carrier speed for a given sun speed, with the ring held */
  const carrierRate = sunTeeth / (sunTeeth + ringTeeth);
  /** absolute planet spin for a given sun speed, with the ring held */
  const planetRate = (1 - carrierRate) * -(sunTeeth / planetTeeth) + carrierRate;
  return {
    module, sunTeeth, planetTeeth, ringTeeth, planetCount,
    centreDistance, spacingOk, ratio, planetPhase, carrierRate, planetRate,
  };
};
