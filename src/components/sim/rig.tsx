import React from 'react';
import * as THREE from 'three';
import { Environment, Lightformer, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing';
import { BRAND } from './palette';

/**
 * The lighting and post rig both simulation scenes share.
 *
 * The old scenes lit everything with two coloured directional lights and no
 * environment, which is why the metal read as plastic — a MeshStandardMaterial
 * with metalness 0.95 and nothing to reflect renders almost black. The fix is an
 * environment map, and the one thing it must not do is fetch a multi-megabyte
 * HDRI from someone else's CDN at runtime (the previous build did exactly that).
 *
 * So the environment is built in-scene from emissive planes — drei renders the
 * <Lightformer> children to a local cube target once. Studio softboxes,
 * essentially, in the brand's own colours. Nothing leaves the bundle.
 */
export const StudioEnvironment = ({ intensity = 1 }: { intensity?: number }) => (
  <Environment resolution={256} frames={1}>
    {/* overhead softbox — the main source of the specular streak along machined edges */}
    <Lightformer
      form="rect"
      intensity={3.2 * intensity}
      color="#EFEDFF"
      position={[0, 6, 1]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[9, 5, 1]}
    />
    {/* cool wrap from the left, the brand indigo */}
    <Lightformer
      form="rect"
      intensity={1.5 * intensity}
      color={BRAND.lift}
      position={[-6, 2, 2]}
      rotation={[0, Math.PI / 2, 0]}
      scale={[7, 5, 1]}
    />
    {/* the red kicker, from behind — this is the one that draws the silhouette */}
    <Lightformer
      form="rect"
      intensity={1.1 * intensity}
      color={BRAND.accent}
      position={[4.5, 1.6, -5]}
      rotation={[0, Math.PI, 0]}
      scale={[6, 3, 1]}
    />
    {/* floor bounce, so undersides are not solid black */}
    <Lightformer
      form="rect"
      intensity={0.45 * intensity}
      color={BRAND.deep}
      position={[0, -3, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      scale={[10, 10, 1]}
    />
  </Environment>
);

/** Key / fill / rim, matched to the environment above. */
export const StudioLights = ({ shadows = true, key: _k, intensity = 1 }: { shadows?: boolean; key?: string; intensity?: number }) => (
  <>
    <ambientLight intensity={0.5 * intensity} color={BRAND.lift} />
    <directionalLight
      position={[5.5, 8, 4]}
      intensity={1.45 * intensity}
      color="#F4F3FF"
      castShadow={shadows}
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0008}
      shadow-normalBias={0.02}
    >
      <orthographicCamera attach="shadow-camera" args={[-7, 7, 7, -7, 0.5, 30]} />
    </directionalLight>
    <directionalLight position={[-6, 3, -3]} intensity={0.7 * intensity} color={BRAND.lift} />
    <pointLight position={[3, 1.2, -4]} intensity={12} distance={12} decay={2} color={BRAND.accent} />
  </>
);

/**
 * Post chain. Bloom is thresholded high so it only touches genuinely emissive
 * surfaces (the hot layer, the melt front, the status LEDs) rather than
 * fogging the whole frame — the usual reason a WebGL scene looks amateur.
 */
export const SimPost = ({ ao = true, reduced = false }: { ao?: boolean; reduced?: boolean }) => {
  // multisampling inside the composer rather than an SMAA pass: SMAA ships two
  // base64 lookup textures that add ~90 kB gzipped to a route the visitor opted
  // into, and MSAA on the composer's own render target looks the same here.
  if (reduced) {
    return (
      <EffectComposer multisampling={4}>
        <Vignette offset={0.3} darkness={0.6} eskil={false} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      {ao ? (
        <N8AO aoRadius={0.55} intensity={2.4} distanceFalloff={0.8} halfRes color={BRAND.inkDeep} />
      ) : (
        <></>
      )}
      <Bloom mipmapBlur intensity={0.62} luminanceThreshold={0.78} luminanceSmoothing={0.22} radius={0.7} />
      <Vignette offset={0.34} darkness={0.48} eskil={false} />
    </EffectComposer>
  );
};

/** The soft grounding shadow under a machine. Cheap, and it sells the contact. */
export const Ground = ({ y = 0, scale = 14, opacity = 0.62 }: { y?: number; scale?: number; opacity?: number }) => (
  <ContactShadows position={[0, y + 0.001, 0]} opacity={opacity} scale={scale} blur={2.4} far={6} resolution={512} color={BRAND.inkDeep} />
);

/**
 * A machined-metal material. Anisotropic-looking without an anisotropy map,
 * because the environment above supplies a long horizontal source.
 */
export const machined = (color: string, roughness = 0.28, metalness = 0.94) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, envMapIntensity: 1.15 });
