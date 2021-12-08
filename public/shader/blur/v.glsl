#version 300 es

layout (location = 1) in vec2 a_position;
layout (location = 2) in vec2 a_texCoord;
uniform vec2 u_resolution;

out vec2 v_texCoord;
out vec2 c_size;
void main() {
  vec2 zeroTrans = a_position / u_resolution;
  vec2 zeroTarget = zeroTrans * 2.0;
  vec2 clipSpace = zeroTarget - 1.0;
  v_texCoord = a_texCoord;
  c_size = u_resolution;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}