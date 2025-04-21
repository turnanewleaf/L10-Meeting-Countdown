import type React from "react"
import type { Metadata } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "Video Walkthrough - L10 Meeting Agenda Timer",
  description: "Video tutorial for the L10 Meeting Agenda Timer",
}

export default function VideoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black overflow-hidden">{children}</body>
    </html>
  )
}
