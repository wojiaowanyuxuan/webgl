#version 300 es
precision mediump float;

in float h;

float sdfCircle(vec2 coord, vec2 center, float radius) {
  vec2 offset = coord - center;
  
  return sqrt((offset.x * offset.x) + (offset.y * offset.y)) - radius;
}

vec4 render(float d, vec3 color, float stroke) {
  float anti = fwidth(d) * 1.0;
  vec4 colorLayer = vec4(color, 1.0 - smoothstep(-anti, anti, d));

  if (stroke < 0.000001) {
    return colorLayer;
  }

  vec4 strokeLayer = vec4(vec3(0.05, 0.05, 0.05), 1.0 - smoothstep(-anti, anti, d - stroke));

  return vec4(mix(strokeLayer.rgb, colorLayer.rgb, colorLayer.a), strokeLayer.a);
}

// vec4 render(float d) {
//   if (d < 0.0) {
//     return vec4(1.0, 0.0, 1.0, 1.0);
//   }
//   return vec4(1.0, 1.0, 1.0, 1.0);
// }

out vec4 fragColor;
void main() {
  vec2 p_v = vec2(gl_FragCoord.x, h - gl_FragCoord.y);
  float a = sdfCircle(p_v, vec2(100.0, 100.0), 50.0);

  // fragColor = render(a);
  vec4 color = render(a, vec3(0.2, 1.0, 0.1), fwidth(a) * 1.1);
  fragColor = mix(vec4(1.0, 1.0, 1.0, 1.0), color, color.a);
}