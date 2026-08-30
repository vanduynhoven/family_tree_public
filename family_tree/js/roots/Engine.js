// ═══════════════════════════════════════════════════════════
//  Engine — requestAnimationFrame loop, input, camera
// ═══════════════════════════════════════════════════════════
export class Engine {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.width   = 0;
    this.height  = 0;
    this.cameraX = 0;
    this.cameraY = 0;

    // Input state
    this.keys = { up:false, down:false, left:false, right:false, action:false, attack:false, fish:false };
    this._actionConsumed  = false;
    this._attackConsumed  = false;
    this._fishConsumed    = false;

    this._lastTime = 0;
    this._frameN   = 0;
    this._tickFn   = null;

    this._bindInput();
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  // ── Public ─────────────────────────────────────────────

  start(tickFn) {
    this._tickFn = tickFn;
    requestAnimationFrame(ts => this._loop(ts));
  }

  stop() { this._tickFn = null; }

  consumeAction()  { if (!this._actionConsumed && this.keys.action)  { this._actionConsumed = true;  return true; } return false; }
  consumeAttack()  { if (!this._attackConsumed && this.keys.attack)  { this._attackConsumed = true;  return true; } return false; }
  consumeFish()    { if (!this._fishConsumed   && this.keys.fish)    { this._fishConsumed   = true;  return true; } return false; }

  /** Smooth camera following the target entity */
  updateCamera(target, tileW, tileH, mapW, mapH) {
    const DEAD_ZONE = 3 * tileW;
    const targetX = target.cx - this.width  / 2;
    const targetY = target.cy - this.height / 2;
    // Clamp to map bounds
    const maxX = mapW * tileW - this.width;
    const maxY = mapH * tileH - this.height;
    this.cameraX += (Math.min(Math.max(targetX, 0), Math.max(maxX, 0)) - this.cameraX) * 0.12;
    this.cameraY += (Math.min(Math.max(targetY, 0), Math.max(maxY, 0)) - this.cameraY) * 0.12;
  }

  // ── Private ────────────────────────────────────────────

  _loop(timestamp) {
    if (!this._tickFn) return;
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05); // cap at 50ms
    this._lastTime = timestamp;
    this._frameN++;
    this._tickFn(dt, this._frameN);
    requestAnimationFrame(ts => this._loop(ts));
  }

  _resize() {
    this.canvas.width  = this.width  = window.innerWidth;
    this.canvas.height = this.height = window.innerHeight;
    this.canvas.style.imageRendering = 'pixelated';
  }

  _bindInput() {
    const K = this.keys;
    const keyMap = {
      ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
      KeyW:'up', KeyS:'down', KeyA:'left', KeyD:'right',
      Space:'action', KeyE:'action', KeyF:'fish',
      KeyX:'attack', ShiftLeft:'attack', ShiftRight:'attack',
    };

    window.addEventListener('keydown', e => {
      const k = keyMap[e.code];
      if (k) {
        if (!K[k]) {                  // fresh press
          if (k === 'action')  this._actionConsumed = false;
          if (k === 'attack')  this._attackConsumed = false;
          if (k === 'fish')    this._fishConsumed   = false;
        }
        K[k] = true;
        if (['Space','KeyE','KeyF','KeyX'].includes(e.code)) e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      const k = keyMap[e.code];
      if (k) { K[k] = false; this._resetConsumed(k); }
    });
  }

  _resetConsumed(key) {
    if (key === 'action') this._actionConsumed = false;
    if (key === 'attack') this._attackConsumed = false;
    if (key === 'fish')   this._fishConsumed   = false;
  }

  // D-pad button support (called from HTML button event listeners)
  dpadDown(dir)  { this.keys[dir] = true;  }
  dpadUp(dir)    { this.keys[dir] = false; }
  buttonPress(k) {
    if (!this.keys[k]) {
      if (k === 'action') this._actionConsumed = false;
      if (k === 'attack') this._attackConsumed = false;
      if (k === 'fish')   this._fishConsumed   = false;
    }
    this.keys[k] = true;
  }
  buttonRelease(k) {
    this.keys[k] = false;
    this._resetConsumed(k);
  }
}
