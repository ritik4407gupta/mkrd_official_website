import * as THREE from 'three';

/**
 * 2D profiles the scenes extrude. Everything is in millimetres; the scenes
 * divide by MM (below) to get world units.
 */
export const MM = 50; // world units per metre of nothing — 1 unit = 50 mm
export const mm = (v: number) => v / MM;

/** A rounded rectangle centred on the origin. */
export const roundedRect = (w: number, h: number, r: number): THREE.Shape => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const rr = Math.min(r, w / 2, h / 2);
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rr);
  s.lineTo(x + w, y + h - rr);
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  s.lineTo(x + rr, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rr);
  s.lineTo(x, y + rr);
  s.quadraticCurveTo(x, y, x + rr, y);
  return s;
};

/**
 * The cross-section of a 20 × 20 aluminium T-slot extrusion — the profile every
 * machine frame in the building is actually built from. Four T-slots, chamfered
 * corners, centre bore. It is the detail that stops a frame reading as four grey
 * boxes.
 */
export const tslotProfile = (size = 20): THREE.Shape => {
  const h = size / 2;
  const ch = size * 0.11;   // corner chamfer
  const sw = size * 0.155;  // slot mouth half-width
  const sd = size * 0.30;   // slot depth
  const sb = size * 0.245;  // undercut half-width, wider than the mouth
  const lip = sd * 0.42;    // depth of the mouth before it opens out

  // one face, written along the bottom edge running left → right, material above
  const face: Array<[number, number]> = [
    [-h + ch, -h],
    [-sw, -h],
    [-sw, -h + lip],
    [-sb, -h + lip],
    [-sb, -h + sd],
    [sb, -h + sd],
    [sb, -h + lip],
    [sw, -h + lip],
    [sw, -h],
    [h - ch, -h],
    [h, -h + ch],
  ];

  const s = new THREE.Shape();
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    for (let i = 0; i < face.length; i++) {
      const [x, y] = face[i];
      const X = x * ca - y * sa;
      const Y = x * sa + y * ca;
      if (k === 0 && i === 0) s.moveTo(X, Y);
      else s.lineTo(X, Y);
    }
  }
  s.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, size * 0.105, 0, Math.PI * 2, true);
  s.holes.push(bore);
  return s;
};

/** Extrude a shape along +Y with its base at y = 0. */
export const extrudeUp = (
  shape: THREE.Shape | THREE.Shape[],
  height: number,
  opts: { bevel?: number; curveSegments?: number } = {},
): THREE.ExtrudeGeometry => {
  const bevel = opts.bevel ?? 0;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(height - bevel * 2, 0.0001),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: bevel > 0 ? 2 : 0,
    curveSegments: opts.curveSegments ?? 24,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  g.computeVertexNormals();
  return g;
};

/** A closed 2D outline (as [x, y] pairs) turned into a THREE.Shape. */
export const shapeFromPoints = (pts: Array<[number, number]>): THREE.Shape => {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
};

/** The same, as a THREE.Path, for use as a hole. */
export const pathFromPoints = (pts: Array<[number, number]>): THREE.Path => {
  const p = new THREE.Path();
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  p.closePath();
  return p;
};

/** A disc with an optional bore and optional extra holes, as a Shape. */
export const disc = (radius: number, bore = 0, holes: Array<{ x: number; y: number; r: number }> = []): THREE.Shape => {
  const s = new THREE.Shape();
  s.absarc(0, 0, radius, 0, Math.PI * 2, false);
  if (bore > 0) {
    const b = new THREE.Path();
    b.absarc(0, 0, bore, 0, Math.PI * 2, true);
    s.holes.push(b);
  }
  for (const h of holes) {
    const p = new THREE.Path();
    p.absarc(h.x, h.y, h.r, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  return s;
};
