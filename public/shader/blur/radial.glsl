#version 300 es
precision mediump float;

in vec2 v_texCoord;
uniform sampler2D u_image;
uniform vec2 p_size;
uniform float time;

out vec4 fragColor;
void main() {
  // 确定模糊方向和偏移
  vec2 dir = (0.5 - v_texCoord) * (time * 0.01);
  vec4 color = vec4(0.0);
  vec2 cur = v_texCoord;

  for (int i = 0; i < 10; i++) {
    // 以该像素为起点，向内开始迭代10次
    color += texture(u_image, cur);
    cur += dir;
  }

  fragColor = color / 10.0;
}