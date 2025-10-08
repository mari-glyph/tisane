export class Animator {
  constructor(renderer, config) {
    this.renderer = renderer;
    this.config = Object.assign({ targetFPS: 24, speed: 0.08 }, config);
    this.frameTime = 0;
    this.lastTimestamp = 0;
    this.accumulator = 0;
  }

  start() {
    requestAnimationFrame(ts => this._loop(ts));
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
      this.renderer.render(this.frameTime);
    }
    requestAnimationFrame(ts => this._loop(ts));
  }
}
