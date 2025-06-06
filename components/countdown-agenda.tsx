"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RefreshCw,
  Volume2,
  VolumeX,
  ExternalLink,
  Clock,
  HelpCircle,
  FileText,
  Video,
  FileDown,
  Square,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { AgendaSettingsDialog } from "./agenda-settings-dialog"
import { TemplateManagerDialog } from "./template-manager-dialog"
import { type SoundType, defaultSoundSelections, playSoundById } from "@/utils/sound-library"
import type { AgendaItem, AgendaSettings, AgendaTemplate } from "@/types/agenda-types"
import { getSettings, saveSettings, saveTemplate, generateId } from "@/utils/template-storage"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MeetingSummaryDialog } from "./meeting-summary-dialog"

// Update the defaultAgenda to include default colors
const defaultAgenda: AgendaItem[] = [
  { title: "Segue", time: 5, color: "" },
  { title: "Data", time: 5, color: "" },
  { title: "Rocks", time: 5, color: "" },
  { title: "Headlines", time: 5, color: "" },
  { title: "To-Dos", time: 5, color: "" },
  { title: "Issues", time: 60, color: "" },
  { title: "Conclude", time: 5, color: "" },
]

// Default settings
const defaultSettings: AgendaSettings = {
  title: "L10 Meeting Agenda",
  agenda: defaultAgenda,
  soundSelections: defaultSoundSelections,
  fontSettings: {
    family: "Inter",
    titleSize: 16,
    itemSize: 14,
    timeSize: 16,
  },
}

// Timer state storage key
const TIMER_STATE_KEY = "countdown-agenda-timer-state"
const COMMAND_KEY = "countdown-agenda-command"

// Interface for tracking item time data
interface ItemTimeData {
  plannedDuration: number // in seconds
  actualDuration: number // in seconds
  overTime: number // in seconds (positive if over, negative if under)
  completed: boolean
}

interface CountdownAgendaProps {
  isPopout?: boolean
}

