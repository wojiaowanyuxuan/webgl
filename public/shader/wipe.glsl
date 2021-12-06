// 片段着色器
precision mediump float;
uniform sampler2D u_image[2];
uniform float u_ratio;
varying vec2 v_texCoord;

void main() {
  vec4 color0 = texture2D(u_image[0], v_texCoord);
  vec4 color1 = texture2D(u_image[1], v_texCoord);
  float w = 0.5;
  // w可以控制alpha变化的程度，反应为底图消失的速度
  float alpha = clamp(-1.0 / w * v_texCoord.x + (1.0 + w) / w + u_ratio * (-(1.0 + w) / w), 0.0, 1.0);  
  gl_FragColor = mix(color1, color0, alpha);
}
