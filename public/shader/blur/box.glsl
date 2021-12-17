#version 300 es
precision mediump float;

in vec2 v_texCoord;
in vec2 c_size;
uniform sampler2D u_image;
uniform vec2 p_size;
uniform float time;

out vec4 fragColor;
void main() {
  // 偏移量
  vec4 offset = vec4(time / c_size.x, time / c_size.y, time / c_size.x, time / c_size.y) * vec4(-1.0, -1.0, 1.0, 1.0);
  vec4 color = texture(u_image, v_texCoord);
  // 左上角
  color += texture(u_image, v_texCoord + offset.xy);
  // 左边
  color += texture(u_image, vec2(v_texCoord.x + offset.x, v_texCoord.y));
  // // 左下
  color += texture(u_image, v_texCoord + offset.xw);
  // // 上
  color += texture(u_image, vec2(v_texCoord.x, v_texCoord.y + offset.y));
  // // 下
  color += texture(u_image, vec2(v_texCoord.x, v_texCoord.y + offset.w));
  // // 右上
  color += texture(u_image, v_texCoord + offset.zy);
  // // 右边
  color += texture(u_image, vec2(v_texCoord.x + offset.z, v_texCoord.y));
  // // 右下
  color += texture(u_image, v_texCoord + offset.zw);

  fragColor = color / 9.0;
}

  // vec4 color = texture(u_image, v_texCoord);
  // color += texture(u_image, v_texCoord + dis.xy) * 0.25;
  // color += texture(u_image, v_texCoord + dis.zy) * 0.25;
  // color += texture(u_image, v_texCoord + dis.xw) * 0.25;
  // color += texture(u_image, v_texCoord + dis.zw) * 0.25;
