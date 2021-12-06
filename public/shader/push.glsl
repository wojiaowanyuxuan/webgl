precision mediump float;
uniform sampler2D u_image[2];
uniform float u_ratio;
varying vec2 v_texCoord;

void main() {
  vec4 resColor = vec4(u_ratio, 0.0, 0.0, 1.0);
  float R = 1.0 - u_ratio;
  if (v_texCoord.x >= R) {
    resColor = texture2D(u_image[1], vec2(v_texCoord.x - R, v_texCoord.y));
  } else {
    resColor = texture2D(u_image[0], vec2(v_texCoord.x - R + 1.0, v_texCoord.y));
  }
  gl_FragColor = resColor;
}