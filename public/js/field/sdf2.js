const INF = 9999;

class Point {
  constructor(x, y) {
    this.dx = x;
    this.dy = y;
  }

  add(x, y) {
    this.dx += x;
    this.dy += y;
  }

  getDist() {
    return this.dx * this.dx + this.dy * this.dy;
  }
}

let inside = new Point(0, 0);
let empty = new Point(INF, INF);

function put(grid, x, y, point) {
  grid[y][x] = point;
}


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
    this.WIDTH = size;
    this.HEIGHT = size;

    // temporary arrays for the distance transform
    this.grid1 = Array.from({length: size}, _ => new Array(size).fill(0));
    this.grid2 = Array.from({length: size}, _ => new Array(size).fill(0));
    // this.f = new Float64Array(size);
    // this.z = new Float64Array(size + 1);
    // this.v = new Uint16Array(size);
  }

  getPoint(g, x, y) {
    if (x >= 0 && x < this.WIDTH && y >= 0 && y < this.HEIGHT) {
      return g[y][x];
    }
    return empty;
  }

  _createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  GenerateSDF(g) {
    const { WIDTH, HEIGHT } = this;
    // pass 0
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        let p = this.getPoint(g, x, y);

        let q = this.compare(g, p, x, y, -1, 0);
        let w = this.compare(g, q, x, y, 0, -1);
        let e = this.compare(g, w, x, y, -1, -1);
        let r = this.compare(g, e, x, y, 1, -1);

        put(g, x, y, r);
      }

      for (let x = WIDTH - 1; x >= 0; x--) {
        let p = this.getPoint(g, x, y);
        let q = this.compare(g, p, x, y, 1, 0);
        put(g, x, y, q);
      }
    }

    // pass 1
    for (let y = HEIGHT - 1; y >= 0; y--) {
      for (let x = WIDTH - 1; x >= 0; x--) {
        let p = this.getPoint(g, x, y);

        let q = this.compare( g, p, x, y, 1, 0);
        let w = this.compare( g, q, x, y, 0, 1);
        let e = this.compare( g, w, x, y, -1, 1);
        let r = this.compare( g, e, x, y, 1, 1);

        put(g, x, y, r);
      }

      for (let x = 0; x < WIDTH; x++) {
        let p = this.getPoint(g, x, y);
        let q = this.compare(g, p, x, y, -1, 0);

        put(g, x, y, q);
      }
    }
  }

  compare(g, p, x, y, offsetX, offsetY) {
    let other = this.getPoint(g, x + offsetX, y + offsetY);

    other.add(offsetX, offsetY);

    if (other.getDist() < p.getDist()) {
      return other;
    }
    return p;
  }

  draw() {

    // The integer/pixel part of the top alignment is encoded in metrics.glyphTop
    // The remainder is implicitly encoded in the rasterization

    const {
      ctx,
    } = this;
    const imgData = ctx.getImageData(0, 0,  this.canvas.width, this.canvas.height);
    const glyphHeight = this.HEIGHT;
    const glyphWidth = this.WIDTH;
    const width = glyphWidth;
    const height = glyphHeight;
    const data = new Uint8ClampedArray(width * height * 4);
    const len = Math.max(width * height, 0);
    console.log(`[SDF DEBUG] width: ${width} height: ${height}`);

    // Initialize grids outside the glyph range to alpha 0
    // gridOuter.fill(INF, 0, len);
    // gridInner.fill(0, 0, len);

    for (let y = 0; y < glyphHeight; y++) {
      for (let x = 0; x < glyphWidth; x++) {
        const r = imgData.data[4 * (y * glyphWidth + x)]; // r value
        // if (a === 0) continue; // empty pixels

        if (r < 128) {
          put(this.grid1, x, y, new Point(0, 0));
          put(this.grid2, x, y, new Point(INF, INF));
        } else {
          put(this.grid1, x, y, new Point(INF, INF));
          put(this.grid2, x, y, new Point(0, 0));
        }
      }
    }

    this.GenerateSDF(this.grid1);
    this.GenerateSDF(this.grid2);

    let index = 0, ds = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let dis1 = Math.sqrt(this.getPoint(this.grid1, x, y).getDist());
        let dis2 = Math.sqrt(this.getPoint(this.grid2, x, y).getDist());

        let dist = dis1 - dis2;
        let c = dist * 3 + 128;
        if (c < 0) c = 0;
        else if (c > 255) c = 255;
        // let c = dist;
        // ds.push(c);

        data[index] = c;
        data[index + 1] = c;
        data[index + 2] = c;
        data[index + 3] = 255;
        index += 4;
      }
    }
    window.ds = ds;
    console.log(ds);
    return data;
  }
}

window.TSDF = TSDF;