export default function CountdownAgenda({ isPopout = false }: CountdownAgendaProps) {
  // Use a single settings state object
  const [settings, setSettings] = useState<AgendaSettings>(defaultSettings)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundInitialized, setSoundInitialized] = useState(false)
  const [popoutWindow, setPopoutWindow] = useState<Window | null>(null)
  const lastCommandRef = useRef<string | null>(null)
  const [valuesExpanded, setValuesExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const wasRunningRef = useRef(false)
  const [isOvertime, setIsOvertime] = useState(false)
  const [overtimeSeconds, setOvertimeSeconds] = useState(0)
  const [itemTimeData, setItemTimeData] = useState<ItemTimeData[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const [meetingCompleted, setMeetingCompleted] = useState(false)
  const [showEndMeetingDialog, setShowEndMeetingDialog] = useState(false)
  const [showManualEndButton, setShowManualEndButton] = useState(false)

  // Reference to track the last time we updated
  const lastTickTimeRef = useRef<number>(Date.now())

  // Load saved settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = getSettings()
      if (savedSettings) {
        setSettings(savedSettings)
      }
    } catch (error) {
      console.error("Error loading saved settings:", error)
    }

    // Listen for commands from popout window
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === COMMAND_KEY) {
        try {
          const commandData = JSON.parse(e.newValue || "")
          const { command, timestamp } = commandData

          // Prevent duplicate command processing
          if (lastCommandRef.current === `${command}-${timestamp}`) return
          lastCommandRef.current = `${command}-${timestamp}`

          // Process commands
          switch (command) {
            case "pause":
              setRunning(false)
              break
            case "resume":
              setRunning(true)
              break
            case "next":
              skipToNext()
              break
            case "reset":
              resetAgenda()
              break
          }
        } catch (error) {
          console.error("Error processing command:", error)
        }
      }
    }

    // If this is the popout window, also load the timer state
    if (isPopout) {
      try {
        const timerStateStr = localStorage.getItem(TIMER_STATE_KEY)
        if (timerStateStr) {
          const timerState = JSON.parse(timerStateStr)
          setCurrentIndex(timerState.currentIndex)
          setTimeLeft(timerState.timeLeft)
          setRunning(timerState.running)
          setTotalElapsed(timerState.totalElapsed)
          setIsOvertime(timerState.isOvertime)
          setOvertimeSeconds(timerState.overtimeSeconds)
          setItemTimeData(timerState.itemTimeData || [])
          setMeetingCompleted(timerState.meetingCompleted || false)
          setShowEndMeetingDialog(timerState.showEndMeetingDialog || false)
          setShowManualEndButton(timerState.showManualEndButton || false)
        }
      } catch (error) {
        console.error("Error loading timer state in popout:", error)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [isPopout])

  // Initialize item time data when settings change
  useEffect(() => {
    // Only initialize if it's empty or the agenda length changed
    if (itemTimeData.length !== settings.agenda.length) {
      const newItemTimeData = settings.agenda.map((item) => ({
        plannedDuration: item.time * 60,
        actualDuration: 0,
        overTime: 0,
        completed: false,
      }))
      setItemTimeData(newItemTimeData)
    }
  }, [settings.agenda, itemTimeData.length])

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      saveSettings(settings)
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }, [settings])

  // Sync timer state to localStorage for popout window
  useEffect(() => {
    try {
      localStorage.setItem(
        TIMER_STATE_KEY,
        JSON.stringify({
          currentIndex,
          timeLeft,
          running,
          totalElapsed,
          isOvertime,
          overtimeSeconds,
          itemTimeData,
          meetingCompleted,
          showEndMeetingDialog,
          showManualEndButton,
          lastUpdated: Date.now(),
        }),
      )
    } catch (error) {
      console.error("Error syncing timer state:", error)
    }
  }, [
    currentIndex,
    timeLeft,
    running,
    totalElapsed,
    isOvertime,
    overtimeSeconds,
    itemTimeData,
    meetingCompleted,
    showEndMeetingDialog,
    showManualEndButton,
  ])

  // Close popout window when main window closes
  useEffect(() => {
    if (isPopout) return // Skip this effect in the popout window

    return () => {
      if (popoutWindow && !popoutWindow.closed) {
        popoutWindow.close()
      }
    }
  }, [popoutWindow, isPopout])

  // Completely revised timer effect with simplified overtime logic
  useEffect(() => {
    if (!running || currentIndex === null || isDragging) return

    const timerInterval = setInterval(() => {
      // Calculate time since last tick to handle potential delays
      const now = Date.now()
      const elapsed = Math.floor((now - lastTickTimeRef.current) / 1000)
      lastTickTimeRef.current = now

      if (elapsed <= 0) return // Skip if no time has passed

      // Update total elapsed time
      setTotalElapsed((prev) => prev + elapsed)

      // Update current item's actual duration and check for overtime
      setItemTimeData((prevData) => {
        const newData = [...prevData]
        if (newData[currentIndex]) {
          // Increment actual duration
          newData[currentIndex].actualDuration += elapsed

          // Get planned duration for current item
          const plannedDuration = newData[currentIndex].plannedDuration
          const actualDuration = newData[currentIndex].actualDuration

          // Check if we're in overtime
          if (actualDuration > plannedDuration) {
            // Calculate overtime
            newData[currentIndex].overTime = actualDuration - plannedDuration

            // If we just entered overtime
            if (!isOvertime) {
              setIsOvertime(true)
              setOvertimeSeconds(actualDuration - plannedDuration)
              playSound("transition") // Play sound when entering overtime
            } else {
              // Already in overtime, update the counter
              setOvertimeSeconds(actualDuration - plannedDuration)
            }
          }
        }
        return newData
      })

      // Update time left if not in overtime
      if (timeLeft > 0) {
        const newTimeLeft = Math.max(0, timeLeft - elapsed)
        setTimeLeft(newTimeLeft)

        // Check if we just ran out of time
        if (newTimeLeft === 0 && !isOvertime) {
          setIsOvertime(true)
          setOvertimeSeconds(0)
          playSound("transition")
        }
      }
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [running, currentIndex, isDragging, timeLeft, isOvertime])

  // Initialize Web Audio API on first user interaction
  const initializeAudio = () => {
    if (!soundInitialized) {
      try {
        // Safety check for browser environment
        if (typeof window === "undefined" || typeof AudioContext === "undefined") {
          console.warn("Audio is not supported in this environment")
          return
        }

        // Create a short silent beep to initialize audio
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Make it silent
        gainNode.gain.value = 0

        // Play it briefly
        oscillator.start()

        setTimeout(() => {
          oscillator.stop()
          oscillator.disconnect()
          gainNode.disconnect()
          audioContext.close().catch((e) => console.error("Error closing AudioContext:", e))

          // Mark as initialized
          setSoundInitialized(true)
        }, 100)
      } catch (error) {
        console.error("Failed to initialize audio:", error)
        toast({
          title: "Audio Initialization Failed",
          description: "Your browser might restrict audio playback. Try enabling sounds in your browser settings.",
          variant: "destructive",
        })
      }
    }
  }

  // Update the playSound function to use our new sound library
  const playSound = (type: SoundType) => {
    if (!soundEnabled) return

    try {
      const soundId = settings.soundSelections[type]
      if (!soundId) {
        console.warn(`No sound selected for type: ${type}`)
        return
      }

      playSoundById(soundId)
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error)
    }
  }

  // Test a specific sound
  const testSound = (soundId: string) => {
    initializeAudio()

    if (!soundId) {
      console.warn("No sound ID provided for testing")
      return
    }

    playSoundById(soundId)
  }

  // Open popout window
  const openPopout = () => {
    if (isPopout) return // Don't open another popout from the popout

    // Close existing popout if open
    if (popoutWindow && !popoutWindow.closed) {
      popoutWindow.focus()
      return
    }

    // Open new popout window
    const newWindow = window.open(
      "/popout",
      "AgendaPopout",
      "width=500,height=700,resizable=yes,scrollbars=yes,status=no,location=no",
    )

    if (newWindow) {
      setPopoutWindow(newWindow)

      // Handle popout window close
      newWindow.addEventListener("beforeunload", () => {
        setPopoutWindow(null)
      })
    } else {
      toast({
        title: "Popout Blocked",
        description: "Please allow popups for this site to use the popout feature.",
        variant: "destructive",
      })
    }
  }

  // Open user guide popup
  const openUserGuidePopup = () => {
    const userGuidePopup = window.open(
      "/user-guide-popup",
      "UserGuidePopup",
      "width=900,height=700,resizable=yes,scrollbars=yes,status=no,location=no",
    )

    if (!userGuidePopup) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to view the user guide.",
        variant: "destructive",
      })
    }
  }

  // Open video walkthrough popup
  const openVideoWalkthroughPopup = () => {
    const videoPopup = window.open(
      "/video-walkthrough",
      "VideoWalkthrough",
      "width=640,height=360,resizable=yes,scrollbars=no,status=no,location=no",
    )

    if (!videoPopup) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to view the video walkthrough.",
        variant: "destructive",
      })
    }
  }

  // Send command to main window (from popout)
  const sendCommand = (command: string) => {
    localStorage.setItem(
      COMMAND_KEY,
      JSON.stringify({
        command,
        timestamp: Date.now(),
      }),
    )
  }

  // Start the agenda - modified to initialize time tracking
  const startAgenda = () => {
    // Initialize audio context if needed
    initializeAudio()

    // Reset the last tick time
    lastTickTimeRef.current = Date.now()

    // Play the start sound
    playSound("start")

    // Reset item time data
    const newItemTimeData = settings.agenda.map((item) => ({
      plannedDuration: item.time * 60,
      actualDuration: 0,
      overTime: 0,
      completed: false,
    }))

    setItemTimeData(newItemTimeData)
    setCurrentIndex(0)
    setTimeLeft(settings.agenda[0].time * 60)
    setRunning(true)
    setTotalElapsed(0)
    setIsOvertime(false)
    setOvertimeSeconds(0)
    setMeetingCompleted(false)
    setShowEndMeetingDialog(false)
    setShowManualEndButton(false)

    if (isPopout) {
      sendCommand("start")
    }
  }

  const togglePauseResume = () => {
    initializeAudio()

    // Reset the last tick time when resuming
    if (!running) {
      lastTickTimeRef.current = Date.now()
    }

    setRunning(!running)

    if (isPopout) {
      sendCommand(running ? "pause" : "resume")
    }
  }

  // Skip to next item - modified to track completion
  const skipToNext = () => {
    initializeAudio()
    if (currentIndex === null) return

    // Reset the last tick time
    lastTickTimeRef.current = Date.now()

    // Mark current item as completed
    setItemTimeData((prevData) => {
      const newData = [...prevData]
      if (newData[currentIndex]) {
        newData[currentIndex].completed = true
      }
      return newData
    })

    const isLastItem = currentIndex === settings.agenda.length - 1

    if (isLastItem) {
      playSound("end")
      // Meeting is complete, show end meeting dialog
      setRunning(false)
      setCurrentIndex(null)
      setShowEndMeetingDialog(true)
    } else {
      playSound("transition")
      // Move to next item
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setTimeLeft(settings.agenda[nextIndex].time * 60)
      setIsOvertime(false)
      setOvertimeSeconds(0)
    }

    if (isPopout) {
      sendCommand("next")
    }
  }

  // Skip to previous item - modified to track completion
  const skipToPrevious = () => {
    initializeAudio()
    if (currentIndex === null || currentIndex === 0) return

    // Reset the last tick time
    lastTickTimeRef.current = Date.now()

    // Mark current item as not completed and reset its time data
    setItemTimeData((prevData) => {
      const newData = [...prevData]
      if (newData[currentIndex]) {
        newData[currentIndex].completed = false
        newData[currentIndex].actualDuration = 0
        newData[currentIndex].overTime = 0
      }
      return newData
    })

    playSound("transition")
    // Move to previous item
    const prevIndex = currentIndex - 1
    setCurrentIndex(prevIndex)
    setTimeLeft(settings.agenda[prevIndex].time * 60)
    setIsOvertime(false)
    setOvertimeSeconds(0)

    if (isPopout) {
      sendCommand("previous")
    }
  }

  const resetAgenda = () => {
    initializeAudio()
    setCurrentIndex(null)
    setTimeLeft(0)
    setRunning(false)
    setTotalElapsed(0)
    setIsOvertime(false)
    setOvertimeSeconds(0)
    setMeetingCompleted(false)
    setShowEndMeetingDialog(false)
    setShowManualEndButton(false)

    // Reset item time data
    const newItemTimeData = settings.agenda.map((item) => ({
      plannedDuration: item.time * 60,
      actualDuration: 0,
      overTime: 0,
      completed: false,
    }))
    setItemTimeData(newItemTimeData)

    if (isPopout) {
      sendCommand("reset")
    }
  }

  // Handle end meeting dialog response
  const handleEndMeetingResponse = (endMeeting: boolean) => {
    setShowEndMeetingDialog(false)

    if (endMeeting) {
      // User wants to end the meeting - show summary
      setMeetingCompleted(true)
      setShowSummary(true)
      // Reset elapsed time when meeting ends
      setTotalElapsed(0)
    } else {
      // User doesn't want to end the meeting - show manual end button
      setShowManualEndButton(true)
    }
  }

  // Handle manual end meeting
  const handleManualEndMeeting = () => {
    setMeetingCompleted(true)
    setShowSummary(true)
    setShowManualEndButton(false)
    // Reset elapsed time when meeting ends
    setTotalElapsed(0)
  }

  const toggleSound = () => {
    initializeAudio()
    setSoundEnabled(!soundEnabled)

    // Play a test sound when enabling
    if (!soundEnabled) {
      setTimeout(() => playSound("start"), 100)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Calculate progress percentage safely
  const getProgressPercentage = () => {
    if (currentIndex === null || !settings.agenda[currentIndex]) return 0

    // If in overtime, show 100% progress
    if (isOvertime) return 100

    const totalTime = settings.agenda[currentIndex].time * 60
    return totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0
  }

  // Calculate total meeting time
  const getTotalMeetingTime = () => {
    return settings.agenda.reduce((total, item) => total + item.time, 0)
  }

  // Calculate time remaining for the entire meeting
  const getRemainingMeetingTime = () => {
    if (currentIndex === null) return getTotalMeetingTime() * 60

    const currentItemRemaining = timeLeft > 0 ? timeLeft : 0
    const futureItemsTime = settings.agenda.slice(currentIndex + 1).reduce((total, item) => total + item.time * 60, 0)

    return currentItemRemaining + futureItemsTime
  }

  // Get next up item
  const getNextUpItem = () => {
    if (currentIndex === null || currentIndex >= settings.agenda.length - 1) return null
    return settings.agenda[currentIndex + 1]
  }

  // Get color based on time remaining - modified to handle overtime
  const getTimeColor = () => {
    if (isOvertime || timeLeft <= 0) return "red" // In overtime or time is up
    if (timeLeft <= 60) return "yellow" // 1 minute or less
    return "green" // More than 1 minute
  }

  // Update the getColorClasses function to use custom colors
  const getColorClasses = () => {
    // If in overtime, always use red
    if (isOvertime) {
      return {
        bg: "bg-red-100",
        progress: "bg-red-500",
        dot: "bg-red-500",
        text: "text-red-600",
      }
    }

    // If current item has a custom color, use it
    if (currentIndex !== null && settings.agenda[currentIndex]?.color) {
      const color = settings.agenda[currentIndex].color

      // Map color names to Tailwind classes
      switch (color) {
        case "red":
          return {
            bg: "bg-red-100",
            progress: "bg-red-500",
            dot: "bg-red-500",
            text: "text-red-600",
          }
        case "orange":
          return {
            bg: "bg-orange-100",
            progress: "bg-orange-500",
            dot: "bg-orange-500",
            text: "text-orange-600",
          }
        case "amber":
          return {
            bg: "bg-amber-100",
            progress: "bg-amber-500",
            dot: "bg-amber-500",
            text: "text-amber-600",
          }
        case "yellow":
          return {
            bg: "bg-yellow-100",
            progress: "bg-yellow-500",
            dot: "bg-yellow-500",
            text: "text-yellow-600",
          }
        case "lime":
          return {
            bg: "bg-lime-100",
            progress: "bg-lime-500",
            dot: "bg-lime-500",
            text: "text-lime-600",
          }
        case "green":
          return {
            bg: "bg-green-100",
            progress: "bg-green-500",
            dot: "bg-green-500",
            text: "text-green-600",
          }
        case "emerald":
          return {
            bg: "bg-emerald-100",
            progress: "bg-emerald-500",
            dot: "bg-emerald-500",
            text: "text-emerald-600",
          }
        case "teal":
          return {
            bg: "bg-teal-100",
            progress: "bg-teal-500",
            dot: "bg-teal-500",
            text: "text-teal-600",
          }
        case "cyan":
          return {
            bg: "bg-cyan-100",
            progress: "bg-cyan-500",
            dot: "bg-cyan-500",
            text: "text-cyan-600",
          }
        case "sky":
          return {
            bg: "bg-sky-100",
            progress: "bg-sky-500",
            dot: "bg-sky-500",
            text: "text-sky-600",
          }
        case "blue":
          return {
            bg: "bg-blue-100",
            progress: "bg-blue-500",
            dot: "bg-blue-500",
            text: "text-blue-600",
          }
        case "indigo":
          return {
            bg: "bg-indigo-100",
            progress: "bg-indigo-500",
            dot: "bg-indigo-500",
            text: "text-indigo-600",
          }
        case "violet":
          return {
            bg: "bg-violet-100",
            progress: "bg-violet-500",
            dot: "bg-violet-500",
            text: "text-violet-600",
          }
        case "purple":
          return {
            bg: "bg-purple-100",
            progress: "bg-purple-500",
            dot: "bg-purple-500",
            text: "text-purple-600",
          }
        case "fuchsia":
          return {
            bg: "bg-fuchsia-100",
            progress: "bg-fuchsia-500",
            dot: "bg-fuchsia-500",
            text: "text-fuchsia-600",
          }
        case "pink":
          return {
            bg: "bg-pink-100",
            progress: "bg-pink-500",
            dot: "bg-pink-500",
            text: "text-pink-600",
          }
        case "rose":
          return {
            bg: "bg-rose-100",
            progress: "bg-rose-500",
            dot: "bg-rose-500",
            text: "text-rose-600",
          }
      }
    }

    // If no custom color or not recognized, fall back to time-based colors
    const timeColor = getTimeColor()

    switch (timeColor) {
      case "red":
        return {
          bg: "bg-red-100",
          progress: "bg-red-500",
          dot: "bg-red-500",
          text: "text-red-600",
        }
      case "yellow":
        return {
          bg: "bg-yellow-100",
          progress: "bg-yellow-500",
          dot: "bg-yellow-500",
          text: "text-yellow-600",
        }
      default:
        return {
          bg: "bg-green-100",
          progress: "bg-green-500",
          dot: "bg-green-500",
          text: "text-green-600",
        }
    }
  }

  // Handle settings changes
  const handleSettingsChange = (newSettings: AgendaSettings) => {
    setSettings(newSettings)

    // If currently running, check if we need to update the current item
    if (currentIndex !== null) {
      // If the current index is now out of bounds, reset
      if (currentIndex >= newSettings.agenda.length) {
        setCurrentIndex(null)
        setTimeLeft(0)
        setRunning(false)
      } else {
        // Update the time left if the current item's duration changed
        const currentItem = newSettings.agenda[currentIndex]
        const oldItem = settings.agenda[currentIndex]

        if (currentItem && oldItem && currentItem.time !== oldItem.time) {
          // Calculate the percentage of time elapsed
          const oldTotalSeconds = oldItem.time * 60
          const elapsedPercentage = (oldTotalSeconds - timeLeft) / oldTotalSeconds

          // Apply that percentage to the new duration
          const newTotalSeconds = currentItem.time * 60
          const newTimeLeft = Math.round(newTotalSeconds * (1 - elapsedPercentage))

          setTimeLeft(newTimeLeft > 0 ? newTimeLeft : 1)

          // Update the planned duration in itemTimeData
          setItemTimeData((prevData) => {
            const newData = [...prevData]
            if (newData[currentIndex]) {
              newData[currentIndex].plannedDuration = currentItem.time * 60

              // Recalculate overtime
              if (newData[currentIndex].actualDuration > newData[currentIndex].plannedDuration) {
                newData[currentIndex].overTime =
                  newData[currentIndex].actualDuration - newData[currentIndex].plannedDuration
                setIsOvertime(true)
                setOvertimeSeconds(newData[currentIndex].overTime)
              } else {
                newData[currentIndex].overTime = 0
                setIsOvertime(false)
                setOvertimeSeconds(0)
              }
            }
            return newData
          })
        }
      }
    }
  }

  // Handle loading a template
  const handleLoadTemplate = (template: AgendaTemplate) => {
    // Preserve current font settings when loading a template
    setSettings({
      ...settings,
      title: template.title,
      agenda: template.agenda,
      soundSelections: template.soundSelections,
      activeTemplateId: template.id,
      // Keep the existing font settings
      fontSettings: settings.fontSettings,
    })

    // Reset the timer if running
    if (running) {
      setCurrentIndex(null)
      setTimeLeft(0)
      setRunning(false)
      setTotalElapsed(0)
      setIsOvertime(false)
      setOvertimeSeconds(0)
      setMeetingCompleted(false)

      // Reset item time data for the new template
      const newItemTimeData = template.agenda.map((item) => ({
        plannedDuration: item.time * 60,
        actualDuration: 0,
        overTime: 0,
        completed: false,
      }))
      setItemTimeData(newItemTimeData)
    }
  }

  // Handle saving current settings as a template
  const handleSaveAsTemplate = (name: string) => {
    const template: AgendaTemplate = {
      id: generateId(),
      name,
      title: settings.title,
      agenda: settings.agenda,
      soundSelections: settings.soundSelections,
      // Include font settings in the template
      fontSettings: settings.fontSettings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    saveTemplate(template)

    // Update active template ID
    setSettings({
      ...settings,
      activeTemplateId: template.id,
    })
  }

  // Handle progress bar drag start
  const handleProgressBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentIndex === null) return

    // Store if the timer was running before dragging
    wasRunningRef.current = running

    // Pause the timer while dragging
    if (running) {
      setRunning(false)
    }

    setIsDragging(true)
    updateTimeFromMousePosition(e.clientX)

    // Add event listeners for drag and release
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle progress bar touch start
  const handleProgressBarTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (currentIndex === null) return

    // Store if the timer was running before dragging
    wasRunningRef.current = running

    // Pause the timer while dragging
    if (running) {
      setRunning(false)
    }

    setIsDragging(true)
    updateTimeFromMousePosition(e.touches[0].clientX)

    // Add event listeners for drag and release
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)
  }

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateTimeFromMousePosition(e.clientX)
    }
  }

  // Handle touch move during drag
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      updateTimeFromMousePosition(e.touches[0].clientX)
    }
  }

  // Handle mouse up (end drag)
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)

      // Resume the timer if it was running before
      if (wasRunningRef.current) {
        setRunning(true)
        // Reset the last tick time when resuming
        lastTickTimeRef.current = Date.now()
      }

      // Remove event listeners
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }

  // Handle touch end (end drag)
  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false)

      // Resume the timer if it was running before
      if (wasRunningRef.current) {
        setRunning(true)
        // Reset the last tick time when resuming
        lastTickTimeRef.current = Date.now()
      }

      // Remove event listeners
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }

  // Update time based on mouse/touch position
  const updateTimeFromMousePosition = (clientX: number) => {
    if (currentIndex === null || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const totalWidth = rect.width
    const relativeX = clientX - rect.left

    // Calculate percentage (0 to 1)
    let percentage = relativeX / totalWidth

    // Clamp percentage between 0 and 1
    percentage = Math.max(0, Math.min(1, percentage))

    // Calculate new time left based on percentage
    const totalTime = settings.agenda[currentIndex].time * 60
    const newTimeLeft = Math.round(totalTime * (1 - percentage))

    // Update time left
    setTimeLeft(newTimeLeft)

    // Check if we're in overtime
    if (newTimeLeft <= 0) {
      setIsOvertime(true)
      setTimeLeft(0)

      // Calculate overtime seconds based on actual duration vs planned duration
      const plannedDuration = settings.agenda[currentIndex].time * 60
      const actualDuration = plannedDuration + Math.abs(newTimeLeft)
      setOvertimeSeconds(actualDuration - plannedDuration)
    } else {
      setIsOvertime(false)
      setOvertimeSeconds(0)
    }

    // Update item time data
    setItemTimeData((prevData) => {
      const newData = [...prevData]
      if (newData[currentIndex]) {
        // Calculate the elapsed time for this item based on the new position
        const elapsed = totalTime - newTimeLeft

        // Update actual duration
        newData[currentIndex].actualDuration = elapsed

        // Calculate overtime
        if (elapsed > totalTime) {
          newData[currentIndex].overTime = elapsed - totalTime
        } else {
          newData[currentIndex].overTime = 0
        }
      }
      return newData
    })

    // Update total elapsed time
    const previousElapsed = totalElapsed
    const currentItemElapsed = settings.agenda[currentIndex].time * 60 - timeLeft
    const newItemElapsed = settings.agenda[currentIndex].time * 60 - newTimeLeft
    const elapsedDifference = newItemElapsed - currentItemElapsed

    setTotalElapsed(previousElapsed + elapsedDifference)
  }

  // Open meeting summary
  const openMeetingSummary = () => {
    setShowSummary(true)
  }

  const colorClasses = getColorClasses()
  const nextUp = getNextUpItem()

  return (
    <Card className="w-full mx-auto rounded-xl shadow-sm border" style={{ maxWidth: "336px", minHeight: "650px" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Image src="/images/l10-logo.png" alt="L10 Meeting Logo" width={32} height={32} className="rounded-full" />
          <h1 className="text-lg font-semibold" style={{ fontFamily: settings.fontSettings.family }}>
            {settings.title}
          </h1>
        </div>
        <div className="text-gray-500 font-medium text-sm">Total: {formatTime(getTotalMeetingTime() * 60)}</div>
      </div>

      <CardContent className="p-0">
        {/* Current item display when running */}
        {currentIndex !== null && (
          <div className={`p-3 ${colorClasses.bg}`}>
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-bold" style={{ fontFamily: settings.fontSettings.family }}>
                {currentIndex + 1}. {settings.agenda[currentIndex].title}
              </h2>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span
                  className={`font-mono text-base ${isOvertime || timeLeft <= 60 ? colorClasses.text : ""} ${isOvertime || timeLeft <= 10 ? "animate-pulse" : ""}`}
                  style={{ fontFamily: settings.fontSettings.family }}
                >
                  {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <div
              ref={progressBarRef}
              className={`relative h-1.5 bg-gray-200 rounded-full cursor-pointer ${isDragging ? "ring-1 ring-offset-1 ring-primary" : "hover:bg-gray-300"}`}
              onMouseDown={handleProgressBarMouseDown}
              onTouchStart={handleProgressBarTouchStart}
              title="Drag to adjust time"
            >
              <div
                className={`absolute h-full ${colorClasses.progress} rounded-full transition-all ${isDragging ? "duration-0" : "duration-500"}`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {nextUp && (
              <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                <span>
                  Next: {currentIndex + 2}. {nextUp.title}
                </span>
                <span>{nextUp.time} min</span>
              </div>
            )}
          </div>
        )}

        {/* Agenda items table */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 bg-gray-50 px-3 py-1 font-medium">
            <div className="uppercase text-[10px] tracking-wider font-bold">Agenda Item</div>
            <div className="text-right uppercase text-[10px] tracking-wider font-bold">Duration</div>
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            {settings.agenda.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-2 px-3 py-2 border-t ${
                  index === currentIndex ? "bg-yellow-50 font-medium" : ""
                } ${index === settings.agenda.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex items-center gap-1">
                  {index === currentIndex && (
                    <span
                      className={`flex h-1.5 w-1.5 rounded-full ${colorClasses.dot} ${
                        isOvertime || timeLeft <= 10 ? "animate-ping" : "animate-pulse"
                      }`}
                    />
                  )}
                  <span
                    style={{
                      fontFamily: settings.fontSettings.family,
                      fontSize: `${Math.max(14, settings.fontSettings.itemSize)}px`,
                    }}
                    className={index === currentIndex && isOvertime ? "text-red-600" : ""}
                  >
                    <span>{index + 1}. </span>
                    <span className="font-bold">{item.title}</span>
                  </span>
                </div>
                <div
                  className="text-right font-mono"
                  style={{
                    fontFamily: settings.fontSettings.family,
                    fontSize: `${Math.max(14, settings.fontSettings.itemSize)}px`,
                  }}
                >
                  {index === currentIndex ? (
                    <span className={isOvertime || timeLeft <= 60 ? colorClasses.text : ""}>
                      {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(timeLeft)}
                    </span>
                  ) : (
                    <span
                      className={
                        itemTimeData[index]?.completed && itemTimeData[index]?.overTime > 0
                          ? "text-red-600"
                          : "font-mono"
                      }
                    >
                      {itemTimeData[index]?.completed
                        ? `${formatTime(itemTimeData[index].actualDuration)}`
                        : `${item.time}:00`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Elapsed and Remaining Time */}
        <div className="grid grid-cols-2 gap-2 p-2 mt-1">
          <div className="border rounded-md p-2">
            <div className="text-xs text-gray-500 mb-0.5">Elapsed</div>
            <div className="text-base font-mono">{formatTime(totalElapsed)}</div>
          </div>
          <div className="border rounded-md p-2">
            <div className="text-xs text-gray-500 mb-0.5">Remaining</div>
            <div className="text-base font-mono">{formatTime(getRemainingMeetingTime())}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col p-2 gap-2">
          {/* Main controls */}
          <div className="flex justify-between items-center">
            <div>
              {currentIndex === null ? (
                <Button
                  onClick={startAgenda}
                  className="bg-black hover:bg-gray-800 text-white px-3 py-1 rounded-md text-xs"
                  size="sm"
                >
                  <Play className="mr-1 h-2.5 w-2.5" />
                  START
                </Button>
              ) : (
                <div className="flex gap-1 items-center">
                  <Button
                    onClick={togglePauseResume}
                    className={`${running ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"} text-white px-2 py-1 rounded-md text-xs`}
                    size="sm"
                  >
                    {running ? (
                      <>
                        <Pause className="mr-1 h-2.5 w-2.5" />
                        PAUSE
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 h-2.5 w-2.5" />
                        RESUME
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={skipToPrevious}
                    size="icon"
                    className="h-6 w-6 bg-gray-700 hover:bg-gray-800 text-white"
                    title="Previous Item"
                    disabled={currentIndex === 0}
                  >
                    <SkipBack className="h-2.5 w-2.5" />
                  </Button>
                  <Button
                    onClick={skipToNext}
                    size="icon"
                    className="h-6 w-6 bg-gray-700 hover:bg-gray-800 text-white"
                    title="Next Item"
                  >
                    <SkipForward className="h-2.5 w-2.5" />
                  </Button>
                  <Button
                    onClick={resetAgenda}
                    size="icon"
                    className="h-6 w-6 bg-gray-700 hover:bg-gray-800 text-white"
                    title="Reset"
                  >
                    <RefreshCw className="h-2.5 w-2.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* First row of utility buttons */}
            <div className="flex gap-1 items-center">
              {!isPopout && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={openPopout}
                  className="h-5 w-5 rounded-md"
                  title="Pop out timer"
                >
                  <ExternalLink className="h-2 w-2" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSound}
                className="h-5 w-5 rounded-md"
                title={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {soundEnabled ? <Volume2 className="h-2 w-2" /> : <VolumeX className="h-2 w-2" />}
              </Button>
              {meetingCompleted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={openMeetingSummary}
                  className="h-5 w-5 rounded-md"
                  title="Meeting Summary"
                >
                  <FileDown className="h-2 w-2" />
                </Button>
              )}
              {showManualEndButton && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleManualEndMeeting}
                  className="h-5 w-5 rounded-md bg-red-500 hover:bg-red-600 text-white border-red-500"
                  title="End Meeting"
                >
                  <Square className="h-2 w-2" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-5 w-5 rounded-md" title="Help">
                    <HelpCircle className="h-2 w-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openUserGuidePopup}>
                    <FileText className="h-3 w-3 mr-1.5" />
                    User Guide
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openVideoWalkthroughPopup}>
                    <Video className="h-3 w-3 mr-1.5" />
                    Video Walkthrough
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Second row of utility buttons */}
          <div className="flex justify-end gap-1">
            <AgendaSettingsDialog settings={settings} onSettingsChange={handleSettingsChange} onTestSound={testSound} />
            <TemplateManagerDialog
              currentSettings={settings}
              onLoadTemplate={handleLoadTemplate}
              onSaveAsTemplate={handleSaveAsTemplate}
            />
          </div>
        </div>
      </CardContent>
      {/* Company Values Section */}
      <div className="border-t pt-1 pb-0.5">
        <button
          onClick={() => setValuesExpanded(!valuesExpanded)}
          className="w-full text-[9px] text-gray-500 flex items-center justify-center"
        >
          <div className="flex items-center">
            <Image src="/images/ANewLeaf_Mark.png" alt="A New Leaf Logo" width={12} height={12} className="mr-0.5" />
            {valuesExpanded ? "▲" : "▼"}
          </div>
        </button>

        {valuesExpanded && (
          <div className="py-1 px-2">
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-center">
              <div className="text-[8px] font-bold uppercase">COMPASSIONATE</div>
              <div className="text-[8px] font-bold uppercase">PASSION FOR RESULTS</div>
              <div className="text-[8px] font-bold uppercase">COLLABORATIVE</div>
              <div className="text-[8px] font-bold uppercase">ACCOUNTABLE</div>
              <div className="text-[8px] font-bold uppercase">INTEGRITY</div>
              <div className="text-[8px] font-bold uppercase">CONSCIENTIOUS</div>
            </div>
          </div>
        )}
      </div>

      {/* End Meeting Confirmation Dialog */}
      {showEndMeetingDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-lg p-4 w-64 relative">
            <h2 className="text-base font-semibold mb-3">End Meeting?</h2>
            <p className="text-sm text-gray-600 mb-4">
              The agenda has been completed. Would you like to end the meeting and view the summary?
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => handleEndMeetingResponse(false)} className="px-3 py-1 text-sm">
                No
              </Button>
              <Button
                onClick={() => handleEndMeetingResponse(true)}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Summary Dialog */}
      <MeetingSummaryDialog
        open={showSummary}
        onOpenChange={setShowSummary}
        meetingTitle={settings.title}
        agenda={settings.agenda}
        itemTimeData={itemTimeData}
        totalElapsed={totalElapsed}
      />
    </Card>
  )
}
