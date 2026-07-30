import { useEffect } from "react";
import { NORTH_X, NORTH_Z } from "./ChocoTerrain";
import { CHIRIMIA_PLAZA_R } from "./ChirimiaPlaza";
import { vehicleState } from "../utils/vehicleState";
import { audioState } from "../utils/audioState";

// LA CHIRIMÍA SUENA AL PISAR LA PLAZA.
//
// La percusión se SINTETIZA con Web Audio en vez de reproducir un archivo: no
// encontré una grabación de chirimía con licencia clara para redistribuir, y
// además así el groove nunca se corta ni se repite igual. Bombo, redoblante y
// platillos en 6/8 — el esqueleto rítmico de la chirimía chocoana.
const BPM = 104;
const STEPS = 12; // dos compases de 6/8
const STEP_DUR = 60 / BPM / 3; // corchea del 6/8

// Patrones (1 = golpe). El bombo marca los dos pulsos con repique de entrada.
const BOMBO = [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1];
const REDOBLANTE = [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0];
const PLATILLO = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12; // segundos de colchón

export default function ChirimiaAudio() {
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let master: GainNode | null = null;
    let noiseBuf: AudioBuffer | null = null;
    let nextTime = 0;
    let step = 0;
    let timer: number | null = null;
    let raf = 0;
    let active = false;

    // --- instrumentos ---
    const bombo = (t: number) => {
      if (!ctx || !master) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(165, t);
      o.frequency.exponentialRampToValueAtTime(52, t + 0.11);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(1, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.4);
    };

    const noiseHit = (
      t: number,
      dur: number,
      type: BiquadFilterType,
      freq: number,
      vol: number
    ) => {
      if (!ctx || !master || !noiseBuf) return;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f).connect(g).connect(master);
      src.start(t);
      src.stop(t + dur + 0.02);
    };

    const schedule = () => {
      if (!ctx) return;
      while (nextTime < ctx.currentTime + SCHEDULE_AHEAD) {
        const s = step % STEPS;
        if (BOMBO[s]) bombo(nextTime);
        if (REDOBLANTE[s]) noiseHit(nextTime, 0.13, "bandpass", 1900, 0.5);
        if (PLATILLO[s]) {
          noiseHit(nextTime, s % 6 === 0 ? 0.4 : 0.16, "highpass", 6500, s % 6 === 0 ? 0.24 : 0.11);
        }
        nextTime += STEP_DUR;
        step++;
      }
    };

    const ensureCtx = () => {
      if (ctx) return;
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      // ruido blanco reutilizable para redoblante y platillos
      const len = Math.floor(ctx.sampleRate * 0.5);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    };

    const start = () => {
      ensureCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      if (timer === null) {
        nextTime = ctx.currentTime + 0.05;
        step = 0;
        timer = window.setInterval(schedule, LOOKAHEAD_MS);
      }
    };

    const stopScheduler = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    // --- disparador por proximidad ---
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const d = Math.hypot(vehicleState.x - NORTH_X, vehicleState.z - NORTH_Z);
      const inside = d < CHIRIMIA_PLAZA_R;
      if (inside !== active) {
        active = inside;
        audioState.chirimiaActive = inside; // el ambiente se agacha
        if (inside) start();
      }
      if (!ctx || !master) return;
      // volumen objetivo: entra suave, se va suave, y respeta el mute global
      const target = active && !audioState.muted ? 0.42 : 0;
      master.gain.setTargetAtTime(target, ctx.currentTime, 0.25);
      // si ya está callada del todo, apagamos el reloj (cero costo fuera)
      if (!active && master.gain.value < 0.001) stopScheduler();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      stopScheduler();
      audioState.chirimiaActive = false;
      ctx?.close().catch(() => {});
    };
  }, []);

  return null;
}
