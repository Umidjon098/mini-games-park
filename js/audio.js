/**
 * Global audio system.
 *
 * IMPORTANT: Some CDNs (including third-party MP3 hosts) can block hotlinking
 * or return 403 depending on region / user-agent. To keep the demo reliable
 * and still comply with "no local media assets", this implementation uses a
 * small WebAudio synthesizer for SFX + background music.
 *
 * Stores mute state in localStorage.
 */

const STORAGE_KEY = 'mgp_settings_v1';

function readSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { muted: false };
    const parsed = JSON.parse(raw);
    return { muted: Boolean(parsed?.muted) };
  } catch {
    return { muted: false };
  }
}

function writeSettings(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ muted: Boolean(next?.muted) }));
}

function now(ctx) {
  return ctx.currentTime;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

/**
 * @param {AudioContext} ctx
 * @param {AudioNode} destination
 * @param {{type?:OscillatorType, freq:number, duration:number, when?:number, gain?:number, slideTo?:number}} opt
 */
function beep(ctx, destination, opt) {
  const t0 = opt.when ?? now(ctx);
  const duration = Math.max(0.02, opt.duration);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);

  const peak = clamp(opt.gain ?? 0.2, 0, 1);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  const o = ctx.createOscillator();
  o.type = opt.type ?? 'sine';
  o.frequency.setValueAtTime(Math.max(20, opt.freq), t0);
  if (typeof opt.slideTo === 'number') {
    o.frequency.exponentialRampToValueAtTime(Math.max(20, opt.slideTo), t0 + duration);
  }

  o.connect(g);
  g.connect(destination);

  o.start(t0);
  o.stop(t0 + duration + 0.02);
}

/**
 * @param {AudioContext} ctx
 * @param {AudioNode} destination
 * @param {number} freq
 * @param {number} when
 */
function softClick(ctx, destination, freq, when) {
  beep(ctx, destination, { type: 'triangle', freq, duration: 0.07, when, gain: 0.12 });
}

class AudioSystem {
  #inited = false;
  #settings = readSettings();
  /** @type {AudioContext|null} */
  #ctx = null;
  /** @type {GainNode|null} */
  #master = null;
  #unlocked = false;
  #musicTimer = 0;
  #musicOn = false;

  init() {
    if (this.#inited) return;
    this.#inited = true;

    // Unlock WebAudio after first user interaction (mobile autoplay rules)
    const unlock = () => {
      this.#unlocked = true;
      this.#ensureAudio();
      this.#applyMute();
      if (!this.isMuted()) this.#startMusic();
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  #ensureAudio() {
    if (this.#ctx && this.#master) {
      if (this.#ctx.state === 'suspended') {
        try {
          this.#ctx.resume();
        } catch {
          // ignore
        }
      }
      return;
    }

    const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Ctx) return;

    this.#ctx = new Ctx();
    this.#master = this.#ctx.createGain();
    this.#master.gain.value = this.#settings.muted ? 0 : 1;
    this.#master.connect(this.#ctx.destination);
  }

  #applyMute() {
    if (!this.#master) return;
    this.#master.gain.value = this.isMuted() ? 0 : 1;
  }

  #stopMusic() {
    if (this.#musicTimer) {
      window.clearInterval(this.#musicTimer);
      this.#musicTimer = 0;
    }
    this.#musicOn = false;
  }

  #startMusic() {
    if (!this.#unlocked) return;
    if (this.isMuted()) return;
    this.#ensureAudio();
    if (!this.#ctx || !this.#master) return;
    if (this.#musicOn) return;

    this.#musicOn = true;

    // Tiny arpeggio loop (kid-friendly, soft)
    const seq = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]; // C4 E4 G4 C5 G4 E4
    let i = 0;

    const tick = () => {
      if (!this.#ctx || !this.#master || this.isMuted()) return;
      const t = now(this.#ctx) + 0.01;
      const f = seq[i % seq.length];
      // two layered tones for a warmer feel
      beep(this.#ctx, this.#master, { type: 'sine', freq: f, duration: 0.18, when: t, gain: 0.03 });
      beep(this.#ctx, this.#master, { type: 'triangle', freq: f / 2, duration: 0.18, when: t, gain: 0.015 });
      i += 1;
    };

    tick();
    this.#musicTimer = window.setInterval(tick, 260);
  }

  isMuted() {
    return Boolean(this.#settings?.muted);
  }

  setMuted(muted) {
    this.#settings = { muted: Boolean(muted) };
    writeSettings(this.#settings);
    this.#applyMute();

    if (this.#settings.muted) {
      this.#stopMusic();
      return;
    }

    // If user unmutes after unlocking, start music.
    this.#startMusic();
  }

  toggleMute() {
    this.setMuted(!this.isMuted());
    return this.isMuted();
  }

  playSfx(name) {
    if (this.isMuted()) return;
    this.#ensureAudio();
    if (!this.#ctx || !this.#master) return;

    const t = now(this.#ctx) + 0.005;
    try {
      if (name === 'place') {
        softClick(this.#ctx, this.#master, 520, t);
      } else if (name === 'flip') {
        beep(this.#ctx, this.#master, { type: 'square', freq: 740, duration: 0.06, when: t, gain: 0.06 });
        beep(this.#ctx, this.#master, { type: 'square', freq: 520, duration: 0.07, when: t + 0.04, gain: 0.05 });
      } else if (name === 'jump') {
        beep(this.#ctx, this.#master, { type: 'sine', freq: 320, slideTo: 820, duration: 0.12, when: t, gain: 0.09 });
      } else if (name === 'hit') {
        beep(this.#ctx, this.#master, { type: 'sawtooth', freq: 140, slideTo: 70, duration: 0.16, when: t, gain: 0.10 });
      } else if (name === 'win') {
        const base = 523.25;
        const steps = [1, 1.25, 1.5, 2];
        steps.forEach((m, idx) => {
          beep(this.#ctx, this.#master, { type: 'triangle', freq: base * m, duration: 0.18, when: t + idx * 0.08, gain: 0.08 });
        });
        beep(this.#ctx, this.#master, { type: 'sine', freq: 1046.5, duration: 0.22, when: t + 0.32, gain: 0.06 });
      }
    } catch {
      // ignore
    }
  }

  celebrate() {
    this.playSfx('win');
  }
}

export const audio = new AudioSystem();
