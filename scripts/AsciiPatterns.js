export const AsciiPatterns = {
  wave: (x, y, t) =>
    Math.sin(x * 0.1 + t * 0.05) * 5 + Math.cos(y * 0.1 + t * 0.05) * 5,
  ripple: (x, y, t) =>
    Math.sin(Math.sqrt((x - 40) ** 2 + (y - 15) ** 2) * 0.05 - t * 0.1) * 10,
  spiral: (x, y, t) => Math.atan2(y - 15, x - 40) * 5 + t * 0.1,
  plasma: (x, y, t) =>
    Math.sin(x * 0.2 + t * 0.05) +
    Math.sin(y * 0.2 + t * 0.07) +
    Math.sin((x + y) * 0.15 + t * 0.06)
};
