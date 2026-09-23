import * as THREE from 'three';
import { BRAND } from './palette';

export interface MeltUniforms {
  uGate: { value: THREE.Vector3 };
  uFront: { value: number };
  uMaxD: { value: number };
  uTemp: { value: number };
  uFlow: { value: number };
  uHot: { value: THREE.Color };
}

/**
 * The moulding's material.
 *
 * Fill is done as a radial front from the gate in OBJECT space, not world
 * space, so the mirrored second impression shares one material and one set of
 * uniforms — its scale.x of -1 leaves object coordinates untouched.
 *
 * Two display modes: as-moulded, and a fill-time contour plot. The plot is the
 * blue → red ramp any flow package produces, because that is the picture a tool
 * engineer is used to reading, and reading it is the point — short shots, weld
 * lines and unbalanced runners are all visible in where the bands land.
 */
export const makeMeltMaterial = (color: string, maxD: number) => {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.34,
    metalness: 0.08,
    envMapIntensity: 1.1,
  });

  const uniforms: MeltUniforms = {
    uGate: { value: new THREE.Vector3() },
    uFront: { value: 0 },
    uMaxD: { value: maxD },
    uTemp: { value: 0 },
    uFlow: { value: 0 },
    uHot: { value: new THREE.Color('#FF7A2F') },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMeltObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMeltObj = position;');

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vMeltObj;
         uniform vec3 uGate;
         uniform float uFront;
         uniform float uMaxD;
         uniform float uTemp;
         uniform float uFlow;
         uniform vec3 uHot;

         // the fill-time ramp every flow package draws: blue is first, red is last
         vec3 fillRamp(float x) {
           x = clamp(x, 0.0, 1.0);
           vec3 c0 = vec3(0.055, 0.180, 0.780);
           vec3 c1 = vec3(0.090, 0.640, 0.860);
           vec3 c2 = vec3(0.180, 0.780, 0.420);
           vec3 c3 = vec3(0.950, 0.780, 0.120);
           vec3 c4 = vec3(0.880, 0.070, 0.070);
           if (x < 0.25) return mix(c0, c1, x / 0.25);
           if (x < 0.50) return mix(c1, c2, (x - 0.25) / 0.25);
           if (x < 0.75) return mix(c2, c3, (x - 0.50) / 0.25);
           return mix(c3, c4, (x - 0.75) / 0.25);
         }`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
         float meltD = distance(vMeltObj, uGate);
         if (meltD > uFront) discard;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         {
           float x = clamp(meltD / max(uMaxD, 1e-4), 0.0, 1.0);
           vec3 plot = fillRamp(x);
           // banded contours, so the plot reads as isochrones rather than a smear
           float band = abs(fract(x * 9.0) - 0.5) * 2.0;
           plot *= 0.80 + 0.20 * smoothstep(0.12, 0.34, band);
           diffuseColor.rgb = mix(diffuseColor.rgb, plot, uFlow);
           // still-hot polymer glows through its own colour
           diffuseColor.rgb = mix(diffuseColor.rgb, uHot, uTemp * 0.35 * (1.0 - uFlow * 0.6));
         }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         {
           float lead = 1.0 - smoothstep(0.0, uMaxD * 0.08, uFront - meltD);
           totalEmissiveRadiance += uHot * lead * 2.4;
           totalEmissiveRadiance += uHot * uTemp * 0.55;
         }`,
      );
  };
  material.customProgramCacheKey = () => 'mkrd-melt-v1';

  return { material, uniforms };
};

/** The runner and sprue share the melt shading, minus the contour plot. */
export const makeRunnerMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: BRAND.hot,
    roughness: 0.3,
    metalness: 0.05,
    emissive: new THREE.Color(BRAND.hot),
    emissiveIntensity: 0.55,
  });
