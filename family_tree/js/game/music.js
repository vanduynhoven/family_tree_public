// ═══════════════════════════════════════════════════════════════
//  MUSIC — 8-bit chiptune engine, per-era tracks
// ═══════════════════════════════════════════════════════════════
const N={};
'C,C#,D,D#,E,F,F#,G,G#,A,A#,B'.split(',').forEach((n,i)=>{
  for(let o=2;o<=7;o++) N[n+o]=440*Math.pow(2,((o-4)*12+i-9)/12);
});

const TRACKS=[
  {bpm:72,sw:0,wv:'triangle',mel:[[N.D4,1,.7],[N.E4,1,.6],[N.F4,1,.7],[N.A4,1,.65],[N.G4,1,.6],[N.F4,.5,.6],[N.E4,.5,.55],[N.D4,2,.7],[N.A3,1,.5],[N.C4,1,.55],[N.D4,1,.65],[N.E4,1,.6],[N.F4,1.5,.7],[N.E4,.5,.55],[N.D4,2,.75]],bas:[[N.D3,2,.4],[N.A3,2,.35],[N.D3,2,.4],[N.C3,2,.35],[N.A2,2,.4],[N.D3,2,.35],[N.A2,4,.3]],drm:[]},
  {bpm:120,sw:0,wv:'sawtooth',mel:[[N.G4,.5,.7],[N.A4,.5,.65],[N.B4,.5,.7],[N.D5,.5,.75],[N.D5,.5,.65],[N.C5,.5,.6],[N.B4,.5,.65],[N.A4,.5,.6],[N.G4,.5,.7],[N.F4,.5,.55],[N.E4,.5,.6],[N.D4,.5,.65],[N.G4,1,.7],[N.A4,.5,.65],[N.B4,.5,.6],[N.C5,1,.72],[N.B4,.5,.6],[N.A4,.5,.55],[N.G4,2,.75],[0,2,0]],bas:[[N.G2,1,.35],[N.B2,1,.3],[N.D3,1,.32],[N.G3,1,.3],[N.A2,1,.35],[N.C3,1,.3],[N.E3,1,.3],[N.A3,1,.28],[N.D3,2,.35],[N.G2,2,.3]],drm:[]},
  {bpm:100,sw:0,wv:'square',mel:[[N.A4,.5,.75],[N.A4,.5,.5],[N.E4,1,.7],[N.F4,.5,.72],[N.F4,.5,.5],[N.C4,1,.65],[N.A4,.5,.75],[N.G4,.5,.65],[N.F4,.5,.7],[N.E4,.5,.65],[N.D4,2,.7],[N.E4,.5,.7],[N.E4,.5,.55],[N.A4,.5,.72],[N.A4,.5,.55],[N.G4,.5,.65],[N.F4,.5,.6],[N.E4,1,.7],[N.A4,2,.75],[0,2,0]],bas:[[N.A2,1,.4],[N.E2,1,.35],[N.A2,1,.4],[N.A2,1,.35],[N.F2,1,.38],[N.C3,1,.32],[N.F2,1,.38],[N.C3,1,.32],[N.E2,2,.4],[N.A2,2,.35]],drm:[{s:0,t:'snare'},{s:2,t:'kick'},{s:4,t:'snare'},{s:6,t:'kick'}],spb:2},
  {bpm:130,sw:0,wv:'square',mel:[[N.C4,.5,.7],[N.E4,.5,.65],[N.G4,.5,.7],[N.E4,.5,.65],[N.C4,.5,.7],[N.E4,.5,.6],[N.G4,1,.75],[N.A4,.5,.68],[N.G4,.5,.6],[N.F4,.5,.65],[N.E4,.5,.6],[N.D4,1,.7],[N.C4,1,.65],[N.G4,.5,.72],[N.G4,.5,.55],[N.A4,.5,.7],[N.G4,.5,.6],[N.E4,.5,.65],[N.C4,.5,.6],[N.G3,1,.7],[N.C4,2,.72],[0,2,0]],bas:[[N.C3,.5,.4],[N.G3,.5,.35],[N.C3,.5,.4],[N.G3,.5,.35],[N.C3,.5,.4],[N.G3,.5,.35],[N.C3,.5,.4],[N.G3,.5,.35],[N.F2,.5,.4],[N.C3,.5,.35],[N.F2,.5,.4],[N.C3,.5,.35],[N.G2,1,.38],[N.C3,1,.35]],drm:[{s:0,t:'kick'},{s:1,t:'hat'},{s:2,t:'kick'},{s:3,t:'hat'},{s:4,t:'snare'},{s:5,t:'hat'},{s:6,t:'kick'},{s:7,t:'hat'}],spb:2},
  {bpm:108,sw:.15,wv:'triangle',mel:[[N.G4,1,.7],[N.G4,.5,.6],[N.A4,.5,.65],[N.G4,.5,.7],[N.E4,.5,.6],[N.D4,1.5,.72],[N.D4,.5,.55],[N.G4,1,.7],[N.G4,.5,.6],[N.B4,.5,.68],[N.A4,.5,.65],[N.G4,.5,.6],[N.G4,2,.75],[0,2,0]],bas:[[N.G2,2,.38],[N.D3,2,.32],[N.G2,2,.38],[N.C3,2,.32],[N.D3,2,.35],[N.G2,2,.32],[N.D3,4,.35]],drm:[{s:0,t:'kick'},{s:3,t:'snare'},{s:6,t:'kick'},{s:9,t:'snare'}],spb:3},
  {bpm:140,sw:.12,wv:'sawtooth',mel:[[N.D5,.5,.75],[N.B4,.5,.65],[N.G4,.5,.7],[N.B4,.5,.65],[N.D5,.5,.75],[N.B4,.5,.65],[N.G4,1,.7],[N.E5,.5,.72],[N.D5,.5,.65],[N.B4,.5,.7],[N.A4,.5,.65],[N.G4,1.5,.75],[N.A4,.5,.6],[N.B4,.5,.72],[N.D5,.5,.65],[N.G5,.5,.7],[N.D5,.5,.65],[N.B4,.5,.72],[N.A4,.5,.6],[N.G4,1,.75],[0,2,0]],bas:[[N.G2,1,.4],[N.B2,.5,.3],[N.D3,.5,.32],[N.G2,1,.4],[N.C3,1,.38],[N.G2,2,.4],[N.D3,2,.35]],drm:[{s:0,t:'kick'},{s:1,t:'hat'},{s:2,t:'snare'},{s:3,t:'hat'},{s:4,t:'kick'},{s:5,t:'hat'},{s:6,t:'snare'},{s:7,t:'hat'}],spb:2},
  {bpm:128,sw:0,wv:'square',mel:[[N.A4,.5,.7],[N.E5,.5,.65],[N.A4,.5,.7],[N.E5,.5,.65],[N.A4,.5,.72],[N.C5,.5,.6],[N.E5,.5,.68],[N.A5,.5,.65],[N.G4,.5,.7],[N.D5,.5,.65],[N.G4,.5,.68],[N.D5,.5,.62],[N.G4,.5,.7],[N.B4,.5,.58],[N.D5,.5,.65],[N.G5,.5,.62],[N.F4,.5,.68],[N.C5,.5,.62],[N.A4,2,.72],[0,2,0]],bas:[[N.A2,.5,.45],[N.A2,.5,.35],[N.A3,.5,.42],[N.A2,.5,.35],[N.G2,.5,.45],[N.G2,.5,.35],[N.G3,.5,.42],[N.G2,.5,.35],[N.F2,1,.45],[N.C3,1,.38],[N.E2,1,.45],[N.A2,1,.38]],drm:[{s:0,t:'kick'},{s:1,t:'hat'},{s:2,t:'hat'},{s:3,t:'hat'},{s:4,t:'snare'},{s:5,t:'hat'},{s:6,t:'hat'},{s:7,t:'hat'}],spb:2},
  {bpm:80,sw:.2,wv:'triangle',mel:[[N.A4,1,.6],[N.G4,.5,.5],[N.E4,.5,.55],[N.D4,1,.58],[N.C4,.5,.5],[N.A3,.5,.52],[N.E4,1,.6],[N.D4,.5,.52],[N.C4,.5,.55],[N.A3,2,.58],[0,1,0],[N.G4,1,.6],[N.F4,.5,.5],[N.E4,.5,.55],[N.D4,1,.58],[N.A3,2,.6],[0,1,0]],bas:[[N.A2,2,.35],[N.G2,1,.3],[N.E2,1,.32],[N.D2,2,.35],[N.A2,2,.3],[N.G2,2,.33],[N.A2,4,.35]],drm:[{s:0,t:'kick'},{s:2,t:'hat'},{s:4,t:'snare'},{s:6,t:'hat'}],spb:2},
];

export class Music {
  constructor() {
    this._ctx=null; this._gain=null; this._running=false; this._track=-1;
    this._mIdx=0;this._bIdx=0;this._dStep=0;
    this._mTime=0;this._bTime=0;this._dTime=0;
    this._sched=null; this._muted=false;
  }

  _init() {
    if(this._ctx) return;
    this._ctx=new(window.AudioContext||window.webkitAudioContext)();
    this._gain=this._ctx.createGain();
    this._gain.gain.value=0.16;
    this._gain.connect(this._ctx.destination);
  }

  toggleMute() {
    this._muted=!this._muted;
    if(this._gain) this._gain.gain.setTargetAtTime(this._muted?0:0.16,this._ctx.currentTime,.3);
    document.getElementById('mute-btn').textContent=this._muted?'🔇':'🎵';
  }

  playTrack(idx) {
    this._init();
    if(this._ctx.state==='suspended') this._ctx.resume();
    if(idx===this._track) return;
    this._running=false; if(this._sched) clearTimeout(this._sched);
    this._track=idx; this._running=true;
    const now=this._ctx.currentTime+.05;
    this._mIdx=this._bIdx=this._dStep=0;
    this._mTime=this._bTime=this._dTime=now;
    this._schedule();
  }

  _note(freq,t,dur,vol,wv='square') {
    if(!this._ctx||!freq) return;
    const o=this._ctx.createOscillator(),e=this._ctx.createGain();
    o.connect(e);e.connect(this._gain);
    o.type=wv;o.frequency.value=freq;
    const att=0.01,rel=Math.min(0.08,dur*.15);
    e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(vol,t+att);
    e.gain.setValueAtTime(vol,t+dur-rel);e.gain.linearRampToValueAtTime(0,t+dur);
    o.start(t);o.stop(t+dur+.01);
  }

  _drum(type,t) {
    if(!this._ctx) return;
    const g=this._ctx.createGain(); g.connect(this._gain);
    if(type==='kick'){
      const o=this._ctx.createOscillator();o.connect(g);o.type='sine';
      o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.15);
      g.gain.setValueAtTime(.45,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);
      o.start(t);o.stop(t+.21);
    } else if(type==='snare'){
      const o=this._ctx.createOscillator(),f=this._ctx.createBiquadFilter();
      o.connect(f);f.connect(g);o.type='square';o.frequency.value=200;
      f.type='highpass';f.frequency.value=1000;
      g.gain.setValueAtTime(.28,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);
      o.start(t);o.stop(t+.13);
    } else {
      const o=this._ctx.createOscillator(),f=this._ctx.createBiquadFilter();
      o.connect(f);f.connect(g);o.type='square';o.frequency.value=800;
      f.type='highpass';f.frequency.value=3000;
      g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);
      o.start(t);o.stop(t+.07);
    }
  }

  _schedule() {
    if(!this._running||!this._ctx) return;
    const tr=TRACKS[this._track]||TRACKS[0];
    const spb=60/tr.bpm,now=this._ctx.currentTime,hor=now+0.1;
    while(this._mTime<hor){
      const[f,d,v]=tr.mel[this._mIdx%tr.mel.length];
      const sw=(this._mIdx%2===1)?spb*.5*tr.sw:0;
      if(f)this._note(f,this._mTime+sw,d*spb*.9,v,tr.wv||'square');
      this._mTime+=d*spb;this._mIdx++;
    }
    if(tr.bas)while(this._bTime<hor){
      const[f,d,v]=tr.bas[this._bIdx%tr.bas.length];
      if(f)this._note(f,this._bTime,d*spb*.85,v*.8,'square');
      this._bTime+=d*spb;this._bIdx++;
    }
    if(tr.drm&&tr.drm.length){
      const spb2=spb/(tr.spb||2);
      while(this._dTime<hor){
        tr.drm.forEach(({s,t})=>{if(s===this._dStep%8)this._drum(t,this._dTime);});
        this._dTime+=spb2;this._dStep++;
      }
    }
    this._sched=setTimeout(()=>this._schedule(),50);
  }
}
