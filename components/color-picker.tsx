"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Predefined colors that work well with the UI
export const colorOptions = [
  { name: "Default", value: "" },
  { name: "Red", value: "red" },
  { name: "Orange", value: "orange" },
  { name: "Amber", value: "amber" },
  { name: "Yellow", value: "yellow" },
  { name: "Lime", value: "lime" },
  { name: "Green", value: "green" },
  { name: "Emerald", value: "emerald" },
  { name: "Teal", value: "teal" },
  { name: "Cyan", value: "cyan" },
  { name: "Sky", value: "sky" },
  { name: "Blue", value: "blue" },
  { name: "Indigo", value: "indigo" },
  { name: "Violet", value: "violet" },
  { name: "Purple", value: "purple" },
  { name: "Fuchsia", value: "fuchsia" },
  { name: "Pink", value: "pink" },
  { name: "Rose", value: "rose" },
]

// Color preview component
const ColorPreview = ({ color }: { color: string }) => {
  const getColorClass = (color: string) => {
    if (!color) return "bg-gray-200"
    return `bg-${color}-500`
  }

  return <div className={cn("w-5 h-5 rounded-full", getColorClass(color))} />
}

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const getColorName = (value: string) => {
    const color = colorOptions.find((c) => c.value === value)
    return color ? color.name : "Default"
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between" size="sm">
          <div className="flex items-center gap-2">
            <ColorPreview color={value} />
            <span>{getColorName(value)}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-4 gap-1">
          {colorOptions.map((color) => (
            <Button
              key={color.value}
              variant="ghost"
              className="h-8 w-full p-1 justify-start"
              onClick={() => onChange(color.value)}
            >
              <div className="flex items-center gap-2">
                <ColorPreview color={color.value} />
                {value === color.value && <Check className="h-3 w-3 ml-auto" />}
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
