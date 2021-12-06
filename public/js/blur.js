console.log('--- load blur.js ---');

const canvas = document.getElementById('blur');
const gl = canvas.getContext('webgl2');
const url_domain = 'http://127.0.0.1:5004';

if (!gl) {
  console.log('浏览器不支持webgl 2.0');
}

async function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = '';
    img.onload = function() {
      resolve(img);
    };

    img.onerror = function(e) {
      reject(e && e.message);
    };
  });
}

async function init() {
  let img = await loadImg(`${url_domain}/img/Jinx.jpg`);
  const width = img.width, height = img.height;
  const vsSource = await fetch(`${url_domain}/shader/blur/v.glsl`).then(r => r.text()).catch(e => console.log(e));
  const fsSource = await fetch(`${url_domain}/shader//blur/f.glsl`).then(r => r.text()).catch(e => console.log(e));

  console.log('VERTEX_SHADER', gl.VERTEX_SHADER, 'FRAGMENT_SHADER', gl.FRAGMENT_SHADER);
  const vShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = createProgram(gl, vShader, fShader);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  /** 绑定顶点数据 start */
  const pb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pb);
  const pa = new Float32Array([
    /** A */ 0, 0,  /** B */ width, 0, /** D */0, height,
    /** D */ 0, height, /** B */ width, 0, /** C */ width, height
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, pa, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
  /** 绑定顶点结束 end */

  /** 提供纹理坐标数据 start */
  const tb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tb);
  const ta = new Float32Array([
    /** A */ 0, 0, /** B */ 1, 0, /** D */ 0, 1,
    /** D */ 0, 1, /** B */ 1, 0, /** C */ 1, 1
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, ta, gl.STATIC_DRAW);
  
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
  /** 提供纹理坐标数据结束 end */

  // 绑定纹理单元
  const texture = createTexture(gl, img, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  ur = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(ur, gl.canvas.width, gl.canvas.height);
  ps = gl.getUniformLocation(program, 'p_size');
  gl.uniform2f(ps, parseFloat(1.0 / gl.canvas.width), parseFloat(1.0 / gl.canvas.height));

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}


function createTexture(gl, image, option) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, option);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, option);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  return t;
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const suc = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (suc) return shader;

  console.error('创建shder失败', type);
  gl.deleteShader(shader);
}

function createProgram(gl, vShader, fShader) {
  const p = gl.createProgram();

  gl.attachShader(p, vShader);
  gl.attachShader(p, fShader);
  gl.linkProgram(p);

  const suc = gl.getProgramParameter(p, gl.LINK_STATUS);
  if (suc) return p;

  console.error('创建着色器程序失败');
  gl.deleteProgram(p);
}

init();