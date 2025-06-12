"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Clock, Trash2, Users } from "lucide-react"
import {
  getActiveSessions,
  createNewSession,
  deleteSession,
  cleanupOldSessions,
  getCurrentSessionId,
  type SessionData,
} from "@/utils/session-manager"
import { toast } from "@/components/ui/use-toast"

interface SessionManagerProps {
  onNewSession: () => void
}

export function SessionManager({ onNewSession }: SessionManagerProps) {
  const [open, setOpen] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")

  useEffect(() => {
    if (open) {
      refreshSessions()
      setCurrentSessionId(getCurrentSessionId())
    }
  }, [open])

  const refreshSessions = () => {
    // Clean up old sessions first
    cleanupOldSessions()
    // Get current sessions
    setSessions(getActiveSessions())
  }

  const handleNewSession = () => {
    const newSessionId = createNewSession()
    onNewSession()
    setOpen(false)

    toast({
      title: "New Meeting Session",
      description: `Started new meeting session: ${newSessionId.slice(-8)}`,
    })
  }

  const handleDeleteSession = (sessionId: string) => {
    if (sessionId === currentSessionId) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the current active session",
        variant: "destructive",
      })
      return
    }

    deleteSession(sessionId)
    refreshSessions()

    toast({
      title: "Session Deleted",
      description: `Meeting session ${sessionId.slice(-8)} has been deleted`,
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getSessionStatus = (session: SessionData) => {
    if (!session.timerState) return "Not Started"
    if (session.timerState.meetingCompleted) return "Completed"
    if (session.timerState.running) return "Running"
    if (session.timerState.currentIndex !== null) return "Paused"
    return "Ready"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running":
        return "bg-green-500"
      case "Paused":
        return "bg-yellow-500"
      case "Completed":
        return "bg-blue-500"
      case "Ready":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-5 w-5 rounded-md" title="Session Manager">
          <Users className="h-2 w-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Meeting Sessions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Current Session: <code className="bg-gray-100 px-1 rounded">{currentSessionId.slice(-8)}</code>
            </div>
            <Button onClick={handleNewSession} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Meeting
            </Button>
          </div>

          <div className="border rounded-md">
            <ScrollArea className="h-[300px]">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No active sessions found</div>
              ) : (
                <div className="space-y-2 p-2">
                  {sessions.map((session) => {
                    const status = getSessionStatus(session)
                    const isCurrentSession = session.sessionId === currentSessionId

                    return (
                      <div
                        key={session.sessionId}
                        className={`p-3 border rounded-md ${isCurrentSession ? "bg-blue-50 border-blue-200" : "bg-white"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-gray-100 px-1 rounded">{session.sessionId.slice(-8)}</code>
                              {isCurrentSession && (
                                <Badge variant="outline" className="text-xs">
                                  Current
                                </Badge>
                              )}
                              <Badge className={`text-xs text-white ${getStatusColor(status)}`}>{status}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div>Created: {formatDate(session.createdAt)}</div>
                              <div>Updated: {formatDate(session.lastUpdated)}</div>
                              {session.settings?.title && <div>Meeting: {session.settings.title}</div>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {session.timerState?.totalElapsed > 0 && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.floor(session.timerState.totalElapsed / 60)}:
                                {(session.timerState.totalElapsed % 60).toString().padStart(2, "0")}
                              </div>
                            )}

                            {!isCurrentSession && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleDeleteSession(session.sessionId)}
                                title="Delete session"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• Each meeting session is completely isolated</p>
            <p>• Sessions are automatically cleaned up after 24 hours</p>
            <p>• You can run multiple meetings simultaneously in different tabs</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
