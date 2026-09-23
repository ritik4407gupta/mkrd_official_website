import * as THREE from 'three';
import { BRAND } from './palette';

export interface PrintUniforms {
  uLayer: { value: number };
  uPrintY: { value: number };
  uHeat: { value: number };
  uHot: { value: THREE.Color };
}

/**
 * The material the printed part is shaded with.
 *
 * Two things stop a printed part reading as a moulded one: the layer lines, and
 * the fact that the layer currently being laid down is still molten. Both are
 * done in the shader rather than with a texture, so they cost nothing to
 * download and stay sharp at any zoom.
 *
 * The layer banding uses fwidth to fade itself out once a layer is thinner than
 * a pixel — without that, 160 bands on a 32 mm part moirés into noise the
 * moment the camera pulls back.
 */
export const makePrintMaterial = (color: string, layerWorld: number) => {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.62,
    metalness: 0.06,
    envMapIntensity: 0.85,
  });

  const uniforms: PrintUniforms = {
    uLayer: { value: layerWorld },
    uPrintY: { value: 0 },
    uHeat: { value: 1 },
    uHot: { value: new THREE.Color(BRAND.hot) },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPrintPos;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvPrintPos = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vPrintPos;
         uniform float uLayer;
         uniform float uPrintY;
         uniform float uHeat;
         uniform vec3 uHot;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         {
           float t = vPrintPos.y / uLayer;
           float w = max(fwidth(t), 1e-4);
           float lay = fract(t);
           float edge = clamp(w * 1.6, 0.02, 0.5);
           float line = smoothstep(0.0, edge, lay) * smoothstep(1.0, 1.0 - edge, lay);
           float visible = 1.0 - smoothstep(0.30, 0.85, w);   // fade out below a pixel per layer
           diffuseColor.rgb *= mix(1.0, 0.80 + 0.20 * line, visible);
         }`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         {
           float lay = fract(vPrintPos.y / uLayer);
           roughnessFactor = clamp(roughnessFactor + 0.16 * (0.5 - abs(lay - 0.5)), 0.05, 1.0);
         }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         {
           float d = abs(vPrintPos.y - uPrintY);
           float band = uLayer * 5.0;
           float heat = 1.0 - smoothstep(0.0, band, d);
           totalEmissiveRadiance += uHot * heat * heat * 2.6 * uHeat;
         }`,
      );
  };
  // force a fresh program when the colour changes between materials
  material.customProgramCacheKey = () => 'mkrd-print-v1';

  return { material, uniforms };
};
