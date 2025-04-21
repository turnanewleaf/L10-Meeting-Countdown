"use client"

import { useEffect, useState } from "react"
import CountdownAgenda from "./countdown-agenda"

export default function AgendaPopout() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Set window title
    document.title = "Agenda Timer"
    setLoaded(true)
  }, [])

  if (!loaded) {
    return <div className="flex items-center justify-center h-screen">Loading agenda data...</div>
  }

  return (
    <div className="p-4">
      <CountdownAgenda isPopout={true} />
    </div>
  )
}
