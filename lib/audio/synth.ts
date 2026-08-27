// Procedurally synthesizes short cricket-themed sound effects (bat impact,
// glass shatter, whoosh, UI click, crowd swell) using the Web Audio API and
// encodes them as WAV blobs. This keeps the site fully self-contained —
// no external audio assets need to be sourced or licensed — while still
// letting Howler.js own playback, mixing, and mute state.

export type SoundName = "whoosh" | "impact" | "batHit" | "shatter" | "click" | "cheer" | "hover";

function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const samples = buffer.length * numChannels;
  const dataSize = samples * (bitDepth / 8);
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channels.push(buffer.getChannelData(ch));

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function getCtxCtor(): typeof AudioContext {
  return (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
}

function noiseBuffer(ctx: OfflineAudioContext, duration: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

async function render(duration: number, build: (ctx: OfflineAudioContext) => void): Promise<AudioBuffer> {
  const Ctx = (window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
      .webkitOfflineAudioContext);
  const ctx = new Ctx(1, Math.ceil(44100 * duration), 44100);
  build(ctx);
  return ctx.startRendering();
}

async function synthWhoosh(): Promise<AudioBuffer> {
  return render(0.5, (ctx) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 0.5);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(200, 0);
    filter.frequency.exponentialRampToValueAtTime(3000, 0.35);
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.7, 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, 0.48);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(0);
  });
}

async function synthImpact(): Promise<AudioBuffer> {
  return render(0.4, (ctx) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, 0);
    osc.frequency.exponentialRampToValueAtTime(35, 0.15);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(1, 0);
    oscGain.gain.exponentialRampToValueAtTime(0.001, 0.25);
    osc.connect(oscGain).connect(ctx.destination);
    osc.start(0);
    osc.stop(0.3);

    const click = ctx.createBufferSource();
    click.buffer = noiseBuffer(ctx, 0.05);
    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = "highpass";
    clickFilter.frequency.value = 1500;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.8, 0);
    clickGain.gain.exponentialRampToValueAtTime(0.001, 0.05);
    click.connect(clickFilter).connect(clickGain).connect(ctx.destination);
    click.start(0);
  });
}

async function synthBatHit(): Promise<AudioBuffer> {
  // Sharper and brighter than `impact` — a crisp leather-on-willow crack
  // rather than a low thud, for the moment the bat meets the ball.
  return render(0.35, (ctx) => {
    const crack = ctx.createBufferSource();
    crack.buffer = noiseBuffer(ctx, 0.12);
    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = "bandpass";
    crackFilter.frequency.value = 2200;
    crackFilter.Q.value = 1.2;
    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(1, 0);
    crackGain.gain.exponentialRampToValueAtTime(0.001, 0.1);
    crack.connect(crackFilter).connect(crackGain).connect(ctx.destination);
    crack.start(0);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(500, 0);
    osc.frequency.exponentialRampToValueAtTime(180, 0.12);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, 0);
    oscGain.gain.exponentialRampToValueAtTime(0.001, 0.22);
    osc.connect(oscGain).connect(ctx.destination);
    osc.start(0);
    osc.stop(0.25);
  });
}

async function synthShatter(): Promise<AudioBuffer> {
  return render(0.9, (ctx) => {
    const burst = ctx.createBufferSource();
    burst.buffer = noiseBuffer(ctx, 0.35);
    const burstFilter = ctx.createBiquadFilter();
    burstFilter.type = "highpass";
    burstFilter.frequency.value = 2500;
    const burstGain = ctx.createGain();
    burstGain.gain.setValueAtTime(0.9, 0);
    burstGain.gain.exponentialRampToValueAtTime(0.001, 0.3);
    burst.connect(burstFilter).connect(burstGain).connect(ctx.destination);
    burst.start(0);

    const freqs = [3200, 4100, 5300, 6200, 4700, 3800];
    freqs.forEach((freq, i) => {
      const start = 0.02 + i * 0.045 + Math.random() * 0.03;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.42);
    });
  });
}

async function synthClick(): Promise<AudioBuffer> {
  return render(0.08, (ctx) => {
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 900;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(0);
    osc.stop(0.07);
  });
}

async function synthHover(): Promise<AudioBuffer> {
  return render(0.06, (ctx) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 1400;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(0);
    osc.stop(0.05);
  });
}

async function synthCheer(): Promise<AudioBuffer> {
  return render(1.1, (ctx) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 1.1);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(600, 0);
    filter.frequency.linearRampToValueAtTime(1800, 0.5);
    filter.frequency.linearRampToValueAtTime(500, 1.05);
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.35, 0.3);
    gain.gain.linearRampToValueAtTime(0.2, 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, 1.08);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(0);
  });
}

const SYNTHS: Record<SoundName, () => Promise<AudioBuffer>> = {
  whoosh: synthWhoosh,
  impact: synthImpact,
  batHit: synthBatHit,
  shatter: synthShatter,
  click: synthClick,
  hover: synthHover,
  cheer: synthCheer,
};

export async function generateSoundUrl(name: SoundName): Promise<string> {
  const buffer = await SYNTHS[name]();
  const blob = encodeWav(buffer);
  return URL.createObjectURL(blob);
}

export function isAudioSupported(): boolean {
  return typeof window !== "undefined" && !!getCtxCtor();
}
