// Sound library using Web Audio API
export type SoundType = "start" | "transition" | "end"

export interface Sound {
  id: string
  name: string
  play: () => void
}

// Create a sound using Web Audio API
const createSound = (
  name: string,
  id: string,
  options: {
    type?: OscillatorType
    frequency?: number
    duration?: number
    volume?: number
    attack?: number
    decay?: number
    wave?: (audioContext: AudioContext, oscillator: OscillatorNode) => void
  },
) => {
  const { type = "sine", frequency = 440, duration = 200, volume = 0.3, attack = 0.01, decay = 0.1, wave } = options

  const sound: Sound = {
    id,
    name,
    play: () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.type = type
        oscillator.frequency.value = frequency

        // Apply custom wave function if provided
        if (wave) {
          wave(audioContext, oscillator)
        }

        // Apply attack
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + attack)

        // Apply decay
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000)

        oscillator.start()

        setTimeout(() => {
          oscillator.stop()
          audioContext.close()
        }, duration)
      } catch (error) {
        console.error("Error playing sound:", error)
      }
    },
  }

  return sound
}

// Create a more sophisticated meeting chime sound using Web Audio API
const createMeetingChimeSound = (name: string, id: string): Sound => {
  return {
    id,
    name,
    play: () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

        // Create a more complex sound with multiple oscillators
        const createOscillator = (
          freq: number,
          type: OscillatorType,
          delay: number,
          duration: number,
          volume: number,
        ) => {
          const osc = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          osc.type = type
          osc.frequency.value = freq

          gainNode.gain.setValueAtTime(0, audioContext.currentTime)
          gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + delay + 0.05)
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime + delay + duration - 0.05)
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + delay + duration)

          osc.connect(gainNode)
          gainNode.connect(audioContext.destination)

          osc.start(audioContext.currentTime + delay)
          osc.stop(audioContext.currentTime + delay + duration)
        }

        // Create a bell-like sound with multiple harmonics
        createOscillator(523.25, "sine", 0, 0.6, 0.3) // C5
        createOscillator(659.25, "sine", 0.1, 0.5, 0.2) // E5
        createOscillator(783.99, "sine", 0.2, 0.4, 0.15) // G5
        createOscillator(1046.5, "sine", 0.3, 0.3, 0.1) // C6

        // Close the audio context after the sound is done
        setTimeout(() => {
          audioContext.close()
        }, 1000)
      } catch (error) {
        console.error("Error playing meeting chime sound:", error)
      }
    },
  }
}

// Create a fallback sound to use if audio files fail to load
const fallbackSound = createSound("Fallback Sound", "fallback", {
  frequency: 440,
  duration: 300,
  type: "sine",
  volume: 0.3,
})

// Create a sound library with at least 10 different sounds
export const soundLibrary: Record<string, Sound> = {
  // Meeting chime sound (synthesized instead of using audio file)
  "meeting-chime-2": createMeetingChimeSound("Meeting Chime 2", "meeting-chime-2"),

  // Original synthesized meeting chime
  "meeting-chime": createSound("Meeting Chime", "meeting-chime", {
    duration: 800,
    wave: (ctx, osc) => {
      osc.frequency.setValueAtTime(659.25, ctx.currentTime) // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2) // G5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.4) // C6
    },
    volume: 0.4,
    attack: 0.02,
    decay: 0.5,
  }),

  // Simple beeps
  "simple-high": createSound("Simple High", "simple-high", { frequency: 880, duration: 200 }),
  "simple-medium": createSound("Simple Medium", "simple-medium", { frequency: 440, duration: 150 }),
  "simple-low": createSound("Simple Low", "simple-low", { frequency: 220, duration: 500 }),

  // Chimes
  "chime-bright": createSound("Bright Chime", "chime-bright", {
    frequency: 1200,
    duration: 800,
    type: "sine",
    attack: 0.01,
    decay: 0.5,
  }),
  "chime-soft": createSound("Soft Chime", "chime-soft", {
    frequency: 800,
    duration: 1000,
    type: "sine",
    attack: 0.05,
    decay: 0.8,
    volume: 0.2,
  }),

  // Alerts
  "alert-short": createSound("Short Alert", "alert-short", {
    frequency: 660,
    duration: 100,
    type: "square",
    volume: 0.2,
  }),
  "alert-double": createSound("Double Alert", "alert-double", {
    duration: 400,
    wave: (ctx, osc) => {
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15)
    },
  }),

  // Notifications
  "notification-gentle": createSound("Gentle Notification", "notification-gentle", {
    frequency: 523.25, // C5
    duration: 300,
    type: "sine",
    volume: 0.25,
  }),
  "notification-rising": createSound("Rising Notification", "notification-rising", {
    duration: 500,
    wave: (ctx, osc) => {
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.5)
    },
  }),
  "notification-falling": createSound("Falling Notification", "notification-falling", {
    duration: 500,
    wave: (ctx, osc) => {
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5)
    },
  }),

  // Success sounds
  "success-complete": createSound("Success Complete", "success-complete", {
    duration: 600,
    wave: (ctx, osc) => {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2) // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.4) // G5
    },
  }),

  // Error sounds
  "error-buzz": createSound("Error Buzz", "error-buzz", {
    frequency: 110,
    duration: 300,
    type: "sawtooth",
    volume: 0.2,
  }),
}

// Default sound selections
export const defaultSoundSelections: Record<SoundType, string> = {
  start: "meeting-chime-2",
  transition: "simple-medium",
  end: "meeting-chime-2",
}

// Get a sound by ID
export const getSoundById = (id: string): Sound | undefined => {
  return soundLibrary[id]
}

// Play a sound by ID
export const playSoundById = (id: string): void => {
  const sound = getSoundById(id)
  if (sound) {
    sound.play()
  } else {
    console.warn(`Sound with ID "${id}" not found, playing fallback sound`)
    fallbackSound.play()
  }
}
