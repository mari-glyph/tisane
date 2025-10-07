class AsciiArtAnimator {
  constructor(containerId, config = {}) {
    this.container = document.getElementById(containerId);

    this.config = Object.assign(
      {
        text: ["tackle tacit", "tackle taste", "tisane"],
        chars: "✦✤*✴",
        fontSize: 15,
        color: "#c2e222",
        bgColor: "#000000",
        density: 0.3,
        speed: 0.04,
        targetFPS: 24,
        largeScale: 1.5
      },
      config
    );

    const availablePatterns = ["wave", "ripple", "plasma", "spiral"];
    this.config.pattern =
      this.config.pattern ||
      availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    this.config.speed *= 0.8 + Math.random() * 0.4;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);

    this._resizeCanvas();
    window.addEventListener("resize", this._debounce(() => this._resizeCanvas(), 200));

    this.frameTime = 0;
    this.lastTimestamp = 0;
    this.accumulator = 0;

    this.patterns = {
      wave: (x, y, t) =>
        Math.sin(x * 0.1 + t * 0.05) * 5 + Math.cos(y * 0.1 + t * 0.05) * 5,
      ripple: (x, y, t) =>
        Math.sin(Math.sqrt((x - 40) ** 2 + (y - 15) ** 2) * 0.3 - t * 0.1) * 10,
      spiral: (x, y, t) => Math.atan2(y - 15, x - 40) * 5 + t * 0.1,
      plasma: (x, y, t) =>
        Math.sin(x * 0.2 + t * 0.05) +
        Math.sin(y * 0.2 + t * 0.07) +
        Math.sin((x + y) * 0.15 + t * 0.06)
    };

    requestAnimationFrame((ts) => this._loop(ts));
  }

  _debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  _resizeCanvas() {
    const { canvas, container, ctx } = this;
    const scale = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight || width;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  _loop(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.frameTime += delta * this.config.speed;
    this.accumulator += delta;

    const FRAME_INTERVAL = 1000 / this.config.targetFPS;
    if (this.accumulator >= FRAME_INTERVAL) {
      this.accumulator %= FRAME_INTERVAL;
      this._render();
    }

    requestAnimationFrame((ts) => this._loop(ts));
  }

  _render() {
    const { ctx, canvas, config, frameTime } = this;
    const scale = window.devicePixelRatio || 1;
    const cols = Math.floor((canvas.width / scale) / (config.fontSize * 0.6));
    const rows = Math.floor((canvas.height / scale) / config.fontSize);

    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "top";

    // Get font family from CSS variable
    const fontFamily = getComputedStyle(this.canvas).getPropertyValue('--ascii-font').trim();

    const patternFunc = this.patterns[config.pattern];
    const charArray = config.chars.split("");
    const textRows = config.text.length;
    const textStartRow = Math.floor((rows - textRows) / 2);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const value = patternFunc(x, y, frameTime);
        const charIndex = Math.floor(Math.abs(value) % charArray.length);
        const char = charArray[charIndex] || " ";

        if (y >= textStartRow && y < textStartRow + textRows) {
          const lineIndex = y - textStartRow;
          const textLine = config.text[lineIndex].toUpperCase();

          const isLastLine = lineIndex === config.text.length - 1;
          const currentFontSize = isLastLine
            ? config.fontSize * config.largeScale
            : config.fontSize;
          ctx.font = `${currentFontSize}px ${fontFamily}`;

          const lineCols = Math.floor((canvas.width / scale) / (currentFontSize * 0.6));
          const textStartCol = Math.floor((lineCols - textLine.length) / 2);
          const relX = x - textStartCol;

          if (relX >= 0 && relX < textLine.length) {
            const intensity = Math.abs(Math.sin(value * 0.1)) * 0.7 + 0.3;
            ctx.fillStyle =
              config.color +
              Math.floor(intensity * 255)
                .toString(16)
                .padStart(2, "0");
            ctx.fillText(
              textLine[relX],
              x * currentFontSize * 0.6,
              y * currentFontSize
            );
            continue;
          }
        }

        if (Math.random() > config.density) continue;
        const alpha = Math.floor(
          (Math.abs(Math.sin(value * 0.1)) * 0.5 + 0.1) * 255)
          .toString(16)
          .padStart(2, "0");
        ctx.fillStyle = config.color + alpha;
        ctx.font = `${config.fontSize}px ${fontFamily}`;
        ctx.fillText(char, x * config.fontSize * 0.6, y * config.fontSize);
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new AsciiArtAnimator("ascii-art-embed", {
    text: ["tackle tacit", "tackle taste", "tisane"],
    color: "#c2e222",
    fontSize: 16,
    density: 0.3,
    targetFPS: 24,
    speed: 0.08,
    largeScale: 1.5 
  });
});