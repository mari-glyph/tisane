/**
 * Animator
 * - Handles the requestAnimationFrame loop with stable timestep consumption.
 * - API: start(), stop(), pause(), resume()
 * - Config options: targetFPS, speed, maxDelta (ms), cycleInterval (optional)
 *
 * renderer.render(frameTime) will be called on each logical frame.
 */
export class Animator {
  constructor(renderer, config = {}) {
    this.renderer = renderer;
    this.config = Object.assign(
      { targetFPS: 24, speed: 0.08, maxDelta: 250, cycleInterval: null }, //optional automatic pattern cycling toggle
      config
    );

    this.frameTime = 0;
    this.lastTimestamp = 0;
    this.accumulator = 0;

    // bound loop to avoid allocating a new function each frame
    this._boundLoop = this._loop.bind(this);
    this._rafId = null;
    this._running = false;
    this._paused = false;
    this.lastCycle = 0;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this.lastTimestamp = performance.now();
    this._rafId = requestAnimationFrame(this._boundLoop);
  }

  stop() {
    if (!this._running) return;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
    this._running = false;
    this.frameTime = 0;
    this.lastTimestamp = 0;
    this.accumulator = 0;
  }

  destroy() {
    this.stop();
    this.renderer = null;
    this._boundLoop = null;
  }

  pause() {
    this._paused = true;
  }

  resume() {
    if (!this._running) this.start();
    this._paused = false;
    this.lastTimestamp = performance.now();
  }

  _loop(timestamp) {
    if (!this._running) return;
    if (this._paused) {
      this.lastTimestamp = timestamp;
      this._rafId = requestAnimationFrame(this._boundLoop);
      return;
    }

    let delta = timestamp - this.lastTimestamp;
    // clamp large deltas (tab switching, debugger pause)
    if (delta > this.config.maxDelta) delta = this.config.maxDelta;
    this.lastTimestamp = timestamp;

    this.frameTime += delta * this.config.speed;
    this.accumulator += delta;
    
    const FRAME_INTERVAL = 1000 / this.config.targetFPS;
    // consume accumulator; use while to avoid drifting
    while (this.accumulator >= FRAME_INTERVAL) {
      this.accumulator -= FRAME_INTERVAL;
      // one logical frame
      this.renderer.render(this.frameTime);
    }

    this._rafId = requestAnimationFrame(this._boundLoop);
  }
}
