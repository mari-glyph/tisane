export class AsciiRenderer {
  constructor(ctx, config = {}, patterns = {}) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.patterns = patterns;

    // defaults
    this.config = Object.assign(
      {
        chars: "✦✤*✴",
        fontSize: 16,
        density: 0.3,
        largeScale: 1.5,
        bgColor: '#000',
        color: '#c2e222',
        text: []
      },
      config
    );

    // cache char array
    this._charArray = this.config.chars.split("");

    // cache font family from CSS variable if present
    try {
      const cssFont = getComputedStyle(this.canvas).getPropertyValue('--ascii-font').trim();
      this._fontFamily = cssFont || 'monospace';
    } catch (e) {
      this._fontFamily = 'monospace';
    }

    // parse base color once
    this._baseColor = this._parseHexColor(this.config.color);

    // prepare text cache
    this._prepareTextCache();
  }

  // Call when config.text or config.chars changes
  _prepareTextCache() {
    this._textLines = (this.config.text || []).map(s => String(s).toUpperCase());
    this._textRows = this._textLines.length;
    this._charArray = (this.config.chars || ' ').split("");
  }

  _parseHexColor(hex) {
    if (!hex) return { r: 0, g: 0, b: 0 };
    const h = hex.replace('#', '');
    if (h.length === 3) {
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16)
      };
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }

  render(frameTime) {
    const { ctx, canvas, config, patterns } = this;
    const scale = window.devicePixelRatio || 1;
    const cols = Math.floor((canvas.width / scale) / (config.fontSize * 0.6));
    const rows = Math.floor((canvas.height / scale) / config.fontSize);

    // fill background
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = config.bgColor || '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = 'top';

    const patternFunc = this.patterns[config.pattern];

    const textStartRow = Math.floor((rows - this._textRows) / 2);

    // small seeded PRNG per frame for deterministic randomness using mulberry32
    function mulberry32(seed) {
      let t = seed >>> 0;
      return function() {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), t | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    }
    const rng = mulberry32(Math.floor(frameTime));

    // local references to avoid repeated property lookups
    const base = this._baseColor;
    const density = config.density;
    const charArray = this._charArray;
    const fontBase = this._fontFamily;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const value = patternFunc ? patternFunc(x, y, frameTime) : 0;

        // overlay text if within the text block
        if (this._textRows && y >= textStartRow && y < textStartRow + this._textRows) {
          const lineIndex = y - textStartRow;
          const textLine = this._textLines[lineIndex] || '';
          const isLastLine = lineIndex === this._textRows - 1;
          const currentFontSize = isLastLine ? config.fontSize * config.largeScale : config.fontSize;
          ctx.font = `${currentFontSize}px ${fontBase}`;

          const lineCols = Math.floor((canvas.width / scale) / (currentFontSize * 0.6));
          const textStartCol = Math.floor((lineCols - textLine.length) / 2);
          const relX = x - textStartCol;

          if (relX >= 0 && relX < textLine.length) {
            const intensity = Math.abs(Math.sin(value * 0.1)) * 0.7 + 0.3;
            ctx.fillStyle = `rgba(${base.r}, ${base.g}, ${base.b}, ${intensity.toFixed(3)})`;
            ctx.fillText(textLine[relX], x * currentFontSize * 0.6, y * currentFontSize);
            continue;
          }
        }

  // background ASCII characters
  if (density <= 0) continue;
  const rnd = rng();
  if (rnd > density) continue;

        const charIndex = Math.floor(Math.abs(value) % charArray.length);
        const char = charArray[charIndex] || ' ';
        const intensity = Math.abs(Math.sin(value * 0.1)) * 0.5 + 0.1;
        ctx.fillStyle = `rgba(${base.r}, ${base.g}, ${base.b}, ${intensity.toFixed(3)})`;
        ctx.font = `${config.fontSize}px ${fontBase}`;
        ctx.fillText(char, x * config.fontSize * 0.6, y * config.fontSize);
      }
    }
  }

  destroy() {
    // null big caches so GC can reclaim
    this._charArray = null;
    this._textLines = null;
    this._baseColor = null;
    this.patterns = null;
    this.ctx = null;
    this.canvas = null;
  }
}
