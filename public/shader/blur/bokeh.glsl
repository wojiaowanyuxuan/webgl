#version 300 es
#define c cos(2.39996323)
#define s sin(2.39996323)
precision mediump float;

in vec2 v_texCoord;
uniform sampler2D u_image;
uniform vec2 p_size;
uniform float time;

out vec4 fragColor;
void main() {
  mat2 rot = mat2(c, s, -s, c);
  vec4 color = vec4(0.0);
  vec4 divisor = vec4(0.0);

  float r = 1.0;
  vec2 cur = vec2(0.0, time);

  for (int l = 0; l < 200; l++) {
    r += 1.0 / r;
    cur = rot * cur;
    vec2 uv = v_texCoord + (p_size * (r - 1.0) * cur);

    vec4 bokeh = texture(u_image, uv);
    color += bokeh * bokeh;
    divisor += bokeh;
  }
  fragColor = color / divisor;
}