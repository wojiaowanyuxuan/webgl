#version 300 es
precision mediump float;

in vec2 v_texCoord;
in vec2 c_size;
uniform sampler2D u_image;
uniform vec2 p_size;
uniform float time;

out vec4 fragColor;
void main() {
  vec4 dis = vec4(time / c_size.x, time / c_size.y, time / c_size.x, time / c_size.y) * vec4(-1.0, -1.0, 1.0, 1.0);

  vec4 color = vec4(0);
  color += texture(u_image, v_texCoord + dis.xy) * 0.25;
  color += texture(u_image, v_texCoord + dis.zy) * 0.25;
  color += texture(u_image, v_texCoord + dis.xw) * 0.25;
  color += texture(u_image, v_texCoord + dis.zw) * 0.25;

  fragColor = color;
}
