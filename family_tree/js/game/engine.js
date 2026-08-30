// ═══════════════════════════════════════════════════════════════
//  ENGINE — Game loop, input, camera
// ═══════════════════════════════════════════════════════════════
import { TILE } from './entities.js';
import { SCREEN_COLS, SCREEN_ROWS } from './eras.js';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.lastTime = 0;
    this.frameCount = 0;
    this.keys = {up:false,down:false,left:false,right:false,action:false};
    this._actionPressed = false;
    this.cameraX = 0;
    this.cameraY = 0;
    this._setupInput();
    this._resize();
    window.addEventListener('resize', ()=>this._resize());
  }

  get width()  { return this.canvas.width;  }
  get height() { return this.canvas.height; }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _setupInput() {
    const map = {
      ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',
      w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right',
      e:'action',E:'action',' ':'action',Enter:'action'
    };
    window.addEventListener('keydown', e => {
      const k=map[e.key];
      if(k) { this.keys[k]=true; if(k==='action')this._actionPressed=true; e.preventDefault(); }
    });
    window.addEventListener('keyup', e => {
      const k=map[e.key];
      if(k) this.keys[k]=false;
    });

    // D-pad
    const dpad={
      'dp-u':'up','dp-d':'down','dp-l':'left','dp-r':'right'
    };
    Object.entries(dpad).forEach(([id,k])=>{
      const btn=document.getElementById(id);
      if(!btn)return;
      const on=e=>{e.preventDefault();this.keys[k]=true;btn.classList.add('p');};
      const off=e=>{e.preventDefault();this.keys[k]=false;btn.classList.remove('p');};
      btn.addEventListener('touchstart',on,{passive:false});
      btn.addEventListener('touchend',off,{passive:false});
      btn.addEventListener('touchcancel',off,{passive:false});
      btn.addEventListener('mousedown',on);
      btn.addEventListener('mouseup',off);
      btn.addEventListener('mouseleave',off);
    });
  }

  consumeAction() {
    const v = this._actionPressed;
    this._actionPressed = false;
    return v;
  }

  updateCamera(player) {
    const worldW = SCREEN_COLS * TILE;
    const worldH = SCREEN_ROWS * TILE;
    const targetX = player.cx - this.width/2;
    const targetY = player.cy - this.height/2;
    this.cameraX += (targetX - this.cameraX) * 0.12;
    this.cameraY += (targetY - this.cameraY) * 0.12;
    this.cameraX = Math.max(0, Math.min(worldW - this.width,  this.cameraX));
    this.cameraY = Math.max(0, Math.min(worldH - this.height, this.cameraY));
  }

  start(loopFn) {
    this.running = true;
    const tick = (ts) => {
      if(!this.running) return;
      const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
      this.lastTime = ts;
      this.frameCount++;
      loopFn(dt, this.frameCount);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(ts => { this.lastTime=ts; requestAnimationFrame(tick); });
  }
}
