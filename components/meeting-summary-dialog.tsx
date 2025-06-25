"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, Mail, Loader2, AlertCircle } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { AgendaItem } from "@/types/agenda-types"
import * as emailjs from "@emailjs/browser"

interface ItemTimeData {
  plannedDuration: number // in seconds
  actualDuration: number // in seconds
  overTime: number // in seconds (positive if over, negative if under)
  completed: boolean
}

interface MeetingSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meetingTitle: string
  agenda: AgendaItem[]
  itemTimeData: ItemTimeData[]
  totalElapsed: number
}

// ---  ADD  ----------------------------------------------
// Helpers that recognise placeholder / obviously-wrong IDs.
const looksLikePlaceholder = (id: string | undefined) =>
  !id ||
  id.trim() === "" ||
  ["YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", "YOUR_PUBLIC_KEY"].includes(id.trim()) ||
  // Real EmailJS service IDs always start with  "service_".
  !/^service_[a-zA-Z0-9]+$/.test(id.trim())
// --------------------------------------------------------

export function MeetingSummaryDialog({
  open,
  onOpenChange,
  meetingTitle,
  agenda,
  itemTimeData,
  totalElapsed,
}: MeetingSummaryDialogProps) {
  const [copied, setCopied] = useState(false)
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error" | "bad-config">("idle")

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  const generateSummaryText = () => {
    const lines = []
    lines.push(`Meeting: ${meetingTitle}`)
    lines.push(`Date: ${new Date().toLocaleDateString()}`)
    lines.push(`Total Duration: ${formatTime(totalElapsed)}`)
    lines.push("")
    lines.push("Agenda Items:")

    agenda.forEach((item, index) => {
      const timeData = itemTimeData[index]
      if (timeData) {
        const plannedTime = formatTime(timeData.plannedDuration)
        const actualTime = formatTime(timeData.actualDuration)
        const status = timeData.completed ? "✓" : "○"
        const overtime = timeData.overTime > 0 ? ` (+${formatTime(timeData.overTime)} over)` : ""

        lines.push(`${status} ${index + 1}. ${item.title}`)
        lines.push(`   Planned: ${plannedTime}, Actual: ${actualTime}${overtime}`)
      }
    })

    return lines.join("\n")
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateSummaryText())
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Meeting summary has been copied to your clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const sendEmail = async () => {
    setEmailStatus("loading")

    try {
      const cfgRes = await fetch("/api/emailjs-config")
      const cfg = await cfgRes.json()

      if (!cfgRes.ok) {
        throw new Error(cfg.error ?? "EmailJS configuration error")
      }

      const { service_id, template_id, user_id } = cfg

      // -- NEW: pre-validate IDs before talking to EmailJS --------------
      if (looksLikePlaceholder(service_id) || looksLikePlaceholder(template_id) || looksLikePlaceholder(user_id)) {
        setEmailStatus("bad-config")
        toast({
          variant: "destructive",
          title: "EmailJS not configured",
          description:
            "Service / Template ID is still the default placeholder, or malformed. " +
            "Open EmailJS Dashboard and copy the real IDs.",
          action: {
            label: "Open Dashboard",
            onClick: () => window.open("https://dashboard.emailjs.com/admin", "_blank", "noopener"),
          },
        })
        return
      }
      // -----------------------------------------------------------------

      emailjs.init({ publicKey: user_id })

      const response = await emailjs.send(service_id, template_id, {
        meeting_title: meetingTitle,
        meeting_date: new Date().toLocaleDateString(),
        meeting_summary: generateSummaryText(),
      })

      if (response.status === 200) {
        setEmailStatus("success")
        toast({
          title: "Email sent!",
          description: "Meeting summary has been sent successfully",
        })
      } else {
        throw new Error(`EmailJS returned status ${response.status}`)
      }
    } catch (err: any) {
      const msg =
        typeof err?.text === "string"
          ? err.text
          : err?.message || "Unknown error. Check your EmailJS credentials."
      setEmailStatus("error")
      toast({
        variant: "destructive",
        title: "EmailJS error",
        description: msg,
        action: {
          label: "Open Dashboard",
          onClick: () => window.open("https://dashboard.emailjs.com/admin", "_blank", "noopener"),
        },
      })
    } finally {
      if (emailStatus !== "loading") {
        setTimeout(() => setEmailStatus("idle"), 4000)
      }
    }
  }

  const getTotalPlannedTime = () => {
    return agenda.reduce((total, item) => total + item.time * 60, 0)
  }

  const getTotalOvertime = () => {
    return itemTimeData.reduce((total, item) => total + Math.max(0, item.overTime), 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Meeting Summary</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Meeting Overview */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(getTotalPlannedTime())}</div>
                <div className="text-sm text-gray-600">Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(totalElapsed)}</div>
                <div className="text-sm text-gray-600">Actual</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getTotalOvertime() > 0 ? "text-red-600" : "text-green-600"}`}>
                  {getTotalOvertime() > 0 ? `+${formatTime(getTotalOvertime())}` : "On Time"}
                </div>
                <div className="text-sm text-gray-600">Overtime</div>
              </div>
            </div>

            {/* Agenda Items Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">Status</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agenda.map((item, index) => {
                  const timeData = itemTimeData[index]
                  if (!timeData) return null

                  const variance = timeData.actualDuration - timeData.plannedDuration
                  const isOvertime = variance > 0

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <span className={timeData.completed ? "text-green-600" : "text-gray-400"}>
                          {timeData.completed ? "✓" : "○"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-right font-mono">{formatTime(timeData.plannedDuration)}</TableCell>
                      <TableCell className="text-right font-mono">{formatTime(timeData.actualDuration)}</TableCell>
                      <TableCell className={`text-right font-mono ${isOvertime ? "text-red-600" : "text-green-600"}`}>
                        {variance !== 0 ? `${isOvertime ? "+" : ""}${formatTime(Math.abs(variance))}` : "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Email Status */}
            {emailStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to send email. Please check your EmailJS configuration and try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Debug info */}
            <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
              Email status: {emailStatus === "error" ? "error (see toast for details)" : emailStatus}
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" /> Copy Summary
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={sendEmail}
              disabled={emailStatus === "loading" || emailStatus === "bad-config"}
              title={
                emailStatus === "bad-config"
                  ? "Configure EmailJS IDs first"
                  : emailStatus === "loading"
                  ? "Sending…"
                  : ""
              }
            >
              {emailStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {emailStatus === "success" && <Check className="mr-2 h-4 w-4" />}
              {emailStatus === "error" && <AlertCircle className="mr-2 h-4 w-4" />}
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
