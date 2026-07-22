import { useEffect } from "react";
import { vehicleState } from "../utils/vehicleState";
import { audioState } from "../utils/audioState";

// SONIDO DEL VEHÍCULO — todo SINTETIZADO con Web Audio (cero archivos).
//
// El MOTOR no es un sawtooth pelado (eso sonaba a zumbido de módem). Es un
// motor con propiedad, armado como los buenos synth-engines:
//   · dos sawtooth al UNÍSONO, uno desafinado → grosor y "batido" de cilindros
//   · WaveShaper (tanh, oversample 4x) → distorsión/growl: los armónicos que
//     dan sensación de FUERZA, sin el aliasing "digital feo"
//   · DOS formantes resonantes (bandpass) barridos con las RPM → el timbre
//     gutural del escape (una vocal, no un pitido plano)
//   · sub sine una octava abajo → el golpe en el pecho
//   · ruido de admisión (aire) que entra bajo carga
//   · "chug" por un LFO que modula la amplitud → latido del motor
// Todo sube de tono, brillo y cuerpo con la velocidad y el acelerador.
//
// Rodadura, chirrido, chapoteo, golpes y reverb: igual que antes. Respeta el
// mute global (audioState.muted) y se agacha bajo la chirimía.

const CAR_TOP = 16; // ~CAR_TOP_SPEED de Vehicle: normaliza la rapidez a 0..1
const MASTER = 0.9;
const IMPACT_COOLDOWN_MS = 130;
const ENGINE_DRIVE = 2.4; // "garra" del motor: más = más rugido/distorsión

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

    // --- ruido blanco en loop (rodadura, agua, chirrido, admisión) ---
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

    // admisión de aire (whoosh bajo carga)
    const intakeBP = ctx.createBiquadFilter();
    intakeBP.type = "bandpass";
    intakeBP.frequency.value = 1400;
    intakeBP.Q.value = 0.9;
    const intakeGain = ctx.createGain();
    intakeGain.gain.value = 0;
    noise.connect(intakeBP).connect(intakeGain).connect(master);

    // ===================== MOTOR =====================
    // dos sawtooth al unísono (uno desafinado) → suma → shaper → formantes →
    // tono (lowpass) → chug (LFO) → engineGain → master
    const oscMix = ctx.createGain();
    oscMix.gain.value = 0.5;
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.value = 42;
    const osc2 = ctx.createOscillator();
    osc2.type = "sawtooth";
    osc2.frequency.value = 42;
    osc2.detune.value = 9; // batido de cilindros
    osc1.connect(oscMix);
    osc2.connect(oscMix);

    // tanh soft-clip → growl con armónicos; oversample mata el aliasing
    const shaper = ctx.createWaveShaper();
    {
      const n = 1024;
      const curve = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * 2 - 1;
        curve[i] = Math.tanh(ENGINE_DRIVE * x);
      }
      shaper.curve = curve;
      shaper.oversample = "4x";
    }
    oscMix.connect(shaper);

    // dos formantes resonantes en paralelo → timbre gutural del escape
    const formantA = ctx.createBiquadFilter();
    formantA.type = "bandpass";
    formantA.frequency.value = 180;
    formantA.Q.value = 6;
    const formantB = ctx.createBiquadFilter();
    formantB.type = "bandpass";
    formantB.frequency.value = 800;
    formantB.Q.value = 7;
    const formantBGain = ctx.createGain();
    formantBGain.gain.value = 0.55;
    const formantSum = ctx.createGain();
    shaper.connect(formantA).connect(formantSum);
    shaper.connect(formantB).connect(formantBGain).connect(formantSum);

    const toneLP = ctx.createBiquadFilter();
    toneLP.type = "lowpass";
    toneLP.frequency.value = 600;
    toneLP.Q.value = 0.7;
    formantSum.connect(toneLP);

    // chugGain: base 1, lo modula el LFO (±depth) → latido. El VOLUMEN va aparte
    const chugGain = ctx.createGain();
    chugGain.gain.value = 1;
    const engineGain = ctx.createGain();
    engineGain.gain.value = 0;
    toneLP.connect(chugGain).connect(engineGain).connect(master);

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 21;
    const subGain = ctx.createGain();
    subGain.gain.value = 0;
    sub.connect(subGain).connect(master);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 12;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.14;
    lfo.connect(lfoDepth).connect(chugGain.gain);

    noise.start();
    osc1.start();
    osc2.start();
    sub.start();
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
      const duck = audioState.chirimiaActive ? 0.4 : 1;

      if (mode !== prevMode) {
        splash(mode === "boat" ? 1 : 0.45);
        prevMode = mode;
      }

      if (vehicleState.impact > 0) {
        const nowMs = performance.now();
        if (nowMs - lastImpact > IMPACT_COOLDOWN_MS) {
          lastImpact = nowMs;
          thump(vehicleState.impact / CAR_TOP + 0.15);
        }
        vehicleState.impact = 0;
      }

      if (mode === "car") {
        // RPM: idle grave (42Hz) → agudo pleno (~205Hz); el gas empuja un pelín
        const f = 42 + norm * 163 + (thr > 0 ? 12 : 0);
        osc1.frequency.setTargetAtTime(f, now, 0.06);
        osc2.frequency.setTargetAtTime(f, now, 0.06);
        sub.frequency.setTargetAtTime(f * 0.5, now, 0.06);
        // formantes se abren con las RPM → la vocal del escape sube
        formantA.frequency.setTargetAtTime(170 + norm * 320, now, 0.08);
        formantB.frequency.setTargetAtTime(720 + norm * 1500, now, 0.08);
        toneLP.frequency.setTargetAtTime(
          560 + norm * 3400 + (thr > 0 ? 600 : 0),
          now,
          0.07
        );
        lfo.frequency.setTargetAtTime(11 + norm * 40, now, 0.1);
        lfoDepth.gain.setTargetAtTime(0.14, now, 0.1);
        const vol = (0.05 + norm * 0.13 + (thr > 0 ? 0.02 : 0)) * duck;
        engineGain.gain.setTargetAtTime(vol, now, 0.06);
        subGain.gain.setTargetAtTime(vol * 0.7, now, 0.06);
        intakeGain.gain.setTargetAtTime(
          (0.008 + norm * 0.05 + (thr > 0 ? 0.03 : 0)) * duck,
          now,
          0.07
        );
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
        // Panga: peque-peque del Atrato — grave, gutural, putt-putt lento
        const f = 28 + norm * 46;
        osc1.frequency.setTargetAtTime(f, now, 0.1);
        osc2.frequency.setTargetAtTime(f, now, 0.1);
        sub.frequency.setTargetAtTime(f * 0.5, now, 0.1);
        formantA.frequency.setTargetAtTime(120 + norm * 180, now, 0.1);
        formantB.frequency.setTargetAtTime(400 + norm * 500, now, 0.1);
        toneLP.frequency.setTargetAtTime(260 + norm * 520, now, 0.1);
        lfo.frequency.setTargetAtTime(3 + norm * 7, now, 0.1);
        lfoDepth.gain.setTargetAtTime(0.34, now, 0.1);
        const vol = (0.055 + norm * 0.09) * duck;
        engineGain.gain.setTargetAtTime(vol, now, 0.08);
        subGain.gain.setTargetAtTime(vol * 0.7, now, 0.08);
        intakeGain.gain.setTargetAtTime(0, now, 0.1);
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
        osc1.stop();
        osc2.stop();
        sub.stop();
        lfo.stop();
      } catch {
        /* ya detenidos */
      }
      ctx.close().catch(() => {});
    };
  }, []);

  return null;
}
