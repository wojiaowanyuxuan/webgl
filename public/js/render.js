console.log('加载draw.js');

const canvas = document.getElementById('webgl');
const gl = canvas.getContext('webgl');
const url_domain = 'http://127.0.0.1:5004';

if (!gl) {
  console.error('网站不支持webgl');
}

loadImages(
  [`${url_domain}/img/Vladimir_1.jpg`, `${url_domain}/img/Jinx.jpg`],
  init,
)

function loadImages(urls, callback) {
  let len = urls.length;
  let images = [];

  const onImageLoad = function () {
    if (--len === 0) {
      callback(images);
    }
  }

  for (let i = 0; i < urls.length; i++) {
    const image = loadImage(urls[i], onImageLoad);
    images.push(image);
  }
}

function loadImage(url, callback) {
  const image = new Image();
  image.src = url;
  image.crossOrigin = '';
  image.onload = callback;

  return image;
}

let program;
  // 纹理属性
let texLocation;
let u_0Location;
// 画布归一化
let rLocation;
// 随机种子
let r = 0;
let pLocation;
let pBuffer;

async function init(images) {
  const imageWidth = images[0].width;
  const imageHeight = images[0].height;
  const vsSource = await fetch(`${url_domain}/shader/vertex.glsl`).then(r => r.text()).catch(e => console.log(e));
  const fsSource = document.querySelector('#fs').text;
  initProgram(vsSource, fsSource);


  function render() {

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // 使用着色器程序
    gl.useProgram(program);
    
    // 告诉webgl如何取顶点数据
    gl.enableVertexAttribArray(pLocation);
    // 将数据缓冲源绑定到 绑定点ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.vertexAttribPointer(
      pLocation,
      2, // 每次取两个数字 形成一个坐标
      gl.FLOAT,
      false,
      0,
      0
    );

    // 获取纹理属性地址
    const texBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texLocation);
    gl.vertexAttribPointer(texLocation, 2, gl.FLOAT, false, 0, 0);
  
    let textures = [];
    for (let i = 0; i < images.length; i++) {
      textures.push(createTexture(gl, images[i], gl.CLAMP_TO_EDGE));
    }
    
    gl.uniform1iv(u_0Location, [0, 1]);
  
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
  
  
    gl.uniform2f(rLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(ratio, r);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function initProgram(vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    program = createProgram(gl, vs, fs);
    // 纹理属性
    texLocation = gl.getAttribLocation(program, 'a_texCoord');
    u_0Location = gl.getUniformLocation(program, 'u_image');

    // 画布归一化
    rLocation = gl.getUniformLocation(program, 'u_resolution');
    // 随机种子
    ratio = gl.getUniformLocation(program, 'u_ratio');

    // 定点属性
    pLocation = gl.getAttribLocation(program, 'a_position');

    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    const positions = new Float32Array([
      0, 0,
      imageWidth, 0,
      0, imageHeight,
      0, imageHeight,
      imageWidth, 0,
      imageWidth, imageHeight
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }

  function animation() {
    requestAnimationFrame(() => {
      render();
      r += (1 / 120);
      if (r < 1) {
        animation();
      }
    })
  }

  function bindEvent() {
    document.getElementById('mix').addEventListener('click', animation);

    document.getElementById('push').addEventListener('click', async () => {
      let t = await fetch(`${url_domain}/shader/push.glsl`).then(r => r.text()).catch(e => console.log(e));
      initProgram(vsSource, t);
      animation();
    });

    document.getElementById('wipe').addEventListener('click', async () => {
      let t = await fetch(`${url_domain}/shader/wipe.glsl`).then(r => r.text()).catch(e => console.log(e));
      initProgram(vsSource, t);
      animation();
    });

    document.getElementById('reveal').addEventListener('click', async () => {
      let t = await fetch(`${url_domain}/shader/reveal.glsl`).then(r => r.text()).catch(e => console.log(e));
      initProgram(vsSource, t);
      animation();
    })

    document.getElementById('getBtn').addEventListener('click', async () => {
      let t = await fetch(`${url_domain}/shader/.glsl`).then(r => r.text()).catch(e => console.log(e));
      console.log('获取shader', t);
    });

    document.getElementById('resume').addEventListener('click', () => {
      r = 0;
      render();
    });
  }
  render();
  bindEvent();
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

  console.error('创建shder失败');
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
