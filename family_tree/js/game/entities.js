// ═══════════════════════════════════════════════════════════════
//  ENTITIES — Player, NPC, Enemy base classes
//  OOP architecture: Entity → Player / NPC / Enemy
// ═══════════════════════════════════════════════════════════════
export const TILE = 48;
export const SOLID = new Set([1,2,9,10,11,14]); // wall,water,brick,plank,cobble,steel

// ── BASE ENTITY ──────────────────────────────────────────────
export class Entity {
  constructor(x, y, w=TILE*0.6, h=TILE*0.8) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.vx = 0; this.vy = 0;
    this.facing = 'down'; // up/down/left/right
    this.frame = 0;
    this.alive = true;
  }
  get cx() { return this.x + this.w/2; }
  get cy() { return this.y + this.h/2; }
  get rect() { return {x:this.x,y:this.y,w:this.w,h:this.h}; }

  overlaps(other) {
    return this.x < other.x+other.w && this.x+this.w > other.x &&
           this.y < other.y+other.h && this.y+this.h > other.y;
  }
  distTo(other) {
    return Math.hypot(this.cx-other.cx, this.cy-other.cy);
  }
  update(dt, world) {}
  draw(ctx, ox, oy, frame) {}
}

// ── PLAYER ───────────────────────────────────────────────────
export class Player extends Entity {
  constructor(x, y) {
    super(x, y, TILE*0.55, TILE*0.75);
    this.speed = 180; // px/sec
    this.hp = 100;
    this.maxHp = 100;
    this.inventory = [];
    this.collectedFacts = [];
    this.walkCycle = 0;
    this.hurtTimer = 0;
    this.hairColor = '#f5d060';
    this.bodyColor = '#3a7aaa';
    this.skinColor = '#f5c890';
  }

  hasItem(id) { return this.inventory.some(i=>i.id===id); }

  collectItem(item) {
    if(!item || this.hasItem(item.id)) return false;
    this.inventory.push(item);
    return true;
  }

  takeDamage(amt) {
    if(this.hurtTimer > 0) return;
    this.hp = Math.max(0, this.hp - amt);
    this.hurtTimer = 1.2; // invincibility frames
    // Flash effect
    const el = document.getElementById('damage-flash');
    if(el) { el.style.background='rgba(255,0,0,0.4)'; setTimeout(()=>el.style.background='',200); }
  }

  update(dt, keys, world) {
    if(this.hurtTimer > 0) this.hurtTimer -= dt;
    let dx=0, dy=0;
    if(keys.left)  dx=-1;
    if(keys.right) dx= 1;
    if(keys.up)    dy=-1;
    if(keys.down)  dy= 1;
    if(dx&&dy) { dx*=0.707; dy*=0.707; }
    if(dx<0) this.facing='left';
    if(dx>0) this.facing='right';
    if(dy<0) this.facing='up';
    if(dy>0) this.facing='down';

    const spd = this.speed * dt;
    const nx = this.x + dx*spd, ny = this.y + dy*spd;

    // Axis-separated collision
    const pad=4;
    if(dx!==0 && !world.solidAt(nx+pad, this.y+pad) && !world.solidAt(nx+this.w-pad, this.y+pad) &&
                  !world.solidAt(nx+pad, this.y+this.h-pad) && !world.solidAt(nx+this.w-pad, this.y+this.h-pad))
      this.x = nx;
    if(dy!==0 && !world.solidAt(this.x+pad, ny+pad) && !world.solidAt(this.x+this.w-pad, ny+pad) &&
                  !world.solidAt(this.x+pad, ny+this.h-pad) && !world.solidAt(this.x+this.w-pad, ny+this.h-pad))
      this.y = ny;

    if(dx!==0||dy!==0) this.walkCycle += dt * 8;
  }

  draw(ctx, ox, oy, frame) {
    const sx = this.x - ox, sy = this.y - oy;
    const t = frame, bob = Math.sin(this.walkCycle)*2;
    const hurt = this.hurtTimer>0 && Math.sin(frame*20)>0;
    if(hurt) ctx.globalAlpha=0.5;

    // Octopath-style: rich pixel character with shadow + outline
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(sx+this.w/2,sy+this.h+2,this.w/2-4,5,0,0,Math.PI*2); ctx.fill();

    // Legs with walk animation
    const legSwing = Math.sin(this.walkCycle)*6;
    ctx.fillStyle='#2a5a8a';
    ctx.fillRect(sx+6,  sy+this.h-14+bob, 10, 16);
    ctx.fillRect(sx+16, sy+this.h-14+bob, 10, 16);
    // Shoe
    ctx.fillStyle='#1a1a2a';
    ctx.fillRect(sx+4,  sy+this.h+2+bob, 12, 5);
    ctx.fillRect(sx+14, sy+this.h+2+bob, 12, 5);

    // Body / cloak
    const bodyGrd = ctx.createLinearGradient(sx, sy+16, sx+this.w, sy+16);
    bodyGrd.addColorStop(0,'#2a6a9a'); bodyGrd.addColorStop(1,'#1a4a7a');
    ctx.fillStyle=bodyGrd;
    ctx.fillRect(sx+4, sy+14+bob, this.w-8, 22);

    // Belt
    ctx.fillStyle='#c8a030'; ctx.fillRect(sx+4, sy+28+bob, this.w-8, 3);

    // Arms
    ctx.fillStyle='#3a7aaa';
    if(this.facing==='left')  { ctx.fillRect(sx+this.w-4,sy+16+bob,6,12); }
    else if(this.facing==='right') { ctx.fillRect(sx-2,sy+16+bob,6,12); }
    else { ctx.fillRect(sx+1,sy+16+bob,5,12); ctx.fillRect(sx+this.w-6,sy+16+bob,5,12); }

    // Head
    ctx.fillStyle=this.skinColor;
    ctx.fillRect(sx+8, sy+2+bob, this.w-16, 14);

    // Hair (Octopath-style layered)
    ctx.fillStyle=this.hairColor;
    ctx.fillRect(sx+6,  sy+bob,    this.w-12, 6);
    ctx.fillRect(sx+4,  sy+2+bob,  4, 10);
    ctx.fillRect(sx+this.w-8, sy+2+bob, 4, 10);

    // Eyes (direction-dependent)
    ctx.fillStyle='#2a2a3a';
    if(this.facing==='up') {
      // No eyes visible
    } else if(this.facing==='left') {
      ctx.fillRect(sx+8, sy+7+bob, 3, 3);
    } else if(this.facing==='right') {
      ctx.fillRect(sx+this.w-12, sy+7+bob, 3, 3);
    } else {
      ctx.fillRect(sx+10, sy+7+bob, 3, 3);
      ctx.fillRect(sx+this.w-14, sy+7+bob, 3, 3);
      // Eye whites
      ctx.fillStyle='#fff'; ctx.fillRect(sx+9,sy+6+bob,5,4); ctx.fillRect(sx+this.w-15,sy+6+bob,5,4);
      ctx.fillStyle='#2a2a3a'; ctx.fillRect(sx+10,sy+7+bob,3,3); ctx.fillRect(sx+this.w-14,sy+7+bob,3,3);
    }

    // Outline highlight (Octopath style)
    ctx.strokeStyle='rgba(255,255,255,0.15)';
    ctx.lineWidth=1;
    ctx.strokeRect(sx+4, sy+bob, this.w-8, this.h);

    if(hurt) ctx.globalAlpha=1;
  }
}

// ── NPC ──────────────────────────────────────────────────────
export class NPC extends Entity {
  constructor(data, x, y) {
    super(x, y, TILE*0.55, TILE*0.75);
    this.data = data;
    this.name = data.name;
    this.lines = data.lines || ["Hello, traveler!"];
    this.item = data.item || null;
    this.talked = false;
    this.bodyColor = data.bodyColor || '#6a5a3a';
    this.hatColor = data.hatColor || '#3a2a10';
    this.skinColor = data.skinColor || '#e8b870';
    // Wander movement
    this.wanderTimer = Math.random()*3;
    this.wanderDx = 0; this.wanderDy = 0;
    this.wanderSpeed = 40;
    this.homeX = x; this.homeY = y;
    this.walkCycle = Math.random()*Math.PI*2;
  }

  update(dt, world) {
    this.wanderTimer -= dt;
    if(this.wanderTimer <= 0) {
      // Pick new wander direction (or stop)
      const r = Math.random();
      if(r < 0.3) { this.wanderDx=0; this.wanderDy=0; this.wanderTimer=1+Math.random()*2; }
      else {
        const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
        const [dx,dy]=dirs[Math.floor(Math.random()*4)];
        this.wanderDx=dx; this.wanderDy=dy;
        this.wanderTimer=0.5+Math.random()*1.5;
      }
    }

    if(this.wanderDx!==0||this.wanderDy!==0) {
      const spd=this.wanderSpeed*dt;
      const nx=this.x+this.wanderDx*spd, ny=this.y+this.wanderDy*spd;
      // Stay near home
      if(Math.hypot(nx-this.homeX,ny-this.homeY)<TILE*3) {
        const pad=4;
        if(!world.solidAt(nx+pad,this.y+pad)&&!world.solidAt(nx+this.w-pad,this.y+pad)&&
           !world.solidAt(nx+pad,this.y+this.h-pad)&&!world.solidAt(nx+this.w-pad,this.y+this.h-pad))
          this.x=nx;
        if(!world.solidAt(this.x+pad,ny+pad)&&!world.solidAt(this.x+this.w-pad,ny+pad)&&
           !world.solidAt(this.x+pad,ny+this.h-pad)&&!world.solidAt(this.x+this.w-pad,ny+this.h-pad))
          this.y=ny;
      }
      this.walkCycle+=dt*6;
      if(this.wanderDx<0) this.facing='left';
      if(this.wanderDx>0) this.facing='right';
      if(this.wanderDy<0) this.facing='up';
      if(this.wanderDy>0) this.facing='down';
    }
  }

  draw(ctx, ox, oy, frame) {
    const sx=this.x-ox, sy=this.y-oy;
    const bob=Math.sin(this.walkCycle)*1.5;

    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(sx+this.w/2,sy+this.h+2,this.w/2-4,4,0,0,Math.PI*2); ctx.fill();

    // Legs
    ctx.fillStyle='#3a3020'; ctx.fillRect(sx+6,sy+this.h-12+bob,9,14); ctx.fillRect(sx+16,sy+this.h-12+bob,9,14);
    ctx.fillStyle='#1a1010'; ctx.fillRect(sx+4,sy+this.h+2+bob,11,4); ctx.fillRect(sx+14,sy+this.h+2+bob,11,4);

    // Body
    ctx.fillStyle=this.bodyColor; ctx.fillRect(sx+4,sy+12+bob,this.w-8,22);

    // Hat
    ctx.fillStyle=this.hatColor; ctx.fillRect(sx+5,sy+bob,this.w-10,7); ctx.fillRect(sx+3,sy+4+bob,this.w-6,5);

    // Head
    ctx.fillStyle=this.skinColor; ctx.fillRect(sx+7,sy+4+bob,this.w-14,12);

    // Eyes
    ctx.fillStyle='#2a2020';
    if(this.facing!=='up') {
      ctx.fillRect(sx+10,sy+7+bob,3,3); ctx.fillRect(sx+this.w-14,sy+7+bob,3,3);
    }

    // Exclamation if talkable
    if(!this.talked) {
      ctx.fillStyle='#f39c12'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
      ctx.fillText('!', sx+this.w/2, sy-4);
    }

    // Name plate
    ctx.fillStyle='rgba(0,0,0,0.7)';
    const nameShort = this.data.given || this.name.split(' ')[0];
    const nw = nameShort.length*6+8;
    ctx.fillRect(sx+this.w/2-nw/2, sy-20, nw, 13);
    ctx.fillStyle='#f39c12'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(nameShort, sx+this.w/2, sy-10);
  }
}

// ── ENEMY ────────────────────────────────────────────────────
export class Enemy extends Entity {
  constructor(config, x, y) {
    super(x, y, TILE*0.6, TILE*0.7);
    this.config = config;
    this.name = config.name;
    this.emoji = config.emoji;
    this.color = config.color || '#c0302a';
    this.accentColor = config.accent || '#ff4040';
    this.hp = config.hp || 3;
    this.maxHp = this.hp;
    this.speed = config.speed || 60;
    this.damage = config.damage || 15;
    this.chaseRange = config.chaseRange || TILE*5;
    this.attackRange = TILE*0.9;
    this.attackTimer = 0;
    this.state = 'patrol'; // patrol / chase / attack
    this.patrolDx = (Math.random()>0.5)?1:-1;
    this.patrolTimer = 1+Math.random()*2;
    this.walkCycle = Math.random()*Math.PI*2;
    this.homeX = x; this.homeY = y;
    this.hitFlash = 0;
  }

  update(dt, player, world) {
    this.attackTimer = Math.max(0, this.attackTimer-dt);
    this.hitFlash = Math.max(0, this.hitFlash-dt);
    this.walkCycle += dt*7;

    const dist = this.distTo(player);

    if(dist < this.chaseRange) {
      this.state = 'chase';
      // Move toward player
      const dx = player.cx - this.cx, dy = player.cy - this.cy;
      const len = Math.hypot(dx,dy)||1;
      const spd = this.speed*dt;
      const nx=this.x+dx/len*spd, ny=this.y+dy/len*spd;
      const pad=4;
      if(!world.solidAt(nx+pad,this.y+pad)&&!world.solidAt(nx+this.w-pad,this.y+pad)&&
         !world.solidAt(nx+pad,this.y+this.h-pad)&&!world.solidAt(nx+this.w-pad,this.y+this.h-pad))
        this.x=nx;
      if(!world.solidAt(this.x+pad,ny+pad)&&!world.solidAt(this.x+this.w-pad,ny+pad)&&
         !world.solidAt(this.x+pad,ny+this.h-pad)&&!world.solidAt(this.x+this.w-pad,ny+this.h-pad))
        this.y=ny;
      if(dx<0) this.facing='left'; else this.facing='right';

      // Attack
      if(dist < this.attackRange && this.attackTimer<=0) {
        player.takeDamage(this.damage);
        this.attackTimer = 1.2;
      }
    } else {
      this.state = 'patrol';
      // Patrol wander
      this.patrolTimer -= dt;
      if(this.patrolTimer<=0) {
        this.patrolDx = Math.random()<0.5?1:-1;
        this.patrolTimer = 1+Math.random()*2;
      }
      const spd=this.speed*0.4*dt;
      const nx=this.x+this.patrolDx*spd;
      const pad=4;
      if(!world.solidAt(nx+pad,this.y+pad)&&!world.solidAt(nx+this.w-pad,this.y+pad)&&
         !world.solidAt(nx+pad,this.y+this.h-pad)&&!world.solidAt(nx+this.w-pad,this.y+this.h-pad))
        this.x=nx;
      else this.patrolDx*=-1;
      this.facing = this.patrolDx<0?'left':'right';
    }
  }

  hit() {
    this.hp--;
    this.hitFlash = 0.2;
    return this.hp <= 0;
  }

  draw(ctx, ox, oy, frame) {
    const sx=this.x-ox, sy=this.y-oy;
    const bob=Math.sin(this.walkCycle)*2;
    const chasing=this.state==='chase';

    if(this.hitFlash>0) ctx.globalAlpha=0.5;

    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(sx+this.w/2,sy+this.h+2,this.w/2-3,5,0,0,Math.PI*2); ctx.fill();

    // Enemy body — menacing look
    // Legs
    ctx.fillStyle='#1a0808';
    ctx.fillRect(sx+6,sy+this.h-12+bob,10,14); ctx.fillRect(sx+this.w-16,sy+this.h-12+bob,10,14);
    ctx.fillStyle='#0a0404';
    ctx.fillRect(sx+4,sy+this.h+2+bob,12,4); ctx.fillRect(sx+this.w-16,sy+this.h+2+bob,12,4);

    // Body
    const bGrd=ctx.createLinearGradient(sx,sy+8,sx+this.w,sy+this.h);
    bGrd.addColorStop(0,this.color); bGrd.addColorStop(1,this.accentColor);
    ctx.fillStyle=bGrd; ctx.fillRect(sx+3,sy+10+bob,this.w-6,22);

    // Head
    ctx.fillStyle='#2a0808'; ctx.fillRect(sx+6,sy+bob,this.w-12,14);

    // Glowing eyes
    ctx.fillStyle=chasing?'#ffaa00':'#cc2020';
    ctx.fillRect(sx+9,sy+4+bob,5,5); ctx.fillRect(sx+this.w-15,sy+4+bob,5,5);
    // Eye glow
    ctx.shadowColor=chasing?'#ffaa00':'#ff2020'; ctx.shadowBlur=6;
    ctx.fillRect(sx+10,sy+5+bob,3,3); ctx.fillRect(sx+this.w-14,sy+5+bob,3,3);
    ctx.shadowBlur=0;

    // HP bar
    if(this.hp < this.maxHp) {
      ctx.fillStyle='#300'; ctx.fillRect(sx+2,sy-10,this.w-4,5);
      ctx.fillStyle='#e00'; ctx.fillRect(sx+2,sy-10,(this.w-4)*(this.hp/this.maxHp),5);
    }

    // Name
    ctx.fillStyle='rgba(180,0,0,0.8)';
    const nw=this.name.length*5+8;
    ctx.fillRect(sx+this.w/2-nw/2,sy-22,nw,13);
    ctx.fillStyle='#ffaaaa'; ctx.font='8px monospace'; ctx.textAlign='center';
    ctx.fillText(this.name,sx+this.w/2,sy-12);

    if(this.hitFlash>0) ctx.globalAlpha=1;
  }
}

// ── DROPPED ITEM ─────────────────────────────────────────────
export class DroppedItem extends Entity {
  constructor(item, x, y) {
    super(x, y, 24, 24);
    this.item = item;
    this.bobTimer = Math.random()*Math.PI*2;
  }
  update(dt) { this.bobTimer += dt*2; }
  draw(ctx, ox, oy, frame) {
    const sx=this.x-ox+12, sy=this.y-oy+Math.sin(this.bobTimer)*4;
    // Glow ring
    ctx.fillStyle='rgba(243,156,18,0.2)';
    ctx.beginPath(); ctx.arc(sx,sy+8,16,0,Math.PI*2); ctx.fill();
    ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(this.item.icon, sx, sy+8);
    ctx.textBaseline='alphabetic';
  }
}
