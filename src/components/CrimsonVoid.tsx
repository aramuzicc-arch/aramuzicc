import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float sum = 0.0, amp = 1.0, freq = 1.0;
    for (int i = 0; i < 5; i++) {
      sum += amp * snoise(p * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return sum;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = u_time * 0.05;
    float mouseInfluence = u_mouse.x > 0.0 ? 1.0 : 0.0;
    vec2 distortedP = p;
    if (mouseInfluence > 0.5) {
      vec2 mouseUV = vec2(u_mouse.x * aspect, u_mouse.y);
      float mouseDist = length(p - mouseUV);
      distortedP += (p - mouseUV) * (0.05 / (mouseDist + 0.1));
    }
    float n1 = fbm(distortedP * 2.0 + vec2(t, t * 0.3));
    float n2 = fbm(distortedP * 3.0 - vec2(t * 0.5, t * 0.2));
    float n3 = snoise(distortedP * 1.5 + vec2(t * 0.2, t * 0.4)) * 0.5 + 0.5;
    float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    vec3 voidBlack = vec3(0.06, 0.05, 0.02);
    vec3 deepOlive = vec3(0.20, 0.25, 0.08);
    vec3 warmOlive = vec3(0.55, 0.45, 0.25);
    vec3 warmWhite = vec3(0.96, 0.90, 0.83);
    vec3 color = mix(voidBlack, deepOlive, smoothstep(0.2, 0.4, pattern));
    color = mix(color, warmOlive, smoothstep(0.4, 0.6, pattern) * 0.5);
    color += warmWhite * smoothstep(0.7, 0.9, n3) * 0.15;
    float centerDist = length(uv - 0.5);
    color += warmWhite * (1.0 - smoothstep(0.0, 0.5, centerDist)) * 0.08;
    if (mouseInfluence > 0.5) {
      vec2 mouseUV = vec2(u_mouse.x * aspect, u_mouse.y);
      float mouseDist = length(p - mouseUV);
      color += warmOlive * exp(-mouseDist * mouseDist * 8.0) * 0.3;
    }
    color += (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.02;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const mouseRef = useRef({ x: -1, y: -1 });

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
      u_mouse: { value: new THREE.Vector2(-1, -1) },
    }),
    []
  );

  useEffect(() => {
    uniforms.u_resolution.value.set(size.width, size.height);
  }, [size, uniforms]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // Accumulate frame deltas — avoids `state.clock` (THREE.Clock is deprecated since r183).
  const elapsedRef = useRef(0);
  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    elapsedRef.current += delta;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.u_time.value = elapsedRef.current;
    mat.uniforms.u_mouse.value.set(mouseRef.current.x, mouseRef.current.y);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function CrimsonVoid({ className = '' }: { className?: string }) {
  return (
    <div className={`fixed inset-0 z-0 ${className}`}>
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
