attribute vec2 a_position;
uniform vec2 u_resolution;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main(void) {
  vec2 zeroTrans = a_position / u_resolution;
  vec2 zeroTarget = zeroTrans * 2.0;
  vec2 clipSpace = zeroTarget - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  v_texCoord = a_texCoord;
}