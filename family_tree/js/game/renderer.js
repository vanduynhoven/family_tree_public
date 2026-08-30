// ═══════════════════════════════════════════════════════════════
//  RENDERER — Tile cache, drawing, Octopath-style visuals
// ═══════════════════════════════════════════════════════════════
import { TILE } from './entities.js';

export const T = {
  GRASS:0, WALL:1, WATER:2, SAND:3, ROAD:4, TREE:5,
  ROCK:6, FLOWER:7, WHEAT:8, BRICK:9, PLANK:10,
  COBBLE:11, PORTAL:12, SNOW:13, STEEL:14, CIRCUIT:15,
  CORN:16, SHIP:17, HOUSE_WALL:18, HOUSE_ROOF:19, DEEP_WATER:20,
  PINE:21, CLIFF:22, BRIDGE:23, DOOR:24
};

// Tiles that block movement
// Tiles that block movement — only true obstacles
export const SOLID_TYPES = new Set([T.WALL,T.WATER,T.TREE,T.ROCK,T.BRICK,
  T.CORN,T.HOUSE_WALL,T.DEEP_WATER,T.CLIFF,T.PINE]);

const cache = {};
let currentEraId = 0;

// Era color palettes (Octopath-inspired warm/cool shifts per era)
const ERA_PALETTE = [
  {sky:'#6a9fcc',ground:'#3d7a44',fog:'rgba(210,220,180,0.12)',light:'#ffe8b0'}, // 0 medieval
  {sky:'#7ab0d8',ground:'#4a8848',fog:'rgba(220,240,200,0.1)', light:'#fff4c0'}, // 1 golden age
  {sky:'#7888a0',ground:'#3a5c38',fog:'rgba(180,190,200,0.14)',light:'#e0e8c8'}, // 2 napoleonic
  {sky:'#605050',ground:'#3a3028',fog:'rgba(160,140,100,0.18)',light:'#d0b880'}, // 3 industrial
  {sky:'#3a6888',ground:'#1a4060',fog:'rgba(100,160,200,0.15)',light:'#c0e0f0'}, // 4 ship/ocean
  {sky:'#80c0e0',ground:'#60a840',fog:'rgba(200,240,200,0.1)', light:'#fffff0'}, // 5 minnesota
  {sky:'#b0a0d0',ground:'#408040',fog:'rgba(200,200,240,0.12)',light:'#e8e0f0'}, // 6 suburban
  {sky:'#c0d8f0',ground:'#508040',fog:'rgba(200,220,240,0.1)', light:'#f0f8ff'}, // 7 modern
];

export function setEra(id) { currentEraId = id; }

export function getTile(type) {
  const key = `${type}_${currentEraId}`;
  if(cache[key]) return cache[key];
  const c = document.createElement('canvas');
  c.width = c.height = TILE;
  const ctx = c.getContext('2d');
  const S = TILE;
  const pal = ERA_PALETTE[currentEraId] || ERA_PALETTE[0];

  // ── Tile drawing ───────────────────────────────────────────
  switch(type) {
    case T.GRASS: {
      const g=ctx.createLinearGradient(0,0,S,S);
      g.addColorStop(0,'#2d6b3a'); g.addColorStop(0.5,'#3a8044'); g.addColorStop(1,'#285e32');
      ctx.fillStyle=g; ctx.fillRect(0,0,S,S);
      // Noise
      for(let y=0;y<S;y+=3) for(let x=0;x<S;x+=3) {
        if(Math.sin(x*1.3+y*0.7+type)*0.5+0.5>0.6) { ctx.fillStyle='rgba(80,160,80,0.2)'; ctx.fillRect(x,y,3,3); }
      }
      // Blades
      for(let i=0;i<8;i++) {
        const bx=4+i*5, by=S-14+Math.sin(i*2)*4;
        ctx.fillStyle='#4faa5a'; ctx.fillRect(bx,by,2,9); ctx.fillRect(bx+1,by-3,1,5);
      }
      ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.fillRect(0,S-4,S,4);
      break;
    }
    case T.WATER: case T.DEEP_WATER: {
      const deep = type===T.DEEP_WATER;
      const g=ctx.createLinearGradient(0,0,0,S);
      g.addColorStop(0,deep?'#0a2a4a':'#1a5a9a');
      g.addColorStop(1,deep?'#051828':'#123070');
      ctx.fillStyle=g; ctx.fillRect(0,0,S,S);
      for(let y=4;y<S-4;y+=6) {
        ctx.fillStyle=`rgba(100,200,255,${0.08+Math.sin(y*0.4)*0.04})`;
        ctx.fillRect(2+Math.sin(y*0.3)*3,y,S-6,2);
      }
      ctx.fillStyle='rgba(200,240,255,0.2)';
      ctx.fillRect(4,8,10,2); ctx.fillRect(22,16,8,2); ctx.fillRect(36,10,12,2);
      break;
    }
    case T.WALL: case T.BRICK: case T.HOUSE_WALL: {
      const c1 = type===T.HOUSE_WALL?'#8a7060':type===T.BRICK?'#7a3020':'#5a4a3a';
      const c2 = type===T.HOUSE_WALL?'#6a5040':type===T.BRICK?'#5a2010':'#3a2a1a';
      ctx.fillStyle=c2; ctx.fillRect(0,0,S,S);
      for(let row=0;row<S/12;row++) {
        const off=(row%2)*12;
        for(let col=-1;col<S/24+1;col++) {
          const bx=col*24+off, by=row*12;
          const v=100+Math.sin(col*7+row*11)*15;
          ctx.fillStyle=`rgb(${type===T.BRICK?v+30:v},${type===T.BRICK?v-10:v-5},${type===T.BRICK?v-20:v-8})`;
          ctx.fillRect(bx+1,by+1,22,10);
          ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(bx+1,by+1,22,1);
          ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(bx+1,by+10,22,1);
          if((col+row)%4===0){ctx.fillStyle='rgba(50,80,30,0.4)'; ctx.fillRect(bx+3,by+3,4,3);}
        }
      }
      break;
    }
    case T.HOUSE_ROOF: {
      ctx.fillStyle='#7a3020'; ctx.fillRect(0,0,S,S);
      for(let y=0;y<S;y+=6) {
        ctx.fillStyle=y%12<6?'#8a3822':'#6a2818';
        ctx.fillRect(0,y,S,6);
      }
      ctx.fillStyle='rgba(255,200,150,0.1)'; ctx.fillRect(0,0,S,S);
      break;
    }
    case T.TREE: {
      ctx.clearRect(0,0,S,S);
      // Shadow
      ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(S/2+2,S-2,14,6,0,0,Math.PI*2); ctx.fill();
      // Trunk
      const tg=ctx.createLinearGradient(S/2-4,0,S/2+4,0);
      tg.addColorStop(0,'#3a1a08'); tg.addColorStop(0.4,'#5a2a10'); tg.addColorStop(1,'#2a1004');
      ctx.fillStyle=tg; ctx.fillRect(S/2-4,S/2+4,8,S/2-6);
      // Roots
      ctx.fillStyle='#4a2008'; ctx.fillRect(S/2-8,S-7,5,4); ctx.fillRect(S/2+3,S-7,5,4);
      // Canopy layers
      [['#183a10',14],['#1e4e18',13],['#287828',11],['#30902e',9],['#3aaa34',7]].forEach(([c,r],i)=>{
        ctx.fillStyle=c; ctx.beginPath(); ctx.arc(S/2+(i%2?2:-2),S/2-6+i*2,r,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle='rgba(180,255,130,0.15)'; ctx.beginPath(); ctx.arc(S/2-3,S/2-12,4,0,Math.PI*2); ctx.fill();
      break;
    }
    case T.PINE: {
      ctx.clearRect(0,0,S,S);
      ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(S/2,S,10,4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#3a2010'; ctx.fillRect(S/2-3,S*0.6,6,S*0.4);
      [S*0.1,S*0.25,S*0.42,S*0.6].forEach((y,i)=>{
        const w=S*0.5-i*4;
        ctx.fillStyle=['#1a4a20','#1e5a26','#22662c','#287832'][i];
        ctx.beginPath(); ctx.moveTo(S/2,y); ctx.lineTo(S/2+w,y+S*0.22); ctx.lineTo(S/2-w,y+S*0.22); ctx.closePath(); ctx.fill();
      });
      break;
    }
    case T.ROCK: {
      ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(S/2+2,S-2,S/2-4,5,0,0,Math.PI*2); ctx.fill();
      const rg=ctx.createLinearGradient(4,6,S-4,S-4);
      rg.addColorStop(0,'#8a8280'); rg.addColorStop(0.5,'#706868'); rg.addColorStop(1,'#504848');
      ctx.fillStyle=rg; ctx.beginPath(); ctx.ellipse(S/2,S/2,S/2-5,S/2-8,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(S/2-5,S/2-7,7,4,-0.3,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(40,30,30,0.5)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(S/2-3,S/2-2); ctx.lineTo(S/2+7,S/2+7); ctx.stroke();
      break;
    }
    case T.CLIFF: {
      const cg=ctx.createLinearGradient(0,0,0,S);
      cg.addColorStop(0,'#6a5a4a'); cg.addColorStop(1,'#3a2a1a');
      ctx.fillStyle=cg; ctx.fillRect(0,0,S,S);
      for(let y=4;y<S;y+=8) {
        ctx.fillStyle=`rgba(255,200,150,${0.05+Math.sin(y)*0.03})`; ctx.fillRect(0,y,S,2);
      }
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(0,0,S,2);
      break;
    }
    case T.SAND: {
      const sg=ctx.createLinearGradient(0,0,S,S);
      sg.addColorStop(0,'#d4b84a'); sg.addColorStop(1,'#b89030');
      ctx.fillStyle=sg; ctx.fillRect(0,0,S,S);
      for(let y=3;y<S;y+=5) { ctx.fillStyle=`rgba(255,240,160,${0.07+Math.sin(y*0.4)*0.04})`; ctx.fillRect(0,y,S,2); }
      ['#b09030','#c8a040','#a07820'].forEach((c,i)=>{
        ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(8+i*14,10+i*8,4,2.5,i*0.5,0,Math.PI*2); ctx.fill();
      });
      break;
    }
    case T.ROAD: case T.COBBLE: {
      ctx.fillStyle='#4a3a28'; ctx.fillRect(0,0,S,S);
      const ss=[[2,2,14,10],[18,2,14,10],[34,2,10,10],[2,14,12,10],[16,14,16,10],[34,14,10,10],
                 [2,26,14,10],[18,26,14,10],[34,26,10,10],[2,38,12,8],[16,38,16,8],[34,38,10,8]];
      ss.forEach(([x,y,w,h])=>{
        const v=85+Math.sin(x*0.4+y*0.3)*18;
        ctx.fillStyle=`rgb(${v},${v-5},${v-9})`; ctx.fillRect(x+1,y+1,w-2,h-2);
        ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(x+1,y+1,w-2,1);
        ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(x+1,y+h-2,w-2,1);
      });
      break;
    }
    case T.PLANK: case T.BRIDGE: {
      const pg=ctx.createLinearGradient(0,0,S,0);
      pg.addColorStop(0,'#6a4018'); pg.addColorStop(0.5,'#8a5828'); pg.addColorStop(1,'#6a4018');
      ctx.fillStyle=pg; ctx.fillRect(0,0,S,S);
      [8,16,24,32,40].forEach(y=>{ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(0,y,S,2);});
      for(let y=0;y<S;y+=2){ctx.fillStyle=`rgba(255,190,90,${0.03+Math.sin(y*0.5)*0.025})`;ctx.fillRect(0,y,S,1);}
      [[12,12],[36,12],[12,36],[36,36]].forEach(([x,y])=>{
        ctx.fillStyle='#444'; ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(x-0.5,y-0.5,1,0,Math.PI*2); ctx.fill();
      });
      break;
    }
    case T.FLOWER: {
      ctx.fillStyle='#2d6b3a'; ctx.fillRect(0,0,S,S);
      for(let y=0;y<S;y+=3) for(let x=0;x<S;x+=3) {
        if(Math.sin(x*1.1+y*0.8)*0.5+0.5>0.65){ctx.fillStyle='rgba(60,140,60,0.3)';ctx.fillRect(x,y,3,3);}
      }
      const fd=[[8,10,'#ff4466',4],[20,20,'#ffcc00',4],[32,8,'#66aaff',3],[14,32,'#ff66cc',4],[38,28,'#ff8844',3],[24,4,'#aa66ff',4]];
      fd.forEach(([fx,fy,fc,r])=>{
        ctx.fillStyle='#3a6020'; ctx.fillRect(fx,fy+r+2,2,10);
        ctx.fillStyle=fc; ctx.beginPath(); ctx.arc(fx+1,fy+r/2,r+1,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#ffee80'; ctx.beginPath(); ctx.arc(fx+1,fy+r/2,r-1,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(fx,fy+r/2-1,1.2,0,Math.PI*2); ctx.fill();
      });
      break;
    }
    case T.WHEAT: {
      ctx.fillStyle='#3a5020'; ctx.fillRect(0,0,S,S);
      ctx.fillStyle='#4a3018'; ctx.fillRect(0,S-8,S,8);
      for(let i=0;i<7;i++){
        const wx=3+i*6;
        ctx.fillStyle='#7a6018'; ctx.fillRect(wx,S-20,2,14);
        ctx.fillStyle='#c8a030'; ctx.fillRect(wx-2,S-32,6,14);
        ctx.fillStyle='#e0c050'; ctx.fillRect(wx-1,S-34,4,8);
        ctx.fillStyle='rgba(255,255,100,0.25)'; ctx.fillRect(wx,S-32,1,10);
      }
      break;
    }
    case T.CORN: {
      ctx.fillStyle='#1a4a0a'; ctx.fillRect(0,0,S,S);
      for(let i=0;i<4;i++){
        const cx=5+i*11;
        const cg=ctx.createLinearGradient(cx,0,cx+4,0);
        cg.addColorStop(0,'#3a7010'); cg.addColorStop(1,'#5a9020');
        ctx.fillStyle=cg; ctx.fillRect(cx,2,4,S-4);
        ctx.fillStyle='#3a6a18'; ctx.beginPath(); ctx.ellipse(cx-5,S/2,6,3,-0.5,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+9,S/2-6,6,3,0.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#d4c040'; ctx.fillRect(cx-1,S/2-10,6,12);
        for(let k=0;k<3;k++){ctx.fillStyle='#e8d050'; ctx.fillRect(cx,S/2-8+k*4,4,3);}
      }
      break;
    }
    case T.PORTAL: {
      ctx.fillStyle='#040008'; ctx.fillRect(0,0,S,S);
      for(let r2=S/2-2;r2>3;r2-=5){
        const hue=260+r2*3;
        ctx.strokeStyle=`hsl(${hue},90%,${30+r2}%)`; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(S/2,S/2,r2,0,Math.PI*2); ctx.stroke();
      }
      const pg=ctx.createRadialGradient(S/2,S/2,2,S/2,S/2,S/2);
      pg.addColorStop(0,'rgba(220,160,255,0.8)'); pg.addColorStop(0.5,'rgba(120,60,200,0.4)'); pg.addColorStop(1,'rgba(60,0,120,0)');
      ctx.fillStyle=pg; ctx.fillRect(0,0,S,S);
      // Sparkles
      [[S/2-10,S/2-8],[S/2+8,S/2-10],[S/2-6,S/2+10],[S/2+12,S/2+6]].forEach(([sx,sy])=>{
        ctx.fillStyle='rgba(255,220,255,0.8)';
        ctx.fillRect(sx,sy,2,2); ctx.fillRect(sx+1,sy-3,1,8); ctx.fillRect(sx-3,sy+1,8,1);
      });
      ctx.font='16px serif'; ctx.textAlign='center'; ctx.fillStyle='rgba(200,100,255,0.6)';
      ctx.fillText('⏰',S/2,S/2+5);
      break;
    }
    case T.SHIP: {
      const sg=ctx.createLinearGradient(0,0,0,S);
      sg.addColorStop(0,'#4a2c0e'); sg.addColorStop(1,'#2a1008');
      ctx.fillStyle=sg; ctx.fillRect(0,0,S,S);
      [8,16,24,32,40].forEach(y=>{ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,y,S,2);});
      for(let y=0;y<S;y+=2){ctx.fillStyle=`rgba(200,140,60,${0.04+Math.sin(y*0.5)*0.025})`;ctx.fillRect(0,y,S,1);}
      ctx.fillStyle='#101010'; ctx.fillRect(0,8,S,1); ctx.fillRect(0,24,S,1); ctx.fillRect(0,40,S,1);
      break;
    }
    case T.STEEL: {
      const metg=ctx.createLinearGradient(0,0,0,S);
      metg.addColorStop(0,'#909aaa'); metg.addColorStop(0.4,'#6a7880'); metg.addColorStop(1,'#505860');
      ctx.fillStyle=metg; ctx.fillRect(0,0,S,S);
      [[8,8],[40,8],[8,40],[40,40],[24,24]].forEach(([rx,ry])=>{
        ctx.fillStyle='#404850'; ctx.beginPath(); ctx.arc(rx,ry,3,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(rx-0.7,ry-0.7,1.3,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.fillRect(0,S/2-1,S,2);
      break;
    }
    case T.CIRCUIT: {
      ctx.fillStyle='#080f09'; ctx.fillRect(0,0,S,S);
      ctx.strokeStyle='#18b038'; ctx.lineWidth=2;
      [[{x:4,y:S/2},{x:S/2,y:S/2},{x:S/2,y:6}],[{x:S-4,y:S/2},{x:S/2+2,y:S/2},{x:S/2+2,y:S-6}]].forEach(pts=>{
        ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y); pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke();
      });
      [[4,S/2],[S-4,S/2],[S/2,4],[S/2,S-4],[S/2,S/2]].forEach(([x,y])=>{
        ctx.fillStyle='#18b038'; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#080f09'; ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle='rgba(24,180,56,0.06)'; ctx.fillRect(0,0,S,S);
      break;
    }
    case T.SNOW: {
      const sg2=ctx.createLinearGradient(0,0,0,S);
      sg2.addColorStop(0,'#e8f4fc'); sg2.addColorStop(1,'#c8d8e8');
      ctx.fillStyle=sg2; ctx.fillRect(0,0,S,S);
      for(let y=3;y<S;y+=5) for(let x=3;x<S;x+=5) {
        if(Math.sin(x*1.2+y*0.9)*0.5+0.5>0.7){ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();}
      }
      break;
    }
    case T.DOOR: {
      ctx.fillStyle='#5a3010'; ctx.fillRect(0,0,S,S);
      const dg=ctx.createLinearGradient(4,2,S-4,S);
      dg.addColorStop(0,'#8a5028'); dg.addColorStop(1,'#5a3010');
      ctx.fillStyle=dg; ctx.fillRect(4,2,S-8,S-2);
      ctx.fillStyle='#c8a030'; ctx.beginPath(); ctx.arc(S-10,S/2,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(4,2,S-8,2);
      ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1; ctx.strokeRect(4,2,S-8,S-2);
      break;
    }
    default: {
      ctx.fillStyle='#444'; ctx.fillRect(0,0,S,S);
    }
  }

  // Era atmospheric tint
  const tints=['rgba(255,240,200,0.07)','rgba(200,230,255,0.06)','rgba(180,190,210,0.09)',
               'rgba(180,160,130,0.11)','rgba(120,180,220,0.1)','rgba(210,240,200,0.06)',
               'rgba(200,200,240,0.08)','rgba(220,240,255,0.06)'];
  ctx.fillStyle=tints[currentEraId]||tints[0]; ctx.fillRect(0,0,S,S);

  // Subtle pixel-art border
  ctx.fillStyle='rgba(0,0,0,0.05)'; ctx.fillRect(0,0,S,1); ctx.fillRect(0,0,1,S);
  ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(0,S-1,S,1); ctx.fillRect(S-1,0,1,S);

  cache[key]=c; return c;
}

// Draw a complete screen of tiles
export function drawTiles(ctx, tileMap, rows, cols, cameraX, cameraY, canvasW, canvasH) {
  const ox = cameraX, oy = cameraY;
  const sc = Math.max(0,~~(ox/TILE)), ec = Math.min(cols, ~~((ox+canvasW)/TILE)+2);
  const sr = Math.max(0,~~(oy/TILE)), er = Math.min(rows, ~~((oy+canvasH)/TILE)+2);
  for(let r=sr;r<er;r++) for(let c=sc;c<ec;c++) {
    const t = tileMap[r]?.[c] ?? 0;
    if(t===0) continue; // skip air
    ctx.drawImage(getTile(t), c*TILE-ox, r*TILE-oy, TILE, TILE);
    // Draw base grass under transparent things
    if(t===T.FLOWER||t===T.WHEAT) ctx.drawImage(getTile(T.GRASS), c*TILE-ox, r*TILE-oy, TILE, TILE);
  }
  for(let r=sr;r<er;r++) for(let c=sc;c<ec;c++) {
    const t = tileMap[r]?.[c] ?? 0;
    if(t===T.FLOWER||t===T.WHEAT||t===T.CORN||t===T.PORTAL) {
      ctx.drawImage(getTile(T.GRASS), c*TILE-ox, r*TILE-oy, TILE, TILE);
      ctx.drawImage(getTile(t), c*TILE-ox, r*TILE-oy, TILE, TILE);
    }
  }
}

// Draw sky background
export function drawSky(ctx, eraId, w, h, frame) {
  const pal = ERA_PALETTE[eraId]||ERA_PALETTE[0];
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,pal.sky); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

  // Clouds (animated slowly)
  ctx.fillStyle='rgba(255,255,255,0.12)';
  const cf=frame*0.3;
  [[100,30,60,18],[250,50,80,20],[400,25,50,15],[600,40,70,18],[800,30,55,16]].forEach(([cx,cy,cw,ch])=>{
    const x=(cx+cf)%w-40;
    ctx.beginPath(); ctx.ellipse(x,cy,cw,ch,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+20,cy-8,cw*0.6,ch*0.6,0,0,Math.PI*2); ctx.fill();
  });
}
