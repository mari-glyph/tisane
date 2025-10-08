export class AsciiRenderer {
  constructor(ctx, config, patterns) {
    this.ctx = ctx;
    this.config = config;
    this.patterns = patterns;
  }

  render(frameTime) {
    const { ctx, config, patterns } = this;
    const canvas = ctx.canvas;
    const scale = window.devicePixelRatio || 1;
    const cols = Math.floor((canvas.width / scale) / (config.fontSize * 0.6));
    const rows = Math.floor((canvas.height / scale) / config.fontSize);

    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "top";
    const fontFamily = getComputedStyle(canvas).getPropertyValue('--ascii-font').trim();
    const patternFunc = patterns[config.pattern];
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
