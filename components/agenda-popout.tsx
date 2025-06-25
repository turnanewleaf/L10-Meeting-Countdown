"use client"

import { useEffect, useState } from "react"
import CountdownAgenda from "./countdown-agenda"

export default function AgendaPopout() {
  const [loaded, setLoaded] = useState(false)
  const [emailjsConfig, setEmailjsConfig] = useState<any>(null)

  useEffect(() => {
    // Set window title
    document.title = "Agenda Timer"

    // Get EmailJS config from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const emailjsParam = urlParams.get("emailjs")

    if (emailjsParam) {
      try {
        const config = JSON.parse(decodeURIComponent(emailjsParam))
        setEmailjsConfig(config)

        // Set environment variables for the popout window
        if (config.serviceId) {
          ;(window as any).NEXT_PUBLIC_EMAILJS_SERVICE_ID = config.serviceId
        }
        if (config.templateId) {
          ;(window as any).NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = config.templateId
        }
        if (config.publicKey) {
          ;(window as any).NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = config.publicKey
        }
      } catch (error) {
        console.error("Failed to parse EmailJS config:", error)
      }
    }

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
