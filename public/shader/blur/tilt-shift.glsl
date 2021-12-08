#version 300 es
#define c cos(2.39996323)
#define s sin(2.39996323)
precision mediump float;

in vec2 v_texCoord;
uniform sampler2D u_image;
uniform vec2 p_size;
uniform float time;

float tMask(vec2 uv) {
  float centerY = uv.y * 2.0 - 1.0;
  return pow(abs(centerY * time), 1.0);
}


out vec4 fragColor;
void main() {
  mat2 rot = mat2(c, s, -s, c);
  float m = tMask(v_texCoord);
  vec4 accumulator = vec4(0.0);
  vec4 divisor = vec4(0.0);

  float r = 1.0;
  vec2 angle = vec2(0.0, 1.34 * m);

  for (int j = 0; j < 36; j++) {
    r += (1.0 / r);
    angle = rot * angle;
    vec4 bokeh = texture(u_image, v_texCoord + p_size * (r - 1.0) * angle);
    accumulator += (bokeh * bokeh);
    divisor += bokeh;
  }
  
  vec4 color = vec4(vec3(m), clamp(1.0 - m, 0.0, 1.0));
  fragColor = accumulator / divisor;
  // fragColor = color;
}