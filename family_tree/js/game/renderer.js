// ═══════════════════════════════════════════════════════════════
//  RENDERER — HD-2D Octopath Traveler style tiles
//  96×96px tiles with layered lighting, depth, rich detail
// ═══════════════════════════════════════════════════════════════
import { TILE } from './entities.js';

export const T = {
  GRASS:0, WALL:1, WATER:2, SAND:3, ROAD:4, TREE:5,
  ROCK:6, FLOWER:7, WHEAT:8, BRICK:9, PLANK:10,
  COBBLE:11, PORTAL:12, SNOW:13, STEEL:14, CIRCUIT:15,
  CORN:16, SHIP:17, HOUSE_WALL:18, HOUSE_ROOF:19, DEEP_WATER:20,
  PINE:21, CLIFF:22, BRIDGE:23, DOOR:24
};

export const SOLID_TYPES = new Set([T.WALL,T.WATER,T.TREE,T.ROCK,T.BRICK,
  T.CORN,T.HOUSE_WALL,T.DEEP_WATER,T.CLIFF,T.PINE]);

const cache = {};
let eraId = 0;

// ── Era lighting (Octopath warm sunlight shifts per era) ──────
const ERA_LIGHT = [
  {sun:'rgba(255,220,140,0.18)',amb:'rgba(100,140,80,0.1)',sky:'#4a8ab8',horizon:'#8abcd4'},  // medieval: warm morning
  {sun:'rgba(255,240,180,0.15)',amb:'rgba(120,180,100,0.1)',sky:'#5a9ccc',horizon:'#9acce4'}, // golden age: bright noon
  {sun:'rgba(200,210,220,0.12)',amb:'rgba(80,90,110,0.12)',sky:'#607898',horizon:'#9ab0c4'},  // napoleonic: overcast
  {sun:'rgba(180,140,80,0.20)',amb:'rgba(100,80,40,0.15)',sky:'#504038',horizon:'#908070'},   // industrial: smoky sepia
  {sun:'rgba(180,220,255,0.18)',amb:'rgba(60,100,160,0.12)',sky:'#2a5878',horizon:'#6090b8'}, // ocean: blue-grey
  {sun:'rgba(240,255,200,0.16)',amb:'rgba(120,180,80,0.1)',sky:'#60aad0',horizon:'#a0d4e8'},  // minnesota: clear summer
  {sun:'rgba(220,200,240,0.12)',amb:'rgba(100,80,140,0.1)',sky:'#8878b0',horizon:'#b8acd8'},  // suburban: dusk purple
  {sun:'rgba(220,240,255,0.14)',amb:'rgba(100,140,180,0.1)',sky:'#90b8d8',horizon:'#c0d8f0'}, // modern: clear sky
];

export function setEra(id) { eraId = id; }

// ── HD-2D drawing helpers ─────────────────────────────────────
// Fills a rect with a vertical light gradient (Octopath top-lit)
function litRect(ctx,x,y,w,h,baseColor,lightMult=1.3,darkMult=0.65) {
  const [r,g,b]=hexRGB(baseColor);
  const grd=ctx.createLinearGradient(x,y,x,y+h);
  grd.addColorStop(0,`rgb(${~~Math.min(255,r*lightMult)},${~~Math.min(255,g*lightMult)},${~~Math.min(255,b*lightMult)})`);
  grd.addColorStop(0.4,`rgb(${r},${g},${b})`);
  grd.addColorStop(1,`rgb(${~~(r*darkMult)},${~~(g*darkMult)},${~~(b*darkMult)})`);
  ctx.fillStyle=grd; ctx.fillRect(x,y,w,h);
}

// Shadow underneath an object
function dropShadow(ctx,cx,cy,rx,ry) {
  ctx.fillStyle='rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.fill();
}

// Outline highlight (Octopath bright edge)
function edgeHighlight(ctx,x,y,w,h,alpha=0.25) {
  ctx.strokeStyle=`rgba(255,255,255,${alpha})`; ctx.lineWidth=1.5;
  ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
}

// Noise texture overlay
function noiseLayer(ctx,S,r,g,b,amp=25) {
  for(let py=0;py<S;py+=2) for(let px=0;px<S;px+=2) {
    const n=(Math.sin(px*1.3+py*0.9+eraId*7)*0.5+0.5)*amp-amp/2;
    ctx.fillStyle=`rgba(${~~Math.max(0,r+n)},${~~Math.max(0,g+n)},${~~Math.max(0,b+n)},0.35)`;
    ctx.fillRect(px,py,2,2);
  }
}

function hexRGB(hex) {
  const n=parseInt(hex.replace('#',''),16);
  return [(n>>16)&255,(n>>8)&255,n&255];
}

// ── TILE FACTORY ─────────────────────────────────────────────
export function getTile(type) {
  const key=`${type}_${eraId}`;
  if(cache[key]) return cache[key];
  const cv=document.createElement('canvas');
  cv.width=cv.height=TILE;
  const c=cv.getContext('2d');
  const S=TILE;
  const EL=ERA_LIGHT[eraId]||ERA_LIGHT[0];

  switch(type) {

    // ── GRASS ── rich multi-layer vegetation ─────────────────
    case T.GRASS: {
      // Base: dark→light gradient (Octopath ground-to-sky bounce)
      const bg=c.createLinearGradient(0,0,0,S);
      bg.addColorStop(0,'#38874a'); bg.addColorStop(0.5,'#2d7040'); bg.addColorStop(1,'#225834');
      c.fillStyle=bg; c.fillRect(0,0,S,S);
      // Mid-layer texture patches
      [[0.15,'#46a05a'],[0.4,'#3a9050'],[0.65,'#288040'],[0.85,'#1e6830']].forEach(([a,col])=>{
        c.fillStyle=col;
        for(let i=0;i<12;i++) {
          const px=Math.sin(i*2.3+a*10)*S/2+S/2+Math.cos(i*1.7)*12;
          const py=Math.cos(i*3.1+a*7)*S/2+S/2+Math.sin(i*2.1)*8;
          c.beginPath(); c.ellipse(~~px,~~py,4+Math.sin(i)*2,3,i*0.3,0,Math.PI*2); c.fill();
        }
      });
      // Grass blades (Octopath-style tall and tapered)
      for(let i=0;i<14;i++) {
        const bx=4+i*6+(i%3)*2, by=S-18+(i%4)*3;
        const ht=10+Math.sin(i*1.9)*5;
        const col=['#5ac86a','#48bc5a','#60d068','#3aaa50'][i%4];
        c.fillStyle=col; c.fillRect(bx,by-ht,2,ht);
        c.fillStyle='rgba(255,255,255,0.35)'; c.fillRect(bx,by-ht,1,ht/2); // highlight
        c.fillRect(bx-1,by-ht+1,1,4); // tip highlight
      }
      // Ground-level darkness
      const shadow=c.createLinearGradient(0,S-6,0,S);
      shadow.addColorStop(0,'rgba(0,0,0,0)'); shadow.addColorStop(1,'rgba(0,0,0,0.22)');
      c.fillStyle=shadow; c.fillRect(0,S-6,S,6);
      // Sunlight patch
      c.fillStyle=EL.sun; c.fillRect(0,0,S,S);
      break;
    }

    // ── WATER ── animated shimmer ────────────────────────────
    case T.WATER: case T.DEEP_WATER: {
      const deep=type===T.DEEP_WATER;
      const wg=c.createLinearGradient(0,0,0,S);
      if(deep){wg.addColorStop(0,'#0d2a42');wg.addColorStop(1,'#061420');}
      else{wg.addColorStop(0,'#1a6aaa');wg.addColorStop(0.4,'#1560a0');wg.addColorStop(1,'#0e3878');}
      c.fillStyle=wg; c.fillRect(0,0,S,S);
      // Caustic light patterns
      for(let y=0;y<S;y+=8) {
        c.fillStyle=`rgba(100,200,255,${0.06+Math.sin(y*0.3+eraId)*0.04})`;
        c.fillRect(Math.sin(y*0.2)*4,y,S,4);
      }
      // Surface highlights
      c.strokeStyle='rgba(180,230,255,0.25)'; c.lineWidth=2;
      [[10,14,22,16],[30,22,40,20],[8,32,18,34],[36,30,46,28]].forEach(([x1,y1,x2,y2])=>{
        c.beginPath(); c.moveTo(x1,y1); c.bezierCurveTo(x1+4,y1-3,x2-4,y2-3,x2,y2); c.stroke();
      });
      // Foam/edge
      c.fillStyle='rgba(220,240,255,0.15)'; c.fillRect(0,0,S,2); c.fillRect(0,0,2,S);
      // Depth overlay
      if(deep){c.fillStyle='rgba(0,0,40,0.35)'; c.fillRect(0,0,S,S);}
      break;
    }

    // ── BRICK / WALL ─────────────────────────────────────────
    case T.BRICK: case T.WALL: case T.HOUSE_WALL: {
      const base=type===T.BRICK?'#7a3020':type===T.HOUSE_WALL?'#8a7060':'#5a4a3a';
      const mortar=type===T.BRICK?'#3a1a10':type===T.HOUSE_WALL?'#4a3828':'#2a1a10';
      // Mortar base
      c.fillStyle=mortar; c.fillRect(0,0,S,S);
      // Brick rows (Octopath: thick, varied, well-shadowed)
      const BH=12, BW=S/2-2;
      for(let row=0;row<S/BH+1;row++) {
        const off=(row%2)*(BW+2);
        for(let col=-1;col<3;col++) {
          const bx=col*(BW+2)+off, by=row*BH;
          const v=Math.sin(col*7.3+row*4.1)*0.15;
          const [r,g,b]=hexRGB(base);
          const lr=~~Math.min(255,r*(1.2+v)),lg=~~Math.min(255,g*(1.1+v)),lb=~~Math.min(255,b*(1.1+v));
          const dr=~~(r*0.7),dg=~~(g*0.7),db=~~(b*0.65);
          const bg2=c.createLinearGradient(bx,by,bx,by+BH-2);
          bg2.addColorStop(0,`rgb(${lr},${lg},${lb})`);
          bg2.addColorStop(0.6,`rgb(${r},${g},${b})`);
          bg2.addColorStop(1,`rgb(${dr},${dg},${db})`);
          c.fillStyle=bg2; c.fillRect(bx+1,by+1,BW,BH-2);
          // Top edge highlight
          c.fillStyle='rgba(255,255,255,0.22)'; c.fillRect(bx+1,by+1,BW,1);
          // Bottom shadow
          c.fillStyle='rgba(0,0,0,0.3)'; c.fillRect(bx+1,by+BH-2,BW,1);
          // Moss (1/4 chance)
          if((row+col)%4===0){c.fillStyle='rgba(60,100,40,0.4)'; c.fillRect(bx+3,by+2,6,3);}
        }
      }
      // Crack
      c.strokeStyle='rgba(0,0,0,0.25)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(S*0.2,S*0.1); c.lineTo(S*0.28,S*0.4); c.lineTo(S*0.22,S*0.7); c.stroke();
      break;
    }

    // ── HOUSE ROOF ──────────────────────────────────────────
    case T.HOUSE_ROOF: {
      const rg=c.createLinearGradient(0,0,0,S);
      rg.addColorStop(0,'#c04028'); rg.addColorStop(0.5,'#983020'); rg.addColorStop(1,'#702018');
      c.fillStyle=rg; c.fillRect(0,0,S,S);
      // Tile rows
      for(let y=0;y<S;y+=8) {
        c.fillStyle=y%16<8?'rgba(255,120,80,0.1)':'rgba(0,0,0,0.12)'; c.fillRect(0,y,S,8);
        c.fillStyle='rgba(0,0,0,0.2)'; c.fillRect(0,y,S,1);
      }
      c.fillStyle='rgba(255,180,150,0.18)'; c.fillRect(0,0,S,4); // top edge highlight
      break;
    }

    // ── TREE ── Octopath multi-layered canopy ────────────────
    case T.TREE: {
      c.clearRect(0,0,S,S);
      // Ground shadow
      dropShadow(c,S/2+4,S-4,S/2-10,8);
      // Trunk with bark detail
      const tg=c.createLinearGradient(S/2-6,0,S/2+6,0);
      tg.addColorStop(0,'#2a1204'); tg.addColorStop(0.35,'#5a2810'); tg.addColorStop(0.7,'#7a3818'); tg.addColorStop(1,'#3a1a08');
      c.fillStyle=tg; c.fillRect(S/2-5,S*0.5+2,10,S*0.5-4);
      // Bark lines
      c.strokeStyle='rgba(0,0,0,0.3)'; c.lineWidth=1;
      for(let y=S*0.55;y<S-4;y+=6) { c.beginPath(); c.moveTo(S/2-4,y); c.lineTo(S/2-2,y+3); c.stroke(); }
      // Root flare
      c.fillStyle='#3a1a08'; c.fillRect(S/2-9,S-9,5,5); c.fillRect(S/2+4,S-9,5,5);
      // Canopy — 5 overlapping circles with strong light/shadow
      const layers=[
        {r:22,dx:0,dy:6,c:'#1a4a10',sh:true},
        {r:20,dx:-5,dy:4,c:'#205818'},
        {r:19,dx:5,dy:3,c:'#1c5014'},
        {r:18,dx:0,dy:-2,c:'#286a20'},
        {r:16,dx:-3,dy:-5,c:'#30802a'},
        {r:14,dx:4,dy:-8,c:'#389032'},
        {r:10,dx:-6,dy:-14,c:'#46aa3c'},
        {r:8, dx:2, dy:-18,c:'#58c048',hi:true},
      ];
      layers.forEach(({r,dx,dy,c:col,hi,sh})=>{
        if(sh){c.fillStyle='rgba(0,0,0,0.2)';c.beginPath();c.arc(S/2+dx+3,S/2+dy+3,r,0,Math.PI*2);c.fill();}
        const cg=c.createRadialGradient(S/2+dx-r*0.3,S/2+dy-r*0.3,r*0.1,S/2+dx,S/2+dy,r);
        const [cr,cg2,cb]=hexRGB(col);
        cg.addColorStop(0,`rgb(${~~Math.min(255,cr*1.5)},${~~Math.min(255,cg2*1.5)},${~~Math.min(255,cb*1.4)})`);
        cg.addColorStop(0.5,col);
        cg.addColorStop(1,`rgb(${~~(cr*0.55)},${~~(cg2*0.55)},${~~(cb*0.5)})`);
        c.fillStyle=cg; c.beginPath(); c.arc(S/2+dx,S/2+dy,r,0,Math.PI*2); c.fill();
        if(hi){c.fillStyle='rgba(220,255,160,0.35)';c.beginPath();c.arc(S/2+dx-3,S/2+dy-4,5,0,Math.PI*2);c.fill();}
      });
      break;
    }

    // ── PINE ─────────────────────────────────────────────────
    case T.PINE: {
      c.clearRect(0,0,S,S);
      dropShadow(c,S/2+3,S-2,12,5);
      c.fillStyle='#4a2810'; c.fillRect(S/2-4,S*0.65,8,S*0.35);
      [[S*0.06,S*0.28,'#0e4018'],[S*0.2,S*0.38,'#124e20'],[S*0.32,S*0.5,'#185e28'],[S*0.46,S*0.62,'#1e6e30']].forEach(([y,wh,col],i)=>{
        const w=S*0.55-i*6;
        const pg=c.createLinearGradient(S/2-w,y,S/2+w,y+wh);
        pg.addColorStop(0,'rgba(255,255,255,0.08)'); pg.addColorStop(0.5,col); pg.addColorStop(1,`rgba(0,0,0,0.4)`);
        c.fillStyle=pg;
        c.beginPath(); c.moveTo(S/2,y); c.lineTo(S/2+w,y+wh); c.lineTo(S/2-w,y+wh); c.closePath(); c.fill();
        c.fillStyle='rgba(255,255,255,0.12)'; c.beginPath();
        c.moveTo(S/2,y+2); c.lineTo(S/2+w*0.4,y+wh*0.3); c.lineTo(S/2,y+wh*0.1); c.closePath(); c.fill();
      });
      break;
    }

    // ── ROCK ─────────────────────────────────────────────────
    case T.ROCK: {
      c.clearRect(0,0,S,S);
      dropShadow(c,S/2+3,S-3,S/2-8,7);
      const rkg=c.createRadialGradient(S/2-8,S/2-8,4,S/2,S/2,S/2-4);
      rkg.addColorStop(0,'#aaa098'); rkg.addColorStop(0.4,'#908880'); rkg.addColorStop(0.8,'#706860'); rkg.addColorStop(1,'#504840');
      c.fillStyle=rkg; c.beginPath(); c.ellipse(S/2,S/2,S/2-6,S/2-9,0,0,Math.PI*2); c.fill();
      // Bright highlight
      c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(S/2-8,S/2-10,7,4,-0.4,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.15)'; c.beginPath(); c.ellipse(S/2-4,S/2-6,12,6,-0.3,0,Math.PI*2); c.fill();
      // Cracks
      c.strokeStyle='rgba(40,30,30,0.45)'; c.lineWidth=1.2;
      c.beginPath(); c.moveTo(S*0.38,S*0.38); c.lineTo(S*0.55,S*0.55); c.lineTo(S*0.62,S*0.7); c.stroke();
      c.beginPath(); c.moveTo(S*0.42,S*0.3); c.lineTo(S*0.35,S*0.55); c.stroke();
      break;
    }

    // ── COBBLE / ROAD ─────────────────────────────────────────
    case T.COBBLE: case T.ROAD: {
      c.fillStyle='#4a3c2c'; c.fillRect(0,0,S,S);
      const stones=[
        [2,2,20,15],[24,2,20,15],[46,2,18,15],[66,2,20,15],[84,4,10,12],
        [2,19,18,15],[22,19,22,15],[46,19,20,15],[68,19,18,15],[88,20,6,13],
        [2,36,22,15],[26,36,20,15],[48,36,18,15],[68,36,22,15],[92,37,2,13],
        [2,53,20,15],[24,53,22,15],[48,53,20,15],[70,53,20,15],[92,54,2,13],
        [2,70,18,14],[22,70,22,14],[46,70,20,14],[68,70,20,14],[90,71,4,12],
      ];
      stones.forEach(([sx,sy,sw,sh])=>{
        const v=85+Math.sin(sx*0.4+sy*0.3)*22;
        const sg=c.createLinearGradient(sx,sy,sx,sy+sh);
        sg.addColorStop(0,`rgb(${~~Math.min(255,v*1.2)},${~~Math.min(255,v*1.15)},${~~Math.min(255,v*1.1)})`);
        sg.addColorStop(0.5,`rgb(${v},${~~(v*0.95)},${~~(v*0.9)})`);
        sg.addColorStop(1,`rgb(${~~(v*0.7)},${~~(v*0.68)},${~~(v*0.65)})`);
        c.fillStyle=sg; c.fillRect(sx+1,sy+1,sw-2,sh-2);
        c.fillStyle='rgba(255,255,255,0.18)'; c.fillRect(sx+1,sy+1,sw-2,1);
        c.fillStyle='rgba(0,0,0,0.28)'; c.fillRect(sx+1,sy+sh-2,sw-2,1); c.fillRect(sx+sw-2,sy+1,1,sh-2);
      });
      break;
    }

    // ── PLANK / SHIP DECK / BRIDGE ────────────────────────────
    case T.PLANK: case T.SHIP: case T.BRIDGE: {
      const col=type===T.SHIP?'#4a2c10':type===T.BRIDGE?'#7a5428':'#8a5c2a';
      const dark=type===T.SHIP?'#2a1408':'#5a3c18';
      c.fillStyle=dark; c.fillRect(0,0,S,S);
      // Planks
      const ph=14;
      for(let y=0;y<S;y+=ph) {
        const pg=c.createLinearGradient(0,y,0,y+ph);
        pg.addColorStop(0,'rgba(255,200,120,0.15)');
        pg.addColorStop(0.3,col);
        pg.addColorStop(1,`rgba(0,0,0,0.3)`);
        c.fillStyle=pg; c.fillRect(0,y+1,S,ph-2);
        // Grain
        for(let x=0;x<S;x+=4){
          const gn=Math.sin(x*0.2+y*0.5)*8;
          c.fillStyle=`rgba(255,200,100,${0.04+Math.abs(gn)*0.006})`; c.fillRect(x,y+2,3,ph-4);
        }
        // Nail heads
        [S*0.12,S*0.5,S*0.88].forEach(nx=>{
          c.fillStyle='#2a1a0a'; c.beginPath(); c.arc(nx,y+ph/2,2.5,0,Math.PI*2); c.fill();
          c.fillStyle='rgba(255,255,255,0.25)'; c.beginPath(); c.arc(nx-0.8,y+ph/2-0.8,1,0,Math.PI*2); c.fill();
        });
        c.fillStyle='rgba(0,0,0,0.35)'; c.fillRect(0,y,S,1);
      }
      c.fillStyle='rgba(255,200,120,0.08)'; c.fillRect(0,0,8,S); // side highlight
      break;
    }

    // ── FLOWER ───────────────────────────────────────────────
    case T.FLOWER: {
      // Grass base
      const fg=c.createLinearGradient(0,0,0,S);
      fg.addColorStop(0,'#38874a'); fg.addColorStop(1,'#245c32');
      c.fillStyle=fg; c.fillRect(0,0,S,S);
      // Rich flower bed
      const flowers=[
        [12,14,'#ff3366',8],[28,22,'#ffcc00',7],[48,12,'#44aaff',8],
        [64,24,'#ff66cc',7],[18,36,'#ff8844',7],[54,38,'#cc44ff',8],
        [76,14,'#ff3366',6],[38,46,'#66ff44',6],[62,52,'#ffee44',7],
        [8,48,'#ff4488',7],[80,42,'#3388ff',6],
      ];
      flowers.forEach(([fx,fy,col,r])=>{
        // Stem
        c.strokeStyle='#3a7020'; c.lineWidth=2;
        c.beginPath(); c.moveTo(fx,fy+r+2); c.lineTo(fx,fy+r+12); c.stroke();
        // Shadow
        c.fillStyle='rgba(0,0,0,0.15)'; c.beginPath(); c.ellipse(fx+2,fy+r+2,r,r*0.4,0,0,Math.PI*2); c.fill();
        // Petals
        for(let p=0;p<6;p++){
          const a=p*Math.PI/3;
          c.fillStyle=col;
          c.beginPath(); c.ellipse(fx+Math.cos(a)*r*0.7,fy+Math.sin(a)*r*0.7,r*0.55,r*0.4,a,0,Math.PI*2); c.fill();
        }
        // Center
        const cg=c.createRadialGradient(fx,fy,0,fx,fy,r*0.45);
        cg.addColorStop(0,'#ffee80'); cg.addColorStop(1,'#cc9900');
        c.fillStyle=cg; c.beginPath(); c.arc(fx,fy,r*0.45,0,Math.PI*2); c.fill();
        // Sparkle
        c.fillStyle='rgba(255,255,255,0.5)'; c.beginPath(); c.arc(fx-r*0.2,fy-r*0.2,r*0.15,0,Math.PI*2); c.fill();
      });
      c.fillStyle=EL.sun; c.fillRect(0,0,S,S);
      break;
    }

    // ── WHEAT ────────────────────────────────────────────────
    case T.WHEAT: {
      c.fillStyle='#2a4a18'; c.fillRect(0,0,S,S);
      c.fillStyle='#3a3010'; c.fillRect(0,S-10,S,10);
      for(let i=0;i<10;i++){
        const wx=6+i*9+(i%3)*3, sw=Math.sin(i*2.1+eraId)*4;
        c.strokeStyle='#7a6018'; c.lineWidth=2;
        c.beginPath(); c.moveTo(wx,S-8); c.bezierCurveTo(wx+sw,S-22,wx-sw*0.5,S-36,wx+sw*0.5,S-44); c.stroke();
        const wg=c.createLinearGradient(wx-3,S-44,wx+3,S-22);
        wg.addColorStop(0,'#d8c040'); wg.addColorStop(0.6,'#b89828'); wg.addColorStop(1,'#987818');
        c.fillStyle=wg; c.fillRect(wx-3,S-44,6,18);
        c.fillStyle='rgba(255,240,100,0.3)'; c.fillRect(wx-1,S-44,2,10);
      }
      c.fillStyle=EL.sun; c.fillRect(0,0,S,S);
      break;
    }

    // ── CORN ─────────────────────────────────────────────────
    case T.CORN: {
      c.fillStyle='#1a4808'; c.fillRect(0,0,S,S);
      for(let i=0;i<5;i++){
        const cx=10+i*16;
        c.strokeStyle='#3a7010'; c.lineWidth=3;
        c.beginPath(); c.moveTo(cx,S-4); c.bezierCurveTo(cx+3,S*0.4,cx-3,S*0.2,cx+2,4); c.stroke();
        // Leaves
        c.fillStyle='#4a8820';
        c.beginPath(); c.ellipse(cx+14,S*0.6,12,4,-0.4,0,Math.PI*2); c.fill();
        c.fillStyle='#3a7818';
        c.beginPath(); c.ellipse(cx-12,S*0.4,10,3,0.4,0,Math.PI*2); c.fill();
        // Ear
        const eg=c.createLinearGradient(cx-4,S*0.3,cx+4,S*0.3);
        eg.addColorStop(0,'#e0c840'); eg.addColorStop(1,'#b89820');
        c.fillStyle=eg; c.fillRect(cx-4,S*0.28,8,16);
        // Kernels
        for(let k=0;k<4;k++){ c.fillStyle='rgba(255,240,60,0.4)'; c.fillRect(cx-3,S*0.3+k*3.5,6,3); }
        // Husk
        c.strokeStyle='rgba(180,240,80,0.4)'; c.lineWidth=1; c.beginPath(); c.moveTo(cx-4,S*0.28); c.lineTo(cx+4,S*0.44); c.stroke();
      }
      break;
    }

    // ── PORTAL ── glowing Octopath-style ────────────────────
    case T.PORTAL: {
      c.fillStyle='#02000a'; c.fillRect(0,0,S,S);
      // Outer purple rings with glow
      for(let r=S/2-4;r>6;r-=9){
        const hue=270+r*1.5, lt=25+r*0.8;
        c.strokeStyle=`hsl(${hue},90%,${lt}%)`; c.lineWidth=2.5;
        c.shadowColor=`hsl(${hue},90%,50%)`; c.shadowBlur=12;
        c.beginPath(); c.arc(S/2,S/2,r,0,Math.PI*2); c.stroke();
      }
      c.shadowBlur=0;
      // Inner glow
      const pg2=c.createRadialGradient(S/2,S/2,4,S/2,S/2,S/2-4);
      pg2.addColorStop(0,'rgba(240,180,255,0.95)');
      pg2.addColorStop(0.3,'rgba(160,80,240,0.7)');
      pg2.addColorStop(0.7,'rgba(80,20,160,0.4)');
      pg2.addColorStop(1,'rgba(20,0,60,0)');
      c.fillStyle=pg2; c.fillRect(0,0,S,S);
      // Sparkles
      [[S/2-16,S/2-12],[S/2+14,S/2-16],[S/2-10,S/2+16],[S/2+18,S/2+10],[S/2-4,S/2-24]].forEach(([sx,sy])=>{
        c.fillStyle='rgba(255,220,255,0.9)';
        c.fillRect(sx-1,sy-5,2,10); c.fillRect(sx-5,sy-1,10,2);
        c.fillStyle='rgba(255,255,255,0.5)'; c.beginPath(); c.arc(sx,sy,2,0,Math.PI*2); c.fill();
      });
      c.font=`bold ${S*0.3}px serif`; c.textAlign='center'; c.fillStyle='rgba(220,150,255,0.7)';
      c.shadowColor='rgba(200,100,255,0.8)'; c.shadowBlur=20;
      c.fillText('⏰',S/2,S/2+S*0.12); c.shadowBlur=0;
      break;
    }

    // ── SAND ─────────────────────────────────────────────────
    case T.SAND: {
      const sg=c.createLinearGradient(0,0,S,S);
      sg.addColorStop(0,'#d8c258'); sg.addColorStop(0.5,'#c8aa40'); sg.addColorStop(1,'#a88828');
      c.fillStyle=sg; c.fillRect(0,0,S,S);
      for(let y=4;y<S;y+=6){ c.fillStyle=`rgba(255,240,150,${0.06+Math.sin(y*0.5)*0.04})`; c.fillRect(0,y,S,3); }
      [['#b09030',4,8],['#c8a840',18,16],['#a88020',38,6],['#d0b848',56,20],['#b09828',72,10]].forEach(([col,px,py])=>{
        c.fillStyle=col; c.beginPath(); c.ellipse(px,py,5,3,(px%3)*0.3,0,Math.PI*2); c.fill();
        c.fillStyle='rgba(255,255,200,0.2)'; c.beginPath(); c.arc(px-1.5,py-1.5,1.5,0,Math.PI*2); c.fill();
      });
      break;
    }

    // ── STEEL / CIRCUIT ───────────────────────────────────────
    case T.STEEL: {
      const mg=c.createLinearGradient(0,0,0,S);
      mg.addColorStop(0,'#a0aab8'); mg.addColorStop(0.3,'#788090'); mg.addColorStop(0.7,'#8898a8'); mg.addColorStop(1,'#586070');
      c.fillStyle=mg; c.fillRect(0,0,S,S);
      for(let y=0;y<S;y+=12){ c.fillStyle=`rgba(255,255,255,${0.06+Math.sin(y*0.4)*0.04})`; c.fillRect(0,y,S,4); }
      c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(0,S/2); c.lineTo(S,S/2); c.stroke();
      [[S*0.15,S*0.15],[S*0.85,S*0.15],[S*0.15,S*0.85],[S*0.85,S*0.85],[S/2,S/2]].forEach(([rx,ry])=>{
        c.fillStyle='#445058'; c.beginPath(); c.arc(rx,ry,4,0,Math.PI*2); c.fill();
        c.fillStyle='rgba(255,255,255,0.4)'; c.beginPath(); c.arc(rx-1,ry-1,1.5,0,Math.PI*2); c.fill();
      });
      break;
    }

    case T.CIRCUIT: {
      c.fillStyle='#080f09'; c.fillRect(0,0,S,S);
      c.strokeStyle='#18c038'; c.lineWidth=2.5;
      c.shadowColor='#18c038'; c.shadowBlur=8;
      [[{x:4,y:S/2},{x:S/2,y:S/2},{x:S/2,y:6}],
       [{x:S-4,y:S/2},{x:S/2+4,y:S/2},{x:S/2+4,y:S-6}],
       [{x:S/2,y:S-4},{x:S/2,y:S*0.7}]].forEach(pts=>{
        c.beginPath(); c.moveTo(pts[0].x,pts[0].y); pts.slice(1).forEach(p=>c.lineTo(p.x,p.y)); c.stroke();
      });
      [[4,S/2],[S-4,S/2],[S/2,4],[S/2,S-4],[S/2,S/2]].forEach(([px,py])=>{
        c.fillStyle='#18c038'; c.beginPath(); c.arc(px,py,5,0,Math.PI*2); c.fill();
        c.fillStyle='#050e06'; c.beginPath(); c.arc(px,py,2.5,0,Math.PI*2); c.fill();
      });
      c.shadowBlur=0;
      break;
    }

    // ── SNOW ─────────────────────────────────────────────────
    case T.SNOW: {
      const sng=c.createLinearGradient(0,0,0,S);
      sng.addColorStop(0,'#eef8ff'); sng.addColorStop(1,'#c8d8e8');
      c.fillStyle=sng; c.fillRect(0,0,S,S);
      for(let i=0;i<18;i++){
        const sx=Math.sin(i*2.8)*S/2+S/2, sy=Math.cos(i*1.7)*S/2+S/2;
        c.fillStyle='rgba(255,255,255,0.5)'; c.beginPath(); c.arc(sx,sy,2+Math.sin(i)*1,0,Math.PI*2); c.fill();
      }
      c.fillStyle='rgba(180,220,255,0.2)'; c.fillRect(0,0,S,8);
      break;
    }

    // ── DOOR ─────────────────────────────────────────────────
    case T.DOOR: {
      const dg=c.createLinearGradient(4,0,S-4,S);
      dg.addColorStop(0,'#9a5c28'); dg.addColorStop(0.5,'#7a4018'); dg.addColorStop(1,'#5a2c0c');
      c.fillStyle='#3a1808'; c.fillRect(0,0,S,S);
      c.fillStyle=dg; c.fillRect(6,2,S-12,S-2);
      // Panel
      c.fillStyle='rgba(0,0,0,0.2)'; c.fillRect(10,8,S-20,S/2-6); c.fillRect(10,S/2+2,S-20,S/2-8);
      c.fillStyle='rgba(255,200,120,0.15)'; c.fillRect(10,8,S-20,3);
      // Handle
      c.fillStyle='#d4a030';
      c.beginPath(); c.arc(S-16,S/2,5,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(S-16,S/2,4,0,Math.PI*2);
      c.fillStyle='#a87820'; c.fill();
      c.fillStyle='rgba(255,255,255,0.4)'; c.beginPath(); c.arc(S-18,S/2-2,2,0,Math.PI*2); c.fill();
      edgeHighlight(c,6,2,S-12,S-2,0.15);
      break;
    }

    default: {
      c.fillStyle='#333'; c.fillRect(0,0,S,S);
    }
  }

  // ── Era atmospheric lighting pass (Octopath ambient) ─────
  c.fillStyle=EL.sun;  c.fillRect(0,0,S,S);
  c.fillStyle=EL.amb;  c.fillRect(0,0,S,S);

  cache[key]=cv; return cv;
}

// Draw all tiles for a screen
export function drawTiles(ctx, tileMap, rows, cols, camX, camY, cw, ch) {
  const ox=camX, oy=camY;
  const sc=Math.max(0,~~(ox/TILE)), ec=Math.min(cols,~~((ox+cw)/TILE)+2);
  const sr=Math.max(0,~~(oy/TILE)), er=Math.min(rows,~~((oy+ch)/TILE)+2);
  // Draw base layer (non-decorative)
  for(let r=sr;r<er;r++) for(let c2=sc;c2<ec;c2++) {
    const t=tileMap[r]?.[c2]??0;
    if(t===T.FLOWER||t===T.WHEAT||t===T.CORN) {
      ctx.drawImage(getTile(T.GRASS),c2*TILE-ox,r*TILE-oy,TILE,TILE);
    }
    ctx.drawImage(getTile(t),c2*TILE-ox,r*TILE-oy,TILE,TILE);
  }
}

// Sky background (Octopath gradient with bokeh clouds)
export function drawSky(ctx, era, w, h, frame) {
  const EL=ERA_LIGHT[era]||ERA_LIGHT[0];
  const pal=ERA_LIGHT[era]||ERA_LIGHT[0];
  const g=ctx.createLinearGradient(0,0,0,h*0.7);
  g.addColorStop(0,EL.sky); g.addColorStop(1,EL.horizon);
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

  // Bokeh clouds (Octopath soft defocus effect)
  ctx.save();
  const cf=frame*0.15;
  [[w*0.1,h*0.1,70,30],[w*0.3,h*0.06,90,25],[w*0.6,h*0.12,80,22],[w*0.8,h*0.08,60,18]].forEach(([cx,cy,rx,ry])=>{
    const ox2=(cf*0.6)%w;
    const x=(cx+ox2)%w;
    // Blurred soft cloud shape (bokeh)
    const cg=ctx.createRadialGradient(x,cy,2,x,cy,rx);
    cg.addColorStop(0,'rgba(255,255,255,0.22)');
    cg.addColorStop(0.4,'rgba(255,255,255,0.12)');
    cg.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=cg;
    ctx.beginPath(); ctx.ellipse(x,cy,rx,ry,0,0,Math.PI*2); ctx.fill();
    // Secondary puff
    ctx.beginPath(); ctx.ellipse(x+rx*0.4,cy-ry*0.3,rx*0.6,ry*0.6,0,0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}
