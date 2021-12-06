
// 片段着色器
precision mediump float;
uniform sampler2D u_image[2];
uniform float u_ratio;
varying vec2 v_texCoord;

vec2 transform(vec2 texcoor, vec2 scaleCenter, vec2 scaleRatio) {
  vec2 res = texcoor;
  res = res - scaleCenter;
  res = res / scaleRatio;
  res = res + scaleCenter;
  return res;
}

void main() {
  vec4 resColor = vec4(u_ratio, 0.0, 0.0, 1.0);
  float w = 1.0;
  if (u_ratio <= 0.5) {
    float t = u_ratio * 2.0;
    vec2 scaleRatio = vec2(1.0 + 0.1 * w);
    vec4 texColor1 = texture2D(u_image[0], v_texCoord);
    float alpha = clamp(-1.0 / w * v_texCoord.x + (1.0 + w) / w * (1.0 - t), 0.0, 1.0);
    resColor = mix(vec4(1.0), texColor1, alpha);
  } else {
    float t = (u_ratio - 0.5) * 2.0;
    vec2 scaleRatio = vec2(1.0 + 0.1 * t);
    vec4 texColor2 = texture2D(u_image[1], v_texCoord);
    float alpha = 1.0-clamp(-1.0 / w * v_texCoord.x + (1.0 + w) / w * t, 0.0, 1.0);
    resColor = mix(texColor2, vec4(1.0), alpha);
  }
  gl_FragColor = resColor;
}

