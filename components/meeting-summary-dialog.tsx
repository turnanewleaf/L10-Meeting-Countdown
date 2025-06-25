"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, Mail, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { AgendaItem } from "@/types/agenda-types"

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

  const sendEmail = async () => {
    setEmailSending(true)

    try {
      const response = await fetch("/api/send-meeting-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingTitle,
          meetingDate: new Date().toLocaleDateString(),
          meetingSummary: generateSummaryText(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Email sent!",
          description: "Meeting summary has been sent to bbeckstead@turnanewleaf.org",
        })
        // Close the dialog after successful send
        onOpenChange(false)
      } else {
        throw new Error("Failed to send email")
      }
    } catch (error) {
      console.error("Email sending error:", error)
      toast({
        title: "Email failed",
        description: "Unable to send meeting summary email",
        variant: "destructive",
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
            <Button onClick={sendEmail} disabled={emailSending}>
              {emailSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
