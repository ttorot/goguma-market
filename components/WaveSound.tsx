'use client'

import { useEffect, useRef, useState } from 'react'

// 파도 소리를 브라우저가 직접 만들어 낸다(음원 파일 없이 Web Audio로 합성).
// 부드러운 잡음(갈색 노이즈)을 저음 필터에 통과시키고, 천천히 커졌다 작아지는
// 물결(LFO)을 입혀서 "쏴아—쏴아—" 밀려오는 파도 소리를 흉내 낸다.
export default function WaveSound() {
  const [on, setOn] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ noise: AudioBufferSourceNode; lfo: OscillatorNode; master: GainNode } | null>(null)

  function buildNoiseBuffer(ctx: AudioContext) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      // 갈색 노이즈: 깊고 부드러운 바다 소리에 가깝다
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    return buf
  }

  async function start() {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    const ctx = ctxRef.current
    await ctx.resume()

    const noise = ctx.createBufferSource()
    noise.buffer = buildNoiseBuffer(ctx)
    noise.loop = true

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 650
    lowpass.Q.value = 0.6

    // 물결처럼 천천히 커졌다 작아지는 음량
    const swell = ctx.createGain()
    swell.gain.value = 0.18
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.14 // 약 7초에 한 번씩 밀려오는 파도
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.13
    lfo.connect(lfoGain).connect(swell.gain)

    // 전체 음량 (켤 때 부드럽게 페이드 인)
    const master = ctx.createGain()
    master.gain.value = 0
    master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.8)

    noise.connect(lowpass).connect(swell).connect(master).connect(ctx.destination)
    noise.start()
    lfo.start()
    nodesRef.current = { noise, lfo, master }
  }

  function stop() {
    const ctx = ctxRef.current
    const nodes = nodesRef.current
    if (!ctx || !nodes) return
    const t = ctx.currentTime
    // 끌 때도 부드럽게 페이드 아웃
    nodes.master.gain.cancelScheduledValues(t)
    nodes.master.gain.setValueAtTime(nodes.master.gain.value, t)
    nodes.master.gain.linearRampToValueAtTime(0, t + 0.5)
    nodes.noise.stop(t + 0.55)
    nodes.lfo.stop(t + 0.55)
    nodesRef.current = null
  }

  function toggle() {
    if (on) {
      stop()
      setOn(false)
    } else {
      start().then(() => setOn(true)).catch(() => {})
    }
  }

  // 화면을 벗어나면 소리를 정리한다.
  useEffect(() => {
    return () => {
      try { nodesRef.current?.noise.stop() } catch { /* 이미 멈춤 */ }
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:opacity-80 active:scale-95"
      style={{
        backgroundColor: on ? 'var(--s-primary)' : 'rgba(255,255,255,0.7)',
        color: on ? 'white' : 'var(--s-text-sub)',
        borderColor: on ? 'transparent' : 'var(--s-border)',
      }}
    >
      <span>{on ? '🔊' : '🔈'}</span>
      <span>{on ? '파도 소리 끄기' : '파도 소리 켜기'}</span>
    </button>
  )
}
