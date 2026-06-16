type SoundType = 'wind' | 'whisper' | 'waves' | 'seagull' | 'crickets' | 'owl'

interface SoundTrack {
  source: AudioBufferSourceNode
  gain: GainNode
  type: SoundType
  volume: number
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private tracks: SoundTrack[] = []
  private fadeInterval: ReturnType<typeof setInterval> | null = null

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  private createNoiseBuffer(type: 'white' | 'pink' | 'brown', duration = 4): AudioBuffer {
    const ctx = this.getCtx()
    const length = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      if (type === 'white') {
        for (let i = 0; i < length; i++) {
          data[i] = Math.random() * 2 - 1
        }
      } else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
        for (let i = 0; i < length; i++) {
          const w = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + w * 0.0555179
          b1 = 0.99332 * b1 + w * 0.0750759
          b2 = 0.969 * b2 + w * 0.153852
          b3 = 0.8665 * b3 + w * 0.3104856
          b4 = 0.55 * b4 + w * 0.5329522
          b5 = -0.7616 * b5 - w * 0.016898
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
          b6 = w * 0.115926
        }
      } else {
        let last = 0
        for (let i = 0; i < length; i++) {
          const w = Math.random() * 2 - 1
          data[i] = (last + 0.02 * w) / 1.02
          last = data[i]
          data[i] *= 3.5
        }
      }
    }
    return buffer
  }

  private createLoopingSource(buffer: AudioBuffer): AudioBufferSourceNode {
    const ctx = this.getCtx()
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    return source
  }

  private makeWind(): { source: AudioBufferSourceNode; gain: GainNode } {
    const ctx = this.getCtx()
    const buffer = this.createNoiseBuffer('brown', 4)
    const source = this.createLoopingSource(buffer)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 400
    lp.Q.value = 0.5

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 800
    bp.Q.value = 0.3

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.15
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 200
    lfo.connect(lfoGain)
    lfoGain.connect(lp.frequency)
    lfo.start()

    const gain = ctx.createGain()
    gain.gain.value = 0.6

    source.connect(lp)
    source.connect(bp)
    lp.connect(gain)
    bp.connect(gain)

    return { source, gain }
  }

  private makeWhisper(): { source: AudioBufferSourceNode; gain: GainNode } {
    const ctx = this.getCtx()
    const buffer = this.createNoiseBuffer('pink', 4)
    const source = this.createLoopingSource(buffer)

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2000
    hp.Q.value = 0.5

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.08
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.3
    lfo.connect(lfoGain)

    const gain = ctx.createGain()
    gain.gain.value = 0.15
    lfoGain.connect(gain.gain)
    lfo.start()

    source.connect(hp)
    hp.connect(gain)

    return { source, gain }
  }

  private makeWaves(): { source: AudioBufferSourceNode; gain: GainNode } {
    const ctx = this.getCtx()
    const buffer = this.createNoiseBuffer('brown', 6)
    const source = this.createLoopingSource(buffer)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 600
    lp.Q.value = 0.7

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.1
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.4
    lfo.connect(lfoGain)

    const gain = ctx.createGain()
    gain.gain.value = 0.5
    lfoGain.connect(gain.gain)
    lfo.start()

    source.connect(lp)
    lp.connect(gain)

    return { source, gain }
  }

  private makeSeagull(): { source: AudioBufferSourceNode; gain: GainNode } {
    const ctx = this.getCtx()
    const buffer = this.createNoiseBuffer('white', 4)
    const source = this.createLoopingSource(buffer)

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 3000
    bp.Q.value = 15

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.03
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.08
    lfo.connect(lfoGain)

    const gain = ctx.createGain()
    gain.gain.value = 0.03
    lfoGain.connect(gain.gain)
    lfo.start()

    source.connect(bp)
    bp.connect(gain)

    return { source, gain }
  }

  private makeCrickets(): { source: AudioBufferSourceNode; gain: GainNode } {
    const ctx = this.getCtx()
    const buffer = this.createNoiseBuffer('white', 4)
    const source = this.createLoopingSource(buffer)

    const bp1 = ctx.createBiquadFilter()
    bp1.type = 'bandpass'
    bp1.frequency.value = 4500
    bp1.Q.value = 30

    const bp2 = ctx.createBiquadFilter()
    bp2.type = 'bandpass'
    bp2.frequency.value = 5500
    bp2.Q.value = 25

    const lfo = ctx.createOscillator()
    lfo.type = 'square'
    lfo.frequency.value = 6
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.25
    lfo.connect(lfoGain)

    const gain = ctx.createGain()
    gain.gain.value = 0.15
    lfoGain.connect(gain.gain)
    lfo.start()

    const merger = ctx.createChannelMerger(2)
    source.connect(bp1)
    source.connect(bp2)
    bp1.connect(merger, 0, 0)
    bp2.connect(merger, 0, 1)
    merger.connect(gain)

    return { source, gain }
  }

  private makeOwl(): { source: AudioBufferSourceNode; gain: GainNode } {
    const ctx = this.getCtx()
    const buffer = this.createNoiseBuffer('pink', 4)
    const source = this.createLoopingSource(buffer)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 300
    lp.Q.value = 1

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.015
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.1
    lfo.connect(lfoGain)

    const gain = ctx.createGain()
    gain.gain.value = 0.08
    lfoGain.connect(gain.gain)
    lfo.start()

    source.connect(lp)
    lp.connect(gain)

    return { source, gain }
  }

  private createSound(type: SoundType): { source: AudioBufferSourceNode; gain: GainNode } {
    switch (type) {
      case 'wind':
        return this.makeWind()
      case 'whisper':
        return this.makeWhisper()
      case 'waves':
        return this.makeWaves()
      case 'seagull':
        return this.makeSeagull()
      case 'crickets':
        return this.makeCrickets()
      case 'owl':
        return this.makeOwl()
    }
  }

  play(sounds: { type: SoundType; volume: number }[], masterVolume: number): void {
    this.stop()

    const ctx = this.getCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    this.masterGain = ctx.createGain()
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime)
    this.masterGain.gain.linearRampToValueAtTime(masterVolume, ctx.currentTime + 3)
    this.masterGain.connect(ctx.destination)

    this.tracks = []

    for (const sound of sounds) {
      const { source, gain } = this.createSound(sound.type)
      gain.gain.value = sound.volume
      gain.connect(this.masterGain!)
      source.start()
      this.tracks.push({ source, gain, type: sound.type, volume: sound.volume })
    }
  }

  setTrackVolume(type: SoundType, volume: number): void {
    const track = this.tracks.find((t) => t.type === type)
    if (track) {
      track.gain.gain.value = volume
      track.volume = volume
    }
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGain) return
    const ctx = this.getCtx()
    this.masterGain.gain.setValueAtTime(volume, ctx.currentTime)
  }

  fadeOut(durationSeconds = 30): void {
    if (!this.masterGain) return
    const ctx = this.getCtx()
    const current = this.masterGain.gain.value
    this.masterGain.gain.setValueAtTime(current, ctx.currentTime)
    this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSeconds)

    if (this.fadeInterval) clearInterval(this.fadeInterval)
    this.fadeInterval = setInterval(() => {
      if (this.masterGain && this.masterGain.gain.value < 0.001) {
        this.stop()
        if (this.fadeInterval) clearInterval(this.fadeInterval)
        this.fadeInterval = null
      }
    }, 500)
  }

  stop(): void {
    for (const track of this.tracks) {
      try { track.source.stop() } catch {}
    }
    this.tracks = []
    if (this.masterGain) {
      try { this.masterGain.disconnect() } catch {}
      this.masterGain = null
    }
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }
  }

  pause(): void {
    const ctx = this.getCtx()
    if (ctx.state === 'running') {
      ctx.suspend()
    }
  }

  resume(): void {
    const ctx = this.getCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  }

  isRunning(): boolean {
    return this.tracks.length > 0
  }
}

export const audioEngine = new AudioEngine()
export type { SoundType }
