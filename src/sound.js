export function playBeep(freq, duration, type = 'square') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
    osc.onended = () => ctx.close()
  } catch {}
}

export const sounds = {
  button:  (e) => e && playBeep(440, 0.08),
  nav:     (e) => e && playBeep(523, 0.1),
  nom:     (e) => { if (!e) return; playBeep(659, 0.06); setTimeout(() => playBeep(784, 0.06), 80) },
  levelup: (e) => { if (!e) return; [523,659,784,1046].forEach((f,i) => setTimeout(() => playBeep(f, i===3?0.3:0.1), i*120)) },
  modal:   (e) => e && playBeep(392, 0.12, 'sine'),
  send:    (e) => { if (!e) return; playBeep(784, 0.08); setTimeout(() => playBeep(1046, 0.12), 100) },
}
