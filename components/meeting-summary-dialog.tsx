"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, Mail, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
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

export function MeetingSummaryDialog({
  open,
  onOpenChange,
  meetingTitle,
  agenda,
  itemTimeData,
  totalElapsed,
}: MeetingSummaryDialogProps) {
  const [copied, setCopied] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

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

  const getEmailjsConfig = () => {
    // Try to get from environment variables first
    const envServiceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const envTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
    const envPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    if (envServiceId && envTemplateId && envPublicKey) {
      return {
        serviceId: envServiceId,
        templateId: envTemplateId,
        publicKey: envPublicKey,
      }
    }

    // Try to get from window object (set by popout)
    const windowServiceId = (window as any).NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const windowTemplateId = (window as any).NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
    const windowPublicKey = (window as any).NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    if (windowServiceId && windowTemplateId && windowPublicKey) {
      return {
        serviceId: windowServiceId,
        templateId: windowTemplateId,
        publicKey: windowPublicKey,
      }
    }

    return null
  }

  const sendEmail = async () => {
    const emailConfig = getEmailjsConfig()

    if (!emailConfig) {
      toast({
        variant: "destructive",
        title: "Email configuration missing",
        description: "Unable to load EmailJS configuration",
      })
      return
    }

    setEmailSending(true)

    try {
      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        {
          meeting_title: meetingTitle,
          meeting_date: new Date().toLocaleDateString(),
          summary_text: generateSummaryText(),
        },
        { publicKey: emailConfig.publicKey },
      )

      toast({
        title: "Email sent!",
        description: "Meeting summary delivered to bbeckstead@turnanewleaf.org",
      })
      onOpenChange(false) // auto-close dialog
    } catch (err: any) {
      console.error("EmailJS error:", err)
      toast({
        variant: "destructive",
        title: "Email failed",
        description: err?.message || "Unable to send meeting summary",
      })
    } finally {
      setEmailSending(false)
    }
  }

  const getTotalPlannedTime = () => {
    return agenda.reduce((total, item) => total + item.time * 60, 0)
  }

  const getTotalOvertime = () => {
    return itemTimeData.reduce((total, item) => total + Math.max(0, item.overTime), 0)
  }

  const isEmailConfigured = !!getEmailjsConfig()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[320px] max-w-[320px] max-h-[85vh] p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">Meeting Summary</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-3">
            {/* Meeting Overview - Vertical Stack */}
            <div className="space-y-2 p-2 bg-gray-50 rounded text-center">
              <div>
                <div className="text-lg font-bold">{formatTime(getTotalPlannedTime())}</div>
                <div className="text-xs text-gray-600">Planned</div>
              </div>
              <div>
                <div className="text-lg font-bold">{formatTime(totalElapsed)}</div>
                <div className="text-xs text-gray-600">Actual</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${getTotalOvertime() > 0 ? "text-red-600" : "text-green-600"}`}>
                  {getTotalOvertime() > 0 ? `+${formatTime(getTotalOvertime())}` : "On Time"}
                </div>
                <div className="text-xs text-gray-600">Overtime</div>
              </div>
            </div>

            {/* Agenda Items - Compact List */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-700 mb-2">Agenda Items</div>
              {agenda.map((item, index) => {
                const timeData = itemTimeData[index]
                if (!timeData) return null

                const variance = timeData.actualDuration - timeData.plannedDuration
                const isOvertime = variance > 0

                return (
                  <div key={index} className="border rounded p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className={timeData.completed ? "text-green-600" : "text-gray-400"}>
                          {timeData.completed ? "✓" : "○"}
                        </span>
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-gray-500">Planned</div>
                        <div className="font-mono">{formatTime(timeData.plannedDuration)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Actual</div>
                        <div className="font-mono">{formatTime(timeData.actualDuration)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Variance</div>
                        <div className={`font-mono ${isOvertime ? "text-red-600" : "text-green-600"}`}>
                          {variance !== 0 ? `${isOvertime ? "+" : ""}${formatTime(Math.abs(variance))}` : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions - Stacked */}
        <div className="space-y-2 pt-3 border-t">
          <Button variant="outline" onClick={handleCopy} className="w-full text-xs h-8">
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" /> Copy Summary
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={sendEmail}
              disabled={emailSending || !isEmailConfigured}
              title={!isEmailConfigured ? "EmailJS configuration not loaded" : undefined}
              className="flex-1 text-xs h-8"
            >
              {emailSending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              <Mail className="mr-1 h-3 w-3" />
              Send Email
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="text-xs h-8 px-3">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
