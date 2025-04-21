// Helper functions for working with colors

// Get Tailwind background class for a color
export function getColorBgClass(color?: string): string {
  if (!color) return ""
  return `bg-${color}-500`
}

// Get Tailwind text class for a color
export function getColorTextClass(color?: string): string {
  if (!color) return ""
  return `text-${color}-600`
}

// Get Tailwind background light class for a color
export function getColorBgLightClass(color?: string): string {
  if (!color) return ""
  return `bg-${color}-100`
}

// Get full color classes object for a color
export function getColorClasses(color?: string) {
  if (!color)
    return {
      bg: "",
      progress: "",
      dot: "",
      text: "",
    }

  return {
    bg: `bg-${color}-100`,
    progress: `bg-${color}-500`,
    dot: `bg-${color}-500`,
    text: `text-${color}-600`,
  }
}
