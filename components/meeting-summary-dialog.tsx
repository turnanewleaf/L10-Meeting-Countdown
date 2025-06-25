"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, Mail, Loader2, AlertCircle } from "lucide-react"
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

export function MeetingSummaryDialog({
  open,
  onOpenChange,
  meetingTitle,
  agenda,
  itemTimeData,
  totalElapsed,
}: MeetingSummaryDialogProps) {
  const [copied, setCopied] = useState(false)
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error" | "bad-service-id">("idle")
  const [serviceIdFromApi, setServiceIdFromApi] = useState<string | undefined>("")
  const looksValidServiceId = (id?: string) => typeof id === "string" && /^service_[a-z0-9]+$/i.test(id)

  useEffect(() => {
    if (open) {
      // Fetch config when dialog opens to show Service ID
      fetch("/api/emailjs-config")
        .then((res) => res.json())
        .then((cfg) => {
          console.log("Config loaded on dialog open:", cfg)
          if (cfg.service_id) {
            setServiceIdFromApi(cfg.service_id)
          }
        })
        .catch((err) => {
          console.error("Failed to load config:", err)
        })
    }
  }, [open])

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
      console.log("Fetching EmailJS config...")
      const cfgRes = await fetch("/api/emailjs-config")
      const cfg = await cfgRes.json()

      console.log("API Response Status:", cfgRes.status)
      console.log("API Response Data:", cfg)

      if (!cfgRes.ok) {
        console.error("API Error:", cfg.error)
        throw new Error(cfg.error ?? "EmailJS configuration error")
      }

      const { service_id, template_id, user_id } = cfg
      console.log("Extracted values:", { service_id, template_id, user_id })
      setServiceIdFromApi(service_id)

      if (!looksValidServiceId(service_id)) {
        setEmailStatus("bad-service-id")
        toast({
          variant: "destructive",
          title: "EmailJS service ID looks wrong",
          description:
            `The app received “${service_id ?? "undefined"}”. ` +
            "Open your EmailJS dashboard, copy the exact Service ID (starts with “service_…”) " +
            "into Vercel env vars, then redeploy.",
          action: {
            label: "Copy ID",
            onClick: () => navigator.clipboard.writeText(service_id ?? ""),
          },
        })
        return
      }

      /* ------------------------------------------------------------------
       KEY CHANGE:
       •  don’t rely on global init()
       •  pass user_id as the 4ᵗʰ argument to emailjs.send()
       ------------------------------------------------------------------ */
      const response = await emailjs.send(
        service_id,
        template_id,
        {
          meeting_title: meetingTitle,
          meeting_date: new Date().toLocaleDateString(),
          meeting_summary: generateSummaryText(),
        },
        user_id, // <-- public key explicitly supplied here
      )

      if (response.status === 200) {
        setEmailStatus("success")
        toast({ title: "Email sent!", description: "Meeting summary delivered successfully." })
      } else {
        throw new Error(`EmailJS returned status ${response.status}`)
      }
    } catch (err: any) {
      console.error("EmailJS Error Details:", err)

      const msg: string = err?.text || err?.message || (typeof err === "string" ? err : "Unknown error occurred")

      if (typeof err?.text === "string" && err.text.toLowerCase().includes("service id not found")) {
        setEmailStatus("bad-service-id")
        toast({
          variant: "destructive",
          title: "EmailJS service not found",
          description:
            "The EMAILJS_SERVICE_ID supplied isn’t in your EmailJS dashboard. " +
            "Open the dashboard, copy the correct ID, then redeploy.",
          action: {
            label: "Open Dashboard",
            onClick: () => window.open("https://dashboard.emailjs.com/admin", "_blank", "noopener"),
          },
        })
      } else {
        setEmailStatus("error")
        toast({ variant: "destructive", title: "EmailJS error", description: msg })
      }
    } finally {
      setTimeout(() => setEmailStatus("idle"), 4000)
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
              disabled={
                emailStatus === "loading" || emailStatus === "bad-service-id" || !looksValidServiceId(serviceIdFromApi)
              }
              title={
                !looksValidServiceId(serviceIdFromApi)
                  ? `Invalid Service ID (${serviceIdFromApi || "missing"})`
                  : emailStatus === "loading"
                    ? "Sending…"
                    : undefined
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
        {!looksValidServiceId(serviceIdFromApi) && (
          <p className="text-xs text-red-600">
            Current Service ID from API:&nbsp;
            <code
              className="bg-red-50 px-1 cursor-pointer"
              onClick={() => navigator.clipboard.writeText(serviceIdFromApi ?? "")}
            >
              {serviceIdFromApi ?? "undefined"}
            </code>
            &nbsp;— click to copy.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
