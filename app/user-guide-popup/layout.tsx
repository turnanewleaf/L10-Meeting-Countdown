import type React from "react"
import type { Metadata } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "User Guide - L10 Meeting Agenda Timer",
  description: "User guide for the L10 Meeting Agenda Timer",
}

export default function UserGuidePopupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white overflow-y-auto">{children}</body>
    </html>
  )
}
