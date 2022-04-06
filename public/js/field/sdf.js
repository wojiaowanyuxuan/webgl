const INF = 1e20;

class TSDF {
  constructor(sourceImage) {
    // make the canvas size big enough to both have the specified buffer around the glyph
    // for "halo", and account for some glyphs possibly being larger than their font size
    // const size = this.size = fontSize + buffer * 4;

    this.canvas = this._createCanvas(sourceImage.width, sourceImage.height);
    this.ctx = this.canvas.getContext('2d', {
      willReadFrequently: true
    });
    this.ctx.drawImage(sourceImage, 0, 0);
    const size = sourceImage.width;

    // temporary arrays for the distance transform
    this.gridOuter = new Float64Array(size * size);
    this.gridInner = new Float64Array(size * size);
    this.f = new Float64Array(size);
    this.z = new Float64Array(size + 1);
    this.v = new Uint16Array(size);
  }

  _createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  draw() {

    // The integer/pixel part of the top alignment is encoded in metrics.glyphTop
    // The remainder is implicitly encoded in the rasterization

    const {
      ctx,
      gridInner,
      gridOuter
    } = this;
    const imgData = ctx.getImageData(0, 0,  this.canvas.width, this.canvas.height);
    const glyphHeight = this.canvas.height;
    const glyphWidth = this.canvas.width;
    const width = glyphWidth;
    const height = glyphHeight;
    const buffer = 0;
    const data = new Uint8ClampedArray(width * height * 4);
    const len = Math.max(width * height, 0);
    console.log(`[SDF DEBUG] width: ${width} height: ${height}`);

    // Initialize grids outside the glyph range to alpha 0
    gridOuter.fill(INF, 0, len);
    gridInner.fill(0, 0, len);

    for (let y = 0; y < glyphHeight; y++) {
      for (let x = 0; x < glyphWidth; x++) {
        const a = imgData.data[4 * (y * glyphWidth + x) + 3] / 255; // alpha value
        const r = imgData.data[4 * (y * glyphWidth + x)]; // alpha value
        // if (a === 0) continue; // empty pixels

        const j = (y + buffer) * width + x + buffer;

        if (r < 128) {
          gridOuter[j] = 0;
          gridInner[j] = INF;
        } 

        // if (r < 128) { // fully drawn pixels
        //   gridOuter[j] = 0;
        //   gridInner[j] = INF;

        // } else { // aliased pixels
        //   const d = 0.5 - a;
        //   gridOuter[j] = d > 0 ? d * d : 0;
        //   gridInner[j] = d < 0 ? d * d : 0;
        // }
      }
    }

    edt(gridOuter, 0, 0, width, height, width, this.f, this.v, this.z);
    edt(gridInner, buffer, buffer, glyphWidth, glyphHeight, width, this.f, this.v, this.z);

    let pr = [];

    let index = 0;
    for (let i = 0; i < len; i++) {
      const d = Math.sqrt(gridOuter[i]) - Math.sqrt(gridInner[i]);
      let p = Math.round(255 - 255 * (d / 8 + 0.25));

      pr.push(p);

      data[index] = p;
      data[index + 1] = p;
      data[index + 2] = p;
      data[index + 3] = 255;
    }
    window.pr = pr;
    console.log(pr);
    return data;
  }
}

// 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
function edt(data, x0, y0, width, height, gridSize, f, v, z) {
  for (let x = x0; x < x0 + width; x++) edt1d(data, y0 * gridSize + x, gridSize, height, f, v, z);
  for (let y = y0; y < y0 + height; y++) edt1d(data, y * gridSize + x0, 1, width, f, v, z);
}

// 1D squared distance transform
function edt1d(grid, offset, stride, length, f, v, z) {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  f[0] = grid[offset];

  for (let q = 1, k = 0, s = 0; q < length; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);

    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }

  for (let q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    const qr = q - r;
    grid[offset + q * stride] = f[r] + qr * qr;
  }
}

window.TSDF = TSDF;
