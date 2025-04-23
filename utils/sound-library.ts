"use client"

// Sound library using Web Audio API
export type SoundType = "start" | "transition" | "end"

export interface Sound {
  id: string
  name: string
  play: () => void
}

// Simple beep sound generator
const createBeep = (
  name: string,
  id: string,
  options: {
    frequency?: number
    duration?: number
    volume?: number
    type?: OscillatorType
  } = {},
) => {
  const { frequency = 440, duration = 200, volume = 0.3, type = "sine" } = options

  return {
    id,
    name,
    play: () => {
      try {
        // Safety check for browser environment
        if (typeof window === "undefined" || typeof AudioContext === "undefined") {
          console.warn("Audio is not supported in this environment")
          return
        }

        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.type = type
        oscillator.frequency.value = frequency
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Set volume
        gainNode.gain.value = volume

        // Start and stop
        oscillator.start()

        // Fade out
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000)

        // Stop and clean up
        setTimeout(() => {
          oscillator.stop()
          oscillator.disconnect()
          gainNode.disconnect()
          audioContext.close().catch((e) => console.error("Error closing AudioContext:", e))
        }, duration)
      } catch (error) {
        console.error(`Error playing sound "${name}":`, error)
      }
    },
  }
}

// Create a multi-tone sound (like a chime)
const createMultiToneSound = (
  name: string,
  id: string,
  frequencies: number[],
  options: {
    duration?: number
    volume?: number
    type?: OscillatorType
  } = {},
) => {
  const { duration = 500, volume = 0.2, type = "sine" } = options

  return {
    id,
    name,
    play: () => {
      try {
        // Safety check for browser environment
        if (typeof window === "undefined" || typeof AudioContext === "undefined") {
          console.warn("Audio is not supported in this environment")
          return
        }

        const audioContext = new AudioContext()

        // Create oscillators for each frequency
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.type = type
          oscillator.frequency.value = freq
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          // Stagger the start times slightly
          const startDelay = index * 0.1
          const noteDuration = duration / 1000 - startDelay

          // Set initial volume
          gainNode.gain.value = volume

          // Start with a slight delay for each note
          oscillator.start(audioContext.currentTime + startDelay)

          // Fade out
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startDelay + noteDuration)

          // Stop
          setTimeout(
            () => {
              oscillator.stop()
              oscillator.disconnect()
              gainNode.disconnect()
            },
            (startDelay + noteDuration) * 1000,
          )
        })

        // Close the audio context after all sounds are done
        setTimeout(() => {
          audioContext.close().catch((e) => console.error("Error closing AudioContext:", e))
        }, duration + 100)
      } catch (error) {
        console.error(`Error playing multi-tone sound "${name}":`, error)
      }
    },
  }
}

// Create a sound library with simple synthesized sounds
export const soundLibrary: Record<string, Sound> = {
  // Simple beeps
  "simple-high": createBeep("Simple High", "simple-high", {
    frequency: 880,
    duration: 200,
  }),

  "simple-medium": createBeep("Simple Medium", "simple-medium", {
    frequency: 440,
    duration: 150,
  }),

  "simple-low": createBeep("Simple Low", "simple-low", {
    frequency: 220,
    duration: 300,
  }),

  // Chimes and notifications
  "meeting-chime": createMultiToneSound(
    "Meeting Chime",
    "meeting-chime",
    [523.25, 659.25, 783.99], // C5, E5, G5
    { duration: 800, volume: 0.3 },
  ),

  "meeting-chime-2": createMultiToneSound(
    "Meeting Chime 2",
    "meeting-chime-2",
    [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6
    { duration: 1000, volume: 0.25 },
  ),

  notification: createMultiToneSound(
    "Notification",
    "notification",
    [440, 554.37], // A4, C#5
    { duration: 400, volume: 0.2 },
  ),

  // Alert sounds
  alert: createBeep("Alert", "alert", {
    frequency: 660,
    duration: 250,
    type: "square",
    volume: 0.15,
  }),

  warning: createBeep("Warning", "warning", {
    frequency: 220,
    duration: 300,
    type: "sawtooth",
    volume: 0.15,
  }),
}

// Default sound selections
export const defaultSoundSelections: Record<SoundType, string> = {
  start: "meeting-chime-2",
  transition: "simple-medium",
  end: "meeting-chime",
}

// Get a sound by ID with fallback
export const getSoundById = (id: string): Sound => {
  return soundLibrary[id] || soundLibrary["simple-medium"]
}

// Play a sound by ID with error handling
export const playSoundById = (id: string): void => {
  try {
    // Safety check for browser environment
    if (typeof window === "undefined") {
      return
    }

    const sound = getSoundById(id)
    sound.play()
  } catch (error) {
    console.error("Error in playSoundById:", error)
  }
}
