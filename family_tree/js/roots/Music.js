// ═══════════════════════════════════════════════════════════
//  Music — Web Audio API 8-bit chiptune per era + SFX
//  All sound generated procedurally — no audio files
// ═══════════════════════════════════════════════════════════

export class Music {
  constructor() {
    this._ctx     = null;
    this._master  = null;
    this._muted   = false;
    this._trackInterval = null;
    this._noteIdx = 0;
    this._currentTrack = null;
  }

  _ensureCtx() {
    if (this._ctx) return;
    this._ctx    = new (window.AudioContext || window.webkitAudioContext)();
    this._master = this._ctx.createGain();
    this._master.gain.value = 0.25;
    this._master.connect(this._ctx.destination);
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this._master) this._master.gain.value = this._muted ? 0 : 0.25;
    return this._muted;
  }

  // ── Track definitions (note arrays) ─────────────────
  //  Each note: [freq_hz, duration_ms]  0 freq = rest

  static TRACKS = [
    // 0 · 1539 — Medieval drone/lute (pentatonic, slow)
    [[220,400],[0,200],[261,300],[0,100],[293,400],[0,200],[220,600],[0,400],
     [196,400],[0,200],[220,300],[0,100],[261,400],[0,200],[196,600],[0,600]],

    // 1 · 1660 — Baroque harpsichord (rapid arpeggios)
    [[523,100],[659,100],[784,100],[1047,100],[784,100],[659,100],[523,100],[0,100],
     [494,100],[622,100],[740,100],[988,100],[740,100],[622,100],[494,100],[0,200]],

    // 2 · 1799 — Military fife and drum (minor march)
    [[440,200],[0,100],[440,200],[0,100],[523,400],[0,200],
     [494,200],[0,100],[440,200],[0,100],[392,400],[0,300],
     [440,200],[0,100],[494,200],[0,100],[440,400],[0,400]],

    // 3 · 1872 — Industrial mechanical march (heavy)
    [[110,300],[0,50],[220,300],[0,50],[165,400],[0,100],
     [110,300],[0,50],[196,300],[0,50],[155,500],[0,150],
     [110,200],[220,200],[110,200],[220,200],[165,600],[0,400]],

    // 4 · 1950 — Sea shanty (lilting 6/8)
    [[392,300],[440,300],[494,300],[0,150],[440,300],[392,600],[0,300],
     [349,300],[392,300],[440,300],[0,150],[392,300],[349,600],[0,450]],

    // 5 · 1955 — Americana country (bright, open)
    [[659,200],[784,200],[880,200],[0,100],[784,200],[659,400],[0,200],
     [587,200],[659,200],[784,200],[0,100],[659,200],[587,400],[0,300],
     [523,200],[587,200],[659,200],[0,100],[784,400],[659,200],[0,400]],

    // 6 · 1984 — Synth-pop (pulsing bass + lead)
    [[220,150],[0,50],[220,150],[0,50],[330,300],[0,100],[294,300],[0,100],
     [220,150],[0,50],[220,150],[0,50],[262,300],[0,100],[246,300],[0,200]],

    // 7 · 2020 — Lo-fi chill (quoting Era 0 at the end)
    [[330,400],[0,200],[392,400],[0,200],[440,600],[0,400],
     [392,400],[0,200],[330,400],[0,200],[294,600],[0,400],
     [220,400],[0,200],[261,300],[0,100],[293,400],[0,200],[220,600],[0,600]], // Era 0 quote
  ];

  playTrack(eraId) {
    this._ensureCtx();
    if (this._trackInterval) { clearInterval(this._trackInterval); this._trackInterval = null; }
    const notes = Music.TRACKS[eraId] || Music.TRACKS[0];
    this._noteIdx = 0;
    this._currentTrack = notes;
    this._scheduleNote();
  }

  _scheduleNote() {
    if (!this._currentTrack) return;
    const note = this._currentTrack[this._noteIdx];
    if (!note) return;
    const [freq, dur] = note;
    if (freq > 0 && !this._muted) this._playNote(freq, dur / 1000 * 0.85, 'square');
    this._noteIdx = (this._noteIdx + 1) % this._currentTrack.length;
    this._trackInterval = setTimeout(() => this._scheduleNote(), dur);
  }

  _playNote(freq, dur, type = 'square', vol = 0.15) {
    if (!this._ctx) return;
    const osc  = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type  = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + dur);
    osc.connect(gain); gain.connect(this._master);
    osc.start(); osc.stop(this._ctx.currentTime + dur);
  }

  stop() {
    if (this._trackInterval) { clearInterval(this._trackInterval); this._trackInterval = null; }
    this._currentTrack = null;
  }

  // ── SFX ─────────────────────────────────────────────

  sfxHit() {
    this._ensureCtx();
    this._playNoise(0.15, 0.06, 800);
    this._playNote(200, 0.08, 'sine', 0.2);
  }

  sfxCollect() {
    this._ensureCtx();
    this._playNote(523, 0.08, 'sine', 0.2);
    setTimeout(() => this._playNote(659, 0.08, 'sine', 0.2), 80);
  }

  sfxPortal() {
    this._ensureCtx();
    [523,659,784,1047].forEach((f, i) => {
      setTimeout(() => this._playNote(f, 0.3, 'sine', 0.15), i * 80);
    });
  }

  sfxFishCast() {
    this._ensureCtx();
    this._playNoise(0.1, 0.12, 300);
  }

  sfxFishCaught() {
    this._ensureCtx();
    [523,659,784].forEach((f, i) => setTimeout(() => this._playNote(f, 0.1, 'square', 0.18), i * 100));
  }

  sfxFishMiss() {
    this._ensureCtx();
    this._playNote(330, 0.2, 'sine', 0.15);
    setTimeout(() => this._playNote(262, 0.2, 'sine', 0.1), 150);
  }

  sfxDialog() {
    this._ensureCtx();
    this._playNoise(0.06, 0.05, 2000);
  }

  sfxEraUnlock() {
    this._ensureCtx();
    [523,659,784,1047].forEach((f, i) => setTimeout(() => this._playNote(f, 0.2, 'square', 0.2), i * 120));
  }

  sfxQuestComplete() {
    this._ensureCtx();
    this._playNote(523, 0.5, 'sine', 0.18);
    setTimeout(() => this._playNote(784, 0.5, 'sine', 0.18), 30);
  }

  sfxHurt() {
    this._ensureCtx();
    this._playNote(880, 0.1, 'square', 0.25);
  }

  _playNoise(vol, dur, freq = 1000) {
    if (!this._ctx) return;
    const buf  = this._ctx.createBuffer(1, this._ctx.sampleRate * dur, this._ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src    = this._ctx.createBufferSource();
    const filter = this._ctx.createBiquadFilter();
    const gain   = this._ctx.createGain();
    filter.type = 'highpass'; filter.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + dur);
    src.buffer = buf;
    src.connect(filter); filter.connect(gain); gain.connect(this._master);
    src.start();
  }
}
