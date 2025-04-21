import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "L10 Meeting Agenda Timer",
  description: "A countdown timer for Level 10 meetings following the EOS methodology",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/l10-favicon.png", type: "image/png" },
    ],
    apple: { url: "/images/l10-favicon.png", type: "image/png" },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/l10-favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/l10-favicon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
