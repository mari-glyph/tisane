export class CanvasManager {
  constructor(containerId, fontSize = 16) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);
    this.fontSize = fontSize;
    this.resizeCanvas();
    window.addEventListener("resize", this._debounce(() => this.resizeCanvas(), 200));
  }

  resizeCanvas() {
    const scale = window.devicePixelRatio || 1;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || width;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
    // Fill canvas with black to prevent white flash
    this.ctx.save();
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    this.cols = Math.floor(width / (this.fontSize * 0.6));
    this.rows = Math.floor(height / this.fontSize);
  }

  _debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
}
