// ═══════════════════════════════════════════════════════════
//  Music.js — Multi-voice chiptune sequencer
//  Inspired by Zelda (NES/SNES), Stardew Valley, Chrono Trigger
//  3 simultaneous voices: melody (square), bass (triangle), harmony (pulse)
//  + percussion track (noise bursts)
//  All generated via Web Audio API — no audio files
// ═══════════════════════════════════════════════════════════

// ── Music theory helpers ──────────────────────────────────
const NOTE = (() => {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const freqs = {};
  for (let oct = 2; oct <= 7; oct++) {
    names.forEach((n, i) => {
      freqs[`${n}${oct}`] = 440 * Math.pow(2, (oct - 4) + (i - 9) / 12);
    });
  }
  freqs['R'] = 0; // rest
  return freqs;
})();

// Beat duration in seconds at a given BPM
function beat(bpm, beats = 1) { return (60 / bpm) * beats; }

// ── Track definitions ─────────────────────────────────────
// Each track: { bpm, voices: [ {type, notes: [[note, dur_beats], ...], loop} ] }
// note = frequency or NOTE key; dur_beats = duration in beats
// type: 'square'|'triangle'|'sawtooth'|'pulse'|'noise'

const TRACKS = [

  // ── Track 0 · Era 0 · 1539 Medieval Brabant ───────────────
  // Zelda-style modal folk melody in D Dorian — mysterious, ancient
  {
    bpm: 96,
    voices: [
      // Melody — square wave, Zelda-style
      {
        type: 'square', vol: 0.22, vibrato: true,
        notes: [
          ['D4',2],['F4',1],['G4',1],  ['A4',2],['G4',1],['F4',1],
          ['E4',2],['D4',2],            ['C4',2],['D4',2],
          ['F4',2],['E4',1],['D4',1],  ['E4',4],
          ['G4',2],['F4',1],['E4',1],  ['D4',2],['C4',1],['D4',1],
          ['A3',2],['C4',1],['D4',1],  ['D4',4],
        ],
      },
      // Bass — triangle wave
      {
        type: 'triangle', vol: 0.18,
        notes: [
          ['D3',4], ['A3',4], ['C3',4], ['D3',4],
          ['F3',4], ['G3',4], ['A3',4], ['D3',4],
        ],
      },
      // Harmony — arpeggiated pulse
      {
        type: 'pulse', vol: 0.10, arp: true,
        notes: [
          ['D4',1],['F4',1],['A4',1],['D4',1],  // Dm arp
          ['A3',1],['E4',1],['A4',1],['A3',1],  // Am arp
          ['C4',1],['E4',1],['G4',1],['C4',1],  // C arp
          ['D4',1],['F4',1],['A4',1],['D4',1],  // Dm arp
        ],
      },
    ],
  },

  // ── Track 1 · Era 1 · 1660 Dutch Golden Age ──────────────
  // Stately harpsichord-feel in G major — merchant, confident, bright
  {
    bpm: 112,
    voices: [
      {
        type: 'square', vol: 0.20, vibrato: false,
        notes: [
          ['G4',1],['A4',1],['B4',2],  ['D5',2],['B4',1],['A4',1],
          ['G4',2],['F#4',2],          ['E4',2],['G4',2],
          ['A4',1],['B4',1],['C5',2],  ['B4',4],
          ['D5',2],['C5',1],['B4',1],  ['A4',2],['G4',2],
        ],
      },
      {
        type: 'triangle', vol: 0.16,
        notes: [
          ['G3',2],['D3',2],  ['B3',2],['G3',2],
          ['E3',2],['B3',2],  ['A3',2],['D3',2],
          ['G3',4],           ['D3',4],
        ],
      },
      {
        type: 'pulse', vol: 0.09, arp: true,
        notes: [
          ['G4',1],['B4',1],['D5',1],['G4',1],
          ['D4',1],['F#4',1],['A4',1],['D4',1],
          ['E4',1],['G4',1],['B4',1],['E4',1],
          ['A3',1],['C#4',1],['E4',1],['A3',1],
        ],
      },
    ],
  },

  // ── Track 2 · Era 2 · 1799 Napoleonic ────────────────────
  // Minor march in A minor — tense, military, Chrono Trigger feel
  {
    bpm: 108,
    voices: [
      {
        type: 'square', vol: 0.22, vibrato: false,
        notes: [
          ['A4',1],['R',0.5],['A4',0.5],['C5',2],
          ['B4',1],['A4',1],['G4',2],
          ['F4',2],['E4',2],
          ['A4',3],['R',1],
          ['E4',1],['F4',1],['G4',1],['A4',1],
          ['B4',2],['C5',2],
          ['E5',2],['D5',1],['C5',1],
          ['A4',4],
        ],
      },
      {
        type: 'triangle', vol: 0.18,
        notes: [
          ['A2',2],['E3',2],  ['F3',2],['C3',2],
          ['A2',2],['E3',2],  ['A2',4],
          ['G2',2],['D3',2],  ['A2',2],['E3',2],
          ['F3',2],['C3',2],  ['A2',4],
        ],
      },
      {
        type: 'noise', vol: 0.08,  // percussion
        notes: [
          ['kick',1],['R',0.5],['snare',0.5],  ['kick',1],['snare',1],
          ['kick',1],['R',0.5],['snare',0.5],  ['kick',2],
        ],
      },
    ],
  },

  // ── Track 3 · Era 3 · 1872 Industrial ────────────────────
  // Heavy rhythmic pulse in E minor — grinding, mechanical, dramatic
  {
    bpm: 104,
    voices: [
      {
        type: 'sawtooth', vol: 0.16, vibrato: false,
        notes: [
          ['E4',2],['G4',1],['A4',1],
          ['B4',2],['A4',2],
          ['G4',2],['F#4',2],
          ['E4',4],
          ['D4',2],['E4',1],['F#4',1],
          ['G4',2],['B4',2],
          ['A4',2],['G4',1],['F#4',1],
          ['E4',4],
        ],
      },
      {
        type: 'triangle', vol: 0.20,
        notes: [
          ['E2',1],['E2',1],['E3',1],['R',1],
          ['B2',1],['B2',1],['B3',1],['R',1],
          ['G2',1],['G2',1],['G3',1],['R',1],
          ['E2',4],
        ],
      },
      {
        type: 'noise', vol: 0.10,
        notes: [
          ['kick',0.5],['R',0.5],['kick',0.5],['snare',0.5],
          ['kick',0.5],['R',0.5],['kick',0.5],['snare',0.5],
          ['kick',0.5],['R',0.5],['kick',0.5],['snare',0.5],
          ['kick',0.5],['kick',0.5],['snare',0.5],['snare',0.5],
        ],
      },
    ],
  },

  // ── Track 4 · Era 4 · 1950 Atlantic Ocean ────────────────
  // Lilting sea shanty waltz in C major — hopeful, rolling, emotional
  {
    bpm: 116, // 3/4 feel
    voices: [
      {
        type: 'triangle', vol: 0.22, vibrato: true,
        notes: [
          ['C5',2],['E5',1],  ['G4',2],['E5',1],
          ['F5',2],['D5',1],  ['E5',3],
          ['G5',2],['E5',1],  ['F5',2],['D5',1],
          ['C5',3],
          ['A4',2],['C5',1],  ['G4',2],['E4',1],
          ['F4',2],['A4',1],  ['G4',3],
          ['E4',2],['G4',1],  ['F4',2],['E4',1],
          ['C4',3],
        ],
      },
      {
        type: 'square', vol: 0.14,
        notes: [
          ['C3',3],  ['G3',3],  ['F3',3],  ['C3',3],
          ['A3',3],  ['E3',3],  ['F3',3],  ['G3',3],
        ],
      },
      {
        type: 'pulse', vol: 0.10, arp: true,
        notes: [
          ['C4',1],['E4',1],['G4',1],
          ['G3',1],['B3',1],['D4',1],
          ['F3',1],['A3',1],['C4',1],
          ['C3',1],['E3',1],['G3',1],
        ],
      },
    ],
  },

  // ── Track 5 · Era 5 · 1955 Minnesota ─────────────────────
  // Bright Americana in G major — open, optimistic, country feel
  {
    bpm: 120,
    voices: [
      {
        type: 'square', vol: 0.20, vibrato: false,
        notes: [
          ['G4',1],['A4',1],['B4',1],['D5',1],
          ['E5',2],['D5',2],
          ['C5',1],['B4',1],['A4',2],
          ['G4',4],
          ['B4',1],['C5',1],['D5',1],['E5',1],
          ['D5',2],['C5',2],
          ['B4',1],['A4',1],['G4',2],
          ['D4',4],
        ],
      },
      {
        type: 'triangle', vol: 0.18,
        notes: [
          ['G3',2],['D3',2],  ['C3',2],['G3',2],
          ['A3',2],['E3',2],  ['D3',2],['G3',2],
          ['G3',2],['D3',2],  ['C3',2],['G3',2],
          ['D3',4],           ['G2',4],
        ],
      },
      {
        type: 'pulse', vol: 0.08, arp: true,
        notes: [
          ['G4',1],['B4',1],['D5',1],['G4',1],
          ['C4',1],['E4',1],['G4',1],['C4',1],
          ['A3',1],['C#4',1],['E4',1],['A3',1],
          ['D4',1],['F#4',1],['A4',1],['D4',1],
        ],
      },
    ],
  },

  // ── Track 6 · Era 6 · 1984 ────────────────────────────────
  // Synth-pop in A minor — pulsing, nostalgic, slightly ominous
  {
    bpm: 126,
    voices: [
      {
        type: 'sawtooth', vol: 0.18, vibrato: true,
        notes: [
          ['A4',2],['C5',1],['B4',1],
          ['G4',2],['A4',2],
          ['F4',2],['E4',2],
          ['A4',4],
          ['E5',2],['D5',2],
          ['C5',2],['B4',2],
          ['A4',2],['G4',2],
          ['A4',4],
        ],
      },
      {
        type: 'square', vol: 0.20,
        notes: [
          ['A2',0.5],['R',0.5],['A3',0.5],['R',0.5],
          ['G2',0.5],['R',0.5],['G3',0.5],['R',0.5],
          ['F2',0.5],['R',0.5],['F3',0.5],['R',0.5],
          ['E2',0.5],['R',0.5],['E3',0.5],['R',0.5],
        ],
      },
      {
        type: 'noise', vol: 0.09,
        notes: [
          ['kick',0.5],['R',0.5],['kick',0.5],['R',0.5],
          ['snare',0.5],['R',0.5],['snare',0.5],['R',0.5],
          ['kick',0.5],['R',0.25],['kick',0.25],['R',0.5],['kick',0.5],
          ['snare',1],['R',1],
        ],
      },
    ],
  },

  // ── Track 7 · Era 7 · 2020 ────────────────────────────────
  // Lo-fi chill in C major — reflective, warm, full-circle
  // Quotes Era 0's melody in the second loop
  {
    bpm: 88,
    voices: [
      {
        type: 'triangle', vol: 0.18, vibrato: true,
        notes: [
          ['E5',3],['D5',1],  ['C5',2],['G4',2],
          ['A4',2],['B4',2],  ['C5',4],
          ['G4',2],['A4',2],  ['E4',2],['F4',2],
          ['G4',4],
          // Era 0 melody quote:
          ['D5',2],['F5',1],['G5',1],  ['A5',2],['G5',1],['F5',1],
          ['E5',2],['D5',2],           ['C5',4],
        ],
      },
      {
        type: 'square', vol: 0.12,
        notes: [
          ['C3',4],  ['G3',4],  ['A3',4],  ['F3',4],
          ['G3',4],  ['D3',4],  ['C3',4],  ['G2',4],
        ],
      },
      {
        type: 'pulse', vol: 0.07, arp: true,
        notes: [
          ['C4',1],['E4',1],['G4',1],['C5',1],
          ['G3',1],['B3',1],['D4',1],['G4',1],
          ['A3',1],['C4',1],['E4',1],['A4',1],
          ['F3',1],['A3',1],['C4',1],['F4',1],
        ],
      },
    ],
  },

];

// ── Music engine ──────────────────────────────────────────
export class Music {
  constructor() {
    this._ctx       = null;
    this._master    = null;
    this._muted     = false;
    this._trackIdx  = -1;
    this._voices    = [];       // active voice schedulers
    this._startTime = 0;
  }

  _ensureCtx() {
    if (this._ctx) return;
    this._ctx    = new (window.AudioContext || window.webkitAudioContext)();
    this._master = this._ctx.createGain();
    this._master.gain.value = 0.28;
    this._master.connect(this._ctx.destination);
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this._master) {
      this._master.gain.setTargetAtTime(this._muted ? 0 : 0.28, this._ctx.currentTime, 0.1);
    }
    return this._muted;
  }

  playTrack(idx) {
    this._ensureCtx();
    this._stopVoices();     // clears scheduling loops
    this._silenceNow();     // disconnects all playing oscillators immediately
    this._trackIdx = idx;
    const track = TRACKS[idx] || TRACKS[0];
    this._startTime = this._ctx.currentTime + 0.08;
    track.voices.forEach(v => this._scheduleVoice(track.bpm, v));
  }

  stop() {
    this._stopVoices();
    this._silenceNow();
    this._trackIdx = -1;
  }

  _stopVoices() {
    this._voices.forEach(id => clearTimeout(id));
    this._voices = [];
  }

  /** Immediately disconnect and recreate the master gain to silence all active oscillators */
  _silenceNow() {
    if (!this._ctx || !this._master) return;
    try {
      // Fade out quickly to avoid click, then disconnect
      this._master.gain.cancelScheduledValues(this._ctx.currentTime);
      this._master.gain.setValueAtTime(this._master.gain.value, this._ctx.currentTime);
      this._master.gain.linearRampToValueAtTime(0, this._ctx.currentTime + 0.06);
    } catch (e) { /* ignore */ }
    // Recreate master gain — all old oscillators are now routed to nothing
    const newMaster = this._ctx.createGain();
    newMaster.gain.value = this._muted ? 0 : 0.28;
    newMaster.connect(this._ctx.destination);
    this._master = newMaster;
  }

  // Schedule a single voice — loops indefinitely
  _scheduleVoice(bpm, voiceDef) {
    const totalBeats = voiceDef.notes.reduce((s, [, d]) => s + d, 0);
    const loopDur    = beat(bpm, totalBeats);

    const schedule = (loopStart) => {
      let t = loopStart;
      voiceDef.notes.forEach(([note, dur]) => {
        const durSec = beat(bpm, dur);
        if (note !== 'R') {
          this._playVoiceNote(voiceDef, note, t, durSec * 0.88);
        }
        t += durSec;
      });
      // Schedule next loop
      const delay = (loopStart + loopDur - this._ctx.currentTime) * 1000 - 50;
      const id = setTimeout(() => {
        if (this._trackIdx === -1) return;
        schedule(loopStart + loopDur);
      }, Math.max(0, delay));
      this._voices.push(id);
    };

    schedule(this._startTime);
  }

  _playVoiceNote(voiceDef, note, startTime, dur) {
    const ctx = this._ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    if (startTime < now - 0.01) return; // already past

    const gain = ctx.createGain();
    gain.connect(this._master);

    // Envelope: fast attack, short decay, sustain, release
    const atk  = Math.min(0.02, dur * 0.08);
    const rel  = Math.min(0.08, dur * 0.25);
    const vol  = voiceDef.vol || 0.15;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + atk);
    gain.gain.setValueAtTime(vol * 0.75, startTime + atk + 0.01);
    gain.gain.setValueAtTime(vol * 0.75, startTime + dur - rel);
    gain.gain.linearRampToValueAtTime(0, startTime + dur);

    if (voiceDef.type === 'noise' || note === 'kick' || note === 'snare') {
      this._playPercussion(note, startTime, dur, gain);
      return;
    }

    const freq = typeof note === 'number' ? note : NOTE[note];
    if (!freq) return;

    const osc = ctx.createOscillator();

    if (voiceDef.type === 'pulse') {
      // Web Audio doesn't have pulse directly — use square + narrow PWM
      osc.type = 'square';
    } else {
      osc.type = voiceDef.type || 'square';
    }

    osc.frequency.setValueAtTime(freq, startTime);

    // Vibrato for melody voices
    if (voiceDef.vibrato && dur > 0.2) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5.5;
      lfoGain.gain.value = 0; // start silent
      lfoGain.gain.setValueAtTime(0, startTime + dur * 0.55);
      lfoGain.gain.linearRampToValueAtTime(freq * 0.008, startTime + dur * 0.75);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(startTime);
      lfo.stop(startTime + dur + 0.01);
    }

    // Arpeggio: rapidly cycle through chord tones
    if (voiceDef.arp) {
      const arpRate = 0.06; // seconds per arp step
      let tf = startTime;
      let harmFreq = freq * 1.25; // rough major third up
      while (tf < startTime + dur - arpRate) {
        osc.frequency.setValueAtTime(freq, tf);
        osc.frequency.setValueAtTime(harmFreq, tf + arpRate);
        tf += arpRate * 2;
      }
    }

    osc.connect(gain);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.01);
  }

  _playPercussion(type, startTime, dur, gainNode) {
    const ctx = this._ctx;

    const bufLen = Math.floor(ctx.sampleRate * Math.min(dur, 0.18));
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);

    if (type === 'kick') {
      // Kick: pitched noise sweep down
      for (let i = 0; i < bufLen; i++) {
        const t   = i / ctx.sampleRate;
        const env = Math.exp(-t * 30);
        data[i]   = (Math.random() * 2 - 1) * env * 0.6 +
                    Math.sin(2 * Math.PI * 80 * Math.exp(-t * 40) * t) * env * 0.4;
      }
    } else if (type === 'snare') {
      // Snare: noise burst with ring
      for (let i = 0; i < bufLen; i++) {
        const t   = i / ctx.sampleRate;
        const env = Math.exp(-t * 18);
        data[i]   = (Math.random() * 2 - 1) * env * 0.7 +
                    Math.sin(2 * Math.PI * 220 * t) * env * 0.3;
      }
    } else {
      // Generic noise
      for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufLen * 8);
      }
    }

    // High-pass filter for snare crispness
    const filter = ctx.createBiquadFilter();
    filter.type = type === 'kick' ? 'lowpass' : 'highpass';
    filter.frequency.value = type === 'kick' ? 200 : 1200;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(filter);
    filter.connect(gainNode);
    src.start(startTime);
  }

  // ── SFX ──────────────────────────────────────────────────

  _ensureCtxAndPlay(fn) {
    this._ensureCtx();
    if (this._muted) return;
    fn(this._ctx, this._master);
  }

  _sfxTone(freq, dur, type = 'square', vol = 0.18) {
    this._ensureCtxAndPlay((ctx, out) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = type; osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(g); g.connect(out);
      osc.start(); osc.stop(ctx.currentTime + dur);
    });
  }

  sfxHit()          { this._sfxTone(180, 0.08, 'square', 0.22); setTimeout(() => this._sfxTone(120, 0.06, 'square', 0.15), 40); }
  sfxCollect()      { [523,659,784].forEach((f,i) => setTimeout(() => this._sfxTone(f, 0.1, 'square', 0.18), i*70)); }
  sfxPortal()       { [523,659,784,1047].forEach((f,i) => setTimeout(() => this._sfxTone(f, 0.28, 'sine', 0.14), i*80)); }
  sfxFishCast()     { this._sfxTone(300, 0.12, 'square', 0.12); }
  sfxFishCaught()   { [523,659,784,1047].forEach((f,i) => setTimeout(() => this._sfxTone(f, 0.1, 'square', 0.18), i*100)); }
  sfxFishMiss()     { this._sfxTone(330, 0.2, 'sine', 0.14); setTimeout(() => this._sfxTone(262, 0.2, 'sine', 0.10), 150); }
  sfxDialog()       { this._sfxTone(880, 0.04, 'square', 0.12); }
  sfxEraUnlock()    { [523,659,784,1047,1318].forEach((f,i) => setTimeout(() => this._sfxTone(f, 0.2, 'square', 0.18), i*100)); }
  sfxQuestComplete(){ this._sfxTone(523, 0.4, 'sine', 0.16); setTimeout(() => this._sfxTone(784, 0.4, 'sine', 0.16), 30); }
  sfxHurt()         { this._sfxTone(880, 0.09, 'square', 0.24); }
}
