// Shared heightfield simulation for the Quench panel and the hero's lilac field.
export const RIPPLE_SIM_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPrev;
  uniform vec2 uTexel, uMouse, uMousePrev;
  uniform float uDamping, uInject, uRad2;

  float segDist(vec2 p, vec2 a, vec2 b){
    vec2 pa = p - a, ba = b - a;
    float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * t);
  }

  void main(){
    vec4 s = texture2D(uPrev, vUv);
    float h = s.r, hp = s.g;
    float sum =
        texture2D(uPrev, vUv + vec2( uTexel.x, 0.0)).r
      + texture2D(uPrev, vUv + vec2(-uTexel.x, 0.0)).r
      + texture2D(uPrev, vUv + vec2(0.0,  uTexel.y)).r
      + texture2D(uPrev, vUv + vec2(0.0, -uTexel.y)).r;
    float next = (sum * 0.5 - hp) * uDamping;

    if (uInject > 0.001 && uMouse.x > -1.0) {
      float d = segDist(vUv, uMousePrev, uMouse);
      next += uInject * 0.5 * exp(-d * d / uRad2);
    }

    next = clamp(next, -1.5, 1.5);
    gl_FragColor = vec4(next, h, 0.0, 1.0);
  }
`;
