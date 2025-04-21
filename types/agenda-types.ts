export interface AgendaItem {
  title: string
  time: number
  color?: string
}

export type SoundType = "start" | "end" | "warning" | "transition"

export interface AgendaTemplate {
  id: string
  name: string
  title: string
  agenda: AgendaItem[]
  soundSelections: Record<SoundType, string>
  createdAt: number
  updatedAt: number
  // Make fontSettings optional in templates
  fontSettings?: {
    family: string
    titleSize: number
    itemSize: number
    timeSize: number
  }
}

export interface AgendaSettings {
  title: string
  agenda: AgendaItem[]
  soundSelections: Record<SoundType, string>
  activeTemplateId?: string
  fontSettings: {
    family: string
    titleSize: number
    itemSize: number
    timeSize: number
  }
}

export interface ItemTimeData {
  plannedDuration: number // in seconds
  actualDuration: number // in seconds
  overTime: number // in seconds (positive if over, negative if under)
  completed: boolean
}
