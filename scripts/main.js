import { CanvasManager } from "./CanvasManager.js";
import { AsciiPatterns } from "./AsciiPatterns.js";
import { AsciiRenderer } from "./AsciiRenderer.js";
import { Animator } from "./Animator.js";

window.addEventListener("DOMContentLoaded", () => {
  const config = {
    text: ["tackle tacit", "tackle taste", "tisane"],
    chars: "✦✤*✴",
    fontSize: 16,
    color: "#c2e222",
    bgColor: "#000000",
    density: 0.3,
    speed: 0.08,
    targetFPS: 24,
    largeScale: 1.5,
    pattern: Object.keys(AsciiPatterns)[Math.floor(Math.random() * Object.keys(AsciiPatterns).length)]
  };

  const canvasManager = new CanvasManager("ascii-art-embed", config.fontSize);
  config.pattern = config.pattern || "wave";
  const renderer = new AsciiRenderer(canvasManager.ctx, config, AsciiPatterns);
  const animator = new Animator(renderer, config);
  animator.start();
});
