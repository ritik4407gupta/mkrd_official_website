import React, { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './tokens';

/**
 * An image that gains parallax depth under the cursor.
 *
 * A depth map is derived from the photograph itself: the image is drawn small,
 * converted to luminance and box-blurred a few times. On machine and tooling
 * photography that is a serviceable proxy for depth — lit metal is near, the
 * shop floor behind it falls away — and it costs one canvas pass at hover time
 * instead of an authored depth pass per asset.
 *
 * The fragment shader then pushes UVs along the pointer, scaled by depth, so
 * near pixels travel further than far ones. That is real displacement, not a
 * CSS tilt: the parallax is *inside* the picture.
 *
 * Cost discipline: the plain <img> is what renders and what search engines and
 * screen readers see. The GL context is created on pointerenter and destroyed
 * shortly after leave, so a page of these costs nothing until touched, and the
 * browser's context limit is never approached. Reduced motion skips it all.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2 uMouse;
uniform float uAmount;
varying vec2 vUv;

void main() {
  float d = texture2D(uDepth, vec2(vUv.x, 1.0 - vUv.y)).r;
  float rel = (d - 0.5) * 2.0;
  vec2 uv = vUv + uMouse * rel * 0.05 * uAmount;
  uv = clamp(uv, 0.002, 0.998);
  vec3 col = texture2D(uImage, vec2(uv.x, 1.0 - uv.y)).rgb;

  // lift the near plane slightly and cool the shadows into the brand range
  col *= 1.0 + rel * 0.12 * uAmount;
  col = mix(col, col * vec3(0.74, 0.72, 1.16), 0.2);
  gl_FragColor = vec4(col, 1.0);
}`;

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
};

/** Small, blurred luminance map — our stand-in for an authored depth pass. */
const buildDepthMap = (img: HTMLImageElement, w = 96): ImageData | null => {
  const h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);

  let data: ImageData;
  try {
    data = ctx.getImageData(0, 0, w, h);
  } catch {
    return null; // tainted canvas — bail rather than throw
  }

  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    lum[i] = (data.data[p] * 0.2126 + data.data[p + 1] * 0.7152 + data.data[p + 2] * 0.0722) / 255;
  }
  // three box-blur passes ≈ a gaussian, and keeps the field smooth enough that
  // displacement does not tear along edges
  const tmp = new Float32Array(lum.length);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0;
        let n = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            s += lum[ny * w + nx];
            n++;
          }
        }
        tmp[y * w + x] = s / n;
      }
    }
    lum.set(tmp);
  }
  for (let i = 0; i < w * h; i++) {
    const v = Math.round(lum[i] * 255);
    const p = i * 4;
    data.data[p] = v;
    data.data[p + 1] = v;
    data.data[p + 2] = v;
    data.data[p + 3] = 255;
  }
  return data;
};

interface DepthImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export const DepthImage: React.FC<DepthImageProps> = ({ src, alt, className = '', imgClassName = '' }) => {
  const host = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number>(0);
  const teardown = useRef<number>(0);
  const state = useRef({ mx: 0, my: 0, tx: 0, ty: 0, amount: 0, target: 0 });
  const [live, setLive] = useState(false);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    const c = canvasRef.current;
    if (c) {
      const gl = c.getContext('webgl');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      c.remove();
      canvasRef.current = null;
    }
    setLive(false);
  }, []);

  useEffect(() => () => { window.clearTimeout(teardown.current); stop(); }, [stop]);

  const start = useCallback(() => {
    window.clearTimeout(teardown.current);
    if (canvasRef.current || prefersReducedMotion()) return;
    const img = imgRef.current;
    const box = host.current;
    if (!img || !box || !img.complete || !img.naturalWidth) return;

    const depth = buildDepthMap(img);
    if (!depth) return;

    const canvas = document.createElement('canvas');
    const rect = box.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const mkTex = (unit: number, source: TexImageSource) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      return t;
    };
    mkTex(0, img);
    mkTex(1, depth);
    gl.uniform1i(gl.getUniformLocation(prog, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(prog, 'uDepth'), 1);
    const uMouse = gl.getUniformLocation(prog, 'uMouse');
    const uAmount = gl.getUniformLocation(prog, 'uAmount');

    box.appendChild(canvas);
    canvasRef.current = canvas;
    setLive(true);

    const s = state.current;
    s.target = 1;
    const tick = () => {
      s.mx += (s.tx - s.mx) * 0.12;
      s.my += (s.ty - s.my) * 0.12;
      s.amount += (s.target - s.amount) * 0.09;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uMouse, s.mx, s.my);
      gl.uniform1f(uAmount, s.amount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const r = host.current?.getBoundingClientRect();
    if (!r) return;
    state.current.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    state.current.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  };

  const onLeave = () => {
    const s = state.current;
    s.target = 0;
    s.tx = 0;
    s.ty = 0;
    // let it settle back before dropping the context
    teardown.current = window.setTimeout(stop, 620);
  };

  return (
    <div
      ref={host}
      className={`relative overflow-hidden ${className}`}
      onPointerEnter={start}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`block w-full h-full object-cover transition-opacity duration-300 ${imgClassName} ${live ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default DepthImage;
