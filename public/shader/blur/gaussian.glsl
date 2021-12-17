#version 300 es
#define c cos(2.39996323)
#define s sin(2.39996323)
precision mediump float;

in vec2 v_texCoord;
uniform sampler2D u_image;
uniform vec2 p_size;
uniform float time;

// 求高斯密度值
float getGaussianVal(float x, float sigma) {
  return 0.398 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

out vec4 fragColor;
void main() {
  // 一个7 * 7的高斯核模糊
  // 维度
  const int m = 7;
  // 数组长度
  const int k = 2 * m + 1;
  float kernel[k];

  for (int i = 0; i <= m; i++) {
    kernel[m - i] = kernel[m + i] = getGaussianVal(float(i), 7.0);
  }

  float z = 0.0;
  for (int j = 0; j < k; j++) {
    z += kernel[j];
  }

  vec4 color = vec4(0.0);

  // 开始卷积过程
  for (int x = -m; x <= m; x++) {
    for (int y = -m; y <= m; y++) {
      color += kernel[m + x] * kernel[m + y] * texture(u_image, v_texCoord + (time * p_size * vec2(x, y)));
    }
  }
  fragColor = color / (z * z);
}