import { useEffect } from "react";
import { vehicleState } from "../utils/vehicleState";
import { audioState } from "../utils/audioState";

// SONIDO DEL VEHÍCULO — todo SINTETIZADO con Web Audio (cero archivos):
//   · motor que sube de tono y brillo con la velocidad y el acelerador
//   · rodadura de llantas (ruido filtrado) que crece con la rapidez
//   · chirrido al frenar fuerte
//   · panga: el mismo motor pero grave y gutural (peque-peque) + agua
//   · chapoteo al entrar/salir del agua
//   · golpe al chocar, escalado por la fuerza, con un reverb corto sintetizado
//
// Igual que la chirimía: no meto grabaciones (licencia + peso); la síntesis
// responde en vivo a la física y nunca se repite. Mismo espíritu que el
// sistema de sonido del folio de Bruno Simon, pero procedural y autocontenido.
// Respeta el mute global (audioState.muted) y se agacha bajo la chirimía.

const CAR_TOP = 16; // ~CAR_TOP_SPEED de Vehicle: normaliza la rapidez a 0..1
const MASTER = 0.9;
const IMPACT_COOLDOWN_MS = 130;

export default function VehicleAudio() {
  useEffect(() => {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;

    const ctx = new AC();
    let started = false;
    let raf = 0;
    let prevMode: "car" | "boat" = "car";
    let lastImpact = 0;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // --- reverb corto: IR sintetizada (ruido con decaimiento exponencial) ---
    const convolver = ctx.createConvolver();
    {
      const len = Math.floor(ctx.sampleRate * 1.1);
      const ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
        }
      }
      convolver.buffer = ir;
    }
    const reverbReturn = ctx.createGain();
    reverbReturn.gain.value = 0.5;
    convolver.connect(reverbReturn).connect(master);

    // --- ruido blanco en loop (rodadura, agua, chirrido) ---
    const noiseBuf = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * 2),
      ctx.sampleRate
    );
    {
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const tireBP = ctx.createBiquadFilter();
    tireBP.type = "bandpass";
    tireBP.frequency.value = 1200;
    tireBP.Q.value = 0.7;
    const tireGain = ctx.createGain();
    tireGain.gain.value = 0;
    noise.connect(tireBP).connect(tireGain).connect(master);

    const waterLP = ctx.createBiquadFilter();
    waterLP.type = "lowpass";
    waterLP.frequency.value = 520;
    const waterGain = ctx.createGain();
    waterGain.gain.value = 0;
    noise.connect(waterLP).connect(waterGain).connect(master);

    const screechBP = ctx.createBiquadFilter();
    screechBP.type = "bandpass";
    screechBP.frequency.value = 1500;
    screechBP.Q.value = 6;
    const screechGain = ctx.createGain();
    screechGain.gain.value = 0;
    noise.connect(screechBP).connect(screechGain).connect(master);

    // --- motor: sawtooth + sub sine, lowpass resonante, "chug" por LFO ---
    const oscMain = ctx.createOscillator();
    oscMain.type = "sawtooth";
    oscMain.frequency.value = 46;
    const engineLP = ctx.createBiquadFilter();
    engineLP.type = "lowpass";
    engineLP.frequency.value = 400;
    engineLP.Q.value = 1.2;
    // chugGain lleva base 1 y lo modula el LFO (±depth) → latido del motor.
    // El VOLUMEN lo pone engineGain aparte (no se pelean por el mismo param).
    const chugGain = ctx.createGain();
    chugGain.gain.value = 1;
    const engineGain = ctx.createGain();
    engineGain.gain.value = 0;
    oscMain.connect(engineLP).connect(chugGain).connect(engineGain).connect(master);

    const oscSub = ctx.createOscillator();
    oscSub.type = "sine";
    oscSub.frequency.value = 23;
    const subGain = ctx.createGain();
    subGain.gain.value = 0;
    oscSub.connect(subGain).connect(master);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 8;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.12;
    lfo.connect(lfoDepth).connect(chugGain.gain);

    noise.start();
    oscMain.start();
    oscSub.start();
    lfo.start();

    // --- transitorios (nodos de un solo uso) ---
    const thump = (strength: number) => {
      const s = Math.min(1, strength);
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(0.6 * s, t + 0.005);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.connect(og).connect(master);
      og.connect(convolver);
      o.start(t);
      o.stop(t + 0.34);
      // "crunch" de ruido (más abierto cuanto más fuerte el golpe)
      const n = ctx.createBufferSource();
      n.buffer = noiseBuf;
      const nf = ctx.createBiquadFilter();
      nf.type = "lowpass";
      nf.frequency.value = 500 + 900 * s;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.5 * s, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      n.connect(nf).connect(ng).connect(master);
      ng.connect(convolver);
      n.start(t);
      n.stop(t + 0.16);
    };

    const splash = (strength: number) => {
      const s = Math.min(1, strength);
      const t = ctx.currentTime;
      const n = ctx.createBufferSource();
      n.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 0.8;
      bp.frequency.setValueAtTime(1400, t);
      bp.frequency.exponentialRampToValueAtTime(320, t + 0.3);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5 * s, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      n.connect(bp).connect(g).connect(master);
      g.connect(convolver);
      n.start(t);
      n.stop(t + 0.45);
    };

    // El primer gesto real del usuario desbloquea el audio (política de autoplay)
    const unlock = () => {
      if (started) return;
      started = true;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("mundo:reveal", unlock);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = ctx.currentTime;
      const on = started && !audioState.muted;
      master.gain.setTargetAtTime(on ? MASTER : 0, now, 0.05);
      if (!on) return;

      const mode = vehicleState.mode;
      const norm = Math.min(1, vehicleState.speed / CAR_TOP);
      const thr = vehicleState.throttle;
      // Bajo la chirimía de la plaza, el motor se agacha para dejarla brillar
      const duck = audioState.chirimiaActive ? 0.4 : 1;

      // Chapoteo en la transición de modo
      if (mode !== prevMode) {
        splash(mode === "boat" ? 1 : 0.45);
        prevMode = mode;
      }

      // Golpe al chocar (con cooldown para no ametrallar al raspar)
      if (vehicleState.impact > 0) {
        const nowMs = performance.now();
        if (nowMs - lastImpact > IMPACT_COOLDOWN_MS) {
          lastImpact = nowMs;
          thump(vehicleState.impact / CAR_TOP + 0.15);
        }
        vehicleState.impact = 0;
      }

      if (mode === "car") {
        const f = 46 + norm * 74 + (thr > 0 ? 8 : 0);
        oscMain.frequency.setTargetAtTime(f, now, 0.08);
        oscSub.frequency.setTargetAtTime(f * 0.5, now, 0.08);
        engineLP.frequency.setTargetAtTime(
          360 + norm * 2300 + (thr > 0 ? 500 : 0),
          now,
          0.08
        );
        lfo.frequency.setTargetAtTime(7 + norm * 26, now, 0.1);
        lfoDepth.gain.setTargetAtTime(0.12, now, 0.1);
        const vol = (0.035 + norm * 0.09 + (thr > 0 ? 0.02 : 0)) * duck;
        engineGain.gain.setTargetAtTime(vol, now, 0.06);
        subGain.gain.setTargetAtTime(vol * 0.5, now, 0.06);
        tireGain.gain.setTargetAtTime(norm * 0.05 * duck, now, 0.05);
        waterGain.gain.setTargetAtTime(0, now, 0.1);
        const screech =
          vehicleState.braking && norm > 0.28 ? (0.04 + norm * 0.06) * duck : 0;
        screechGain.gain.setTargetAtTime(
          screech,
          now,
          screech > 0 ? 0.01 : 0.08
        );
      } else {
        // Panga: motor grave y gutural (peque-peque del Atrato), agua en vez de
        // llantas, LFO lento y profundo para el "putt-putt".
        const f = 30 + norm * 40;
        oscMain.frequency.setTargetAtTime(f, now, 0.1);
        oscSub.frequency.setTargetAtTime(f * 0.5, now, 0.1);
        engineLP.frequency.setTargetAtTime(200 + norm * 640, now, 0.1);
        lfo.frequency.setTargetAtTime(3 + norm * 7, now, 0.1);
        lfoDepth.gain.setTargetAtTime(0.34, now, 0.1);
        const vol = (0.05 + norm * 0.08) * duck;
        engineGain.gain.setTargetAtTime(vol, now, 0.08);
        subGain.gain.setTargetAtTime(vol * 0.6, now, 0.08);
        waterGain.gain.setTargetAtTime((0.01 + norm * 0.05) * duck, now, 0.06);
        tireGain.gain.setTargetAtTime(0, now, 0.08);
        screechGain.gain.setTargetAtTime(0, now, 0.1);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("mundo:reveal", unlock);
      try {
        noise.stop();
        oscMain.stop();
        oscSub.stop();
        lfo.stop();
      } catch {
        /* ya detenidos */
      }
      ctx.close().catch(() => {});
    };
  }, []);

  return null;
}
