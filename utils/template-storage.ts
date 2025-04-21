import type { AgendaTemplate, AgendaSettings } from "@/types/agenda-types"

const TEMPLATES_KEY = "countdown-agenda-templates"
const SETTINGS_KEY = "countdown-agenda-settings"

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// Save a template to localStorage
export function saveTemplate(template: AgendaTemplate): void {
  const templates = getTemplates()

  // Update or add the template
  const existingIndex = templates.findIndex((t) => t.id === template.id)
  if (existingIndex >= 0) {
    templates[existingIndex] = {
      ...template,
      updatedAt: Date.now(),
    }
  } else {
    templates.push({
      ...template,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

// Get all templates from localStorage
export function getTemplates(): AgendaTemplate[] {
  try {
    const templates = localStorage.getItem(TEMPLATES_KEY)
    return templates ? JSON.parse(templates) : []
  } catch (error) {
    console.error("Error loading templates:", error)
    return []
  }
}

// Get a template by ID
export function getTemplateById(id: string): AgendaTemplate | undefined {
  const templates = getTemplates()
  return templates.find((template) => template.id === id)
}

// Delete a template by ID
export function deleteTemplate(id: string): void {
  const templates = getTemplates()
  const filteredTemplates = templates.filter((template) => template.id !== id)
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filteredTemplates))

  // Also update settings if this was the active template
  try {
    const settingsStr = localStorage.getItem(SETTINGS_KEY)
    if (settingsStr) {
      const settings = JSON.parse(settingsStr) as AgendaSettings
      if (settings.activeTemplateId === id) {
        settings.activeTemplateId = undefined
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      }
    }
  } catch (error) {
    console.error("Error updating settings after template deletion:", error)
  }
}

// Save current settings to localStorage
export function saveSettings(settings: AgendaSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// Get current settings from localStorage
export function getSettings(): AgendaSettings | null {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY)
    return settings ? JSON.parse(settings) : null
  } catch (error) {
    console.error("Error loading settings:", error)
    return null
  }
}
