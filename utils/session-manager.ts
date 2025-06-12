// Session management utilities for isolated meeting instances

export interface SessionData {
  sessionId: string
  createdAt: number
  lastUpdated: number
  settings: any
  timerState: any
  meetingSummaryData: any
}

// Generate a unique session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Get the current session ID from URL or create a new one
export function getCurrentSessionId(): string {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return generateSessionId()

  // Try to get session ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  let sessionId = urlParams.get("session")

  // If no session ID in URL, check if we have one in sessionStorage (for current tab only)
  if (!sessionId) {
    sessionId = sessionStorage.getItem("current-session-id")
  }

  // If still no session ID, create a new one
  if (!sessionId) {
    sessionId = generateSessionId()
    // Store in sessionStorage (tab-specific, not shared across tabs)
    sessionStorage.setItem("current-session-id", sessionId)

    // Update URL with session ID (optional, for sharing/bookmarking)
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("session", sessionId)
    window.history.replaceState({}, "", newUrl.toString())
  }

  return sessionId
}

// Get session-specific localStorage key
export function getSessionKey(baseKey: string, sessionId?: string): string {
  const currentSessionId = sessionId || getCurrentSessionId()
  return `${baseKey}_${currentSessionId}`
}

// Save data for current session
export function saveSessionData(key: string, data: any, sessionId?: string): void {
  try {
    const sessionKey = getSessionKey(key, sessionId)
    localStorage.setItem(sessionKey, JSON.stringify(data))

    // Also update the session metadata
    updateSessionMetadata(sessionId)
  } catch (error) {
    console.error("Error saving session data:", error)
  }
}

// Load data for current session
export function loadSessionData<T>(key: string, defaultValue: T, sessionId?: string): T {
  try {
    const sessionKey = getSessionKey(key, sessionId)
    const data = localStorage.getItem(sessionKey)
    return data ? JSON.parse(data) : defaultValue
  } catch (error) {
    console.error("Error loading session data:", error)
    return defaultValue
  }
}

// Update session metadata
function updateSessionMetadata(sessionId?: string): void {
  const currentSessionId = sessionId || getCurrentSessionId()
  const metadataKey = getSessionKey("session-metadata", currentSessionId)

  const metadata: SessionData = {
    sessionId: currentSessionId,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    settings: loadSessionData("countdown-agenda-settings", null, currentSessionId),
    timerState: loadSessionData("countdown-agenda-timer-state", null, currentSessionId),
    meetingSummaryData: loadSessionData("countdown-agenda-meeting-summary", null, currentSessionId),
  }

  localStorage.setItem(metadataKey, JSON.stringify(metadata))
}

// Get all active sessions
export function getActiveSessions(): SessionData[] {
  const sessions: SessionData[] = []

  try {
    // Scan localStorage for session metadata
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes("session-metadata_session_")) {
        const data = localStorage.getItem(key)
        if (data) {
          const sessionData = JSON.parse(data) as SessionData
          sessions.push(sessionData)
        }
      }
    }

    // Sort by last updated (most recent first)
    sessions.sort((a, b) => b.lastUpdated - a.lastUpdated)
  } catch (error) {
    console.error("Error getting active sessions:", error)
  }

  return sessions
}

// Clean up old sessions (older than 24 hours)
export function cleanupOldSessions(): void {
  try {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000 // 24 hours ago
    const sessions = getActiveSessions()

    sessions.forEach((session) => {
      if (session.lastUpdated < cutoffTime) {
        deleteSession(session.sessionId)
      }
    })
  } catch (error) {
    console.error("Error cleaning up old sessions:", error)
  }
}

// Delete a specific session
export function deleteSession(sessionId: string): void {
  try {
    // Find all keys for this session and delete them
    const keysToDelete: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes(`_${sessionId}`)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error("Error deleting session:", error)
  }
}

// Create a new session (useful for "New Meeting" functionality)
export function createNewSession(): string {
  const newSessionId = generateSessionId()

  // Clear current session from sessionStorage
  sessionStorage.removeItem("current-session-id")

  // Store new session ID
  sessionStorage.setItem("current-session-id", newSessionId)

  // Update URL
  if (typeof window !== "undefined") {
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("session", newSessionId)
    window.history.replaceState({}, "", newUrl.toString())
  }

  return newSessionId
}

// Check if current session has any data
export function hasSessionData(sessionId?: string): boolean {
  const currentSessionId = sessionId || getCurrentSessionId()
  const timerState = loadSessionData("countdown-agenda-timer-state", null, currentSessionId)
  const settings = loadSessionData("countdown-agenda-settings", null, currentSessionId)

  return !!(timerState || settings)
}
