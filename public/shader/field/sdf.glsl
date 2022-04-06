#version 300 es
precision mediump float;

in vec2 v_texCoord;
uniform sampler2D u_image;

out vec4 fragColor;
void main() {
  float dist = texture(u_image, v_texCoord).r;
  vec4 color = vec4(0, 0, 0, 1);
  
  if (dist < 0.0) {
    // 距离小于0 说明在内部
    color = vec4(1, 1, 1, 1);
  }
  fragColor = texture(u_image, v_texCoord);
}