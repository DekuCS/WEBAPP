// Vertex shader: Full-screen quad
export const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment shader: 3D hardware-accelerated procedural mesh & fluid shader
export const FRAGMENT_SHADER_SOURCE = `
precision highp float;

varying vec2 v_uv;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_colors[6];
uniform int u_color_count;
uniform float u_distortion;
uniform float u_frequency;
uniform float u_grain;
uniform float u_lighting;
uniform float u_angle;
uniform float u_scale;
uniform float u_softness;
uniform vec2 u_mouse;
uniform float u_mouse_influence;
uniform int u_style; // 0=mesh, 1=liquid, 2=aurora, 3=vortex, 4=silk, 5=prismatic

// Simplex / Perlin noise helpers
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// 2D Rotation
vec2 rotate2D(vec2 p, float a) {
  float s = sin(a);
  float c = cos(a);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

// Fractal Brownian Motion
float fbm(vec3 p) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for(int i = 0; i < 4; i++) {
    val += amp * snoise(p * freq);
    freq *= 2.05;
    amp *= 0.5;
  }
  return val;
}

// Smooth multi-stop color palette interpolation
vec3 getPaletteColor(float t) {
  t = clamp(t, 0.0, 0.9999);
  float count = float(u_color_count);
  if (count <= 1.0) return u_colors[0];

  float scaled = t * (count - 1.0);
  int idx = int(floor(scaled));
  float frac = fract(scaled);

  // Smooth Hermite interpolation
  frac = smoothstep(0.0, 1.0, frac);

  vec3 c1 = u_colors[0];
  vec3 c2 = u_colors[1];

  if (idx == 0) { c1 = u_colors[0]; c2 = u_colors[1]; }
  else if (idx == 1) { c1 = u_colors[1]; c2 = u_colors[2]; }
  else if (idx == 2) { c1 = u_colors[2]; c2 = u_colors[3]; }
  else if (idx == 3) { c1 = u_colors[3]; c2 = u_colors[4]; }
  else if (idx == 4) { c1 = u_colors[4]; c2 = u_colors[5]; }

  return mix(c1, c2, frac);
}

// Film Grain / Dither to prevent color banding and add tactile analogue depth
float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Height field calculation for 3D lighting & normal calculation
float computeField(vec2 p, float time) {
  float field = 0.0;

  if (u_style == 0) {
    // 0 = Neat Organic Mesh Flow
    vec2 q = vec2(
      fbm(vec3(p * u_frequency, time * 0.15)),
      fbm(vec3(p * u_frequency + vec2(5.2, 1.3), time * 0.15))
    );
    vec2 r = vec2(
      fbm(vec3(p * u_frequency + 4.0 * q + vec2(1.7, 9.2), time * 0.18)),
      fbm(vec3(p * u_frequency + 4.0 * q + vec2(8.3, 2.8), time * 0.18))
    );
    field = fbm(vec3(p * u_frequency + u_distortion * r, time * 0.12));
    field = field * 0.5 + 0.5;
  }
  else if (u_style == 1) {
    // 1 = Liquid Metaballs / Viscous Fluid
    vec2 pos = p * u_frequency;
    float d1 = sin(pos.x * 2.0 + time * 0.8) + cos(pos.y * 2.5 + time * 0.6);
    float d2 = sin(pos.y * 1.8 - time * 0.5) + cos(pos.x * 2.2 + time * 0.7);
    vec2 flow = vec2(d1, d2) * u_distortion * 0.6;
    float n1 = snoise(vec3(pos + flow, time * 0.3));
    float n2 = snoise(vec3(pos * 1.6 - flow * 0.5, time * 0.25 + 4.0));
    field = (n1 + n2 * 0.5) * 0.5 + 0.5;
  }
  else if (u_style == 2) {
    // 2 = Aurora Ribbons
    vec2 pos = p * u_frequency;
    float wave1 = sin(pos.x * 3.0 + time * 0.7 + sin(pos.y * 2.0)) * 0.4;
    float wave2 = cos(pos.x * 5.0 - time * 0.5 + wave1) * 0.3;
    float vertical = pos.y + wave1 + wave2 * u_distortion;
    float n = snoise(vec3(vec2(pos.x * 0.8, vertical * 1.5), time * 0.2));
    field = smoothstep(-0.6, 0.8, n + vertical * 0.3);
  }
  else if (u_style == 3) {
    // 3 = Vortex / Cyber Swirl
    float r = length(p);
    float a = atan(p.y, p.x);
    float spiral = a + log(max(r, 0.001)) * u_distortion * 3.0 - time * 0.5;
    float n = snoise(vec3(vec2(cos(spiral) * r, sin(spiral) * r) * u_frequency * 2.0, time * 0.25));
    field = sin(spiral * 2.0 + n * 2.5) * 0.5 + 0.5;
  }
  else if (u_style == 4) {
    // 4 = Silk Satin Folds
    vec2 pos = p * u_frequency;
    float fold1 = sin(pos.x * 4.0 + sin(pos.y * 3.0 + time * 0.4)) * 0.5;
    float fold2 = cos(pos.y * 4.0 + sin(pos.x * 2.5 - time * 0.3)) * 0.5;
    float warp = (fold1 + fold2) * u_distortion;
    float s = sin(pos.x * 2.0 + pos.y * 2.0 + warp * 3.1415 + time * 0.3);
    field = s * 0.5 + 0.5;
  }
  else {
    // 5 = Prismatic Caustic Dispersion
    vec2 pos = p * u_frequency;
    float n1 = fbm(vec3(pos, time * 0.2));
    float n2 = fbm(vec3(pos + vec2(n1 * u_distortion), time * 0.25));
    field = fract(n2 * 2.0 + length(pos) * 0.5 - time * 0.1);
  }

  return clamp(field, 0.0, 1.0);
}

void main() {
  vec2 aspect = vec2(u_resolution.x / min(u_resolution.x, u_resolution.y),
                     u_resolution.y / min(u_resolution.x, u_resolution.y));
  vec2 uv = (v_uv - 0.5) * aspect;

  // Rotation & Scale
  uv = rotate2D(uv, u_angle);
  uv *= u_scale;

  // Interactive mouse influence ripple
  if (u_mouse_influence > 0.001) {
    vec2 mouseNorm = (u_mouse - 0.5) * aspect;
    mouseNorm = rotate2D(mouseNorm, u_angle) * u_scale;
    float dist = length(uv - mouseNorm);
    float ripple = exp(-dist * 4.5) * sin(dist * 18.0 - u_time * 2.0);
    uv += normalize(uv - mouseNorm + 0.0001) * ripple * 0.12 * u_mouse_influence;
  }

  float t = u_time * 0.5;
  float field = computeField(uv, t);

  // Softness adjustment
  if (u_softness != 1.0) {
    field = pow(field, 1.0 / max(u_softness, 0.01));
  }

  // Sample base multi-stop gradient color
  vec3 color = getPaletteColor(field);

  // 3D Specular & Normal Curvature Lighting
  if (u_lighting > 0.01) {
    float eps = 0.008;
    float fieldRight = computeField(uv + vec2(eps, 0.0), t);
    float fieldUp    = computeField(uv + vec2(0.0, eps), t);
    vec3 normal = normalize(vec3((field - fieldRight) / eps, (field - fieldUp) / eps, 1.0 / (u_lighting + 0.2)));

    // Dynamic light direction
    vec3 lightDir = normalize(vec3(sin(u_time * 0.3) * 0.5, cos(u_time * 0.2) * 0.5, 0.8));
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 16.0);

    // Light enhancement
    color += spec * 0.45 * u_lighting;
    color *= 0.85 + diff * 0.35 * u_lighting;
  }

  // Prismatic chromatic aberration shift
  if (u_style == 5) {
    float offset = 0.02 * u_distortion;
    float fR = computeField(uv + vec2(offset, 0.0), t);
    float fB = computeField(uv - vec2(offset, 0.0), t);
    color.r = mix(color.r, getPaletteColor(fR).r, 0.5);
    color.b = mix(color.b, getPaletteColor(fB).b, 0.5);
  }

  // Analog film grain / dither
  if (u_grain > 0.001) {
    float grain = hash21(gl_FragCoord.xy + fract(u_time * 12.345)) * 2.0 - 1.0;
    color += grain * u_grain * 0.35;
  }

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
