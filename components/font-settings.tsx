"use client"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Available font families
const fontFamilies = [
  { name: "Inter", value: "Inter" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Helvetica", value: "Helvetica, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Tahoma", value: "Tahoma, sans-serif" },
  { name: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Courier New", value: "Courier New, monospace" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
]

interface FontSettingsProps {
  fontFamily: string
  titleSize: number
  itemSize: number
  timeSize: number
  onFontFamilyChange: (value: string) => void
  onTitleSizeChange: (value: number) => void
  onItemSizeChange: (value: number) => void
  onTimeSizeChange: (value: number) => void
}

export function FontSettings({
  fontFamily,
  titleSize,
  itemSize,
  timeSize,
  onFontFamilyChange,
  onTitleSizeChange,
  onItemSizeChange,
  onTimeSizeChange,
}: FontSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="font-family">Font Family</Label>
        <Select value={fontFamily} onValueChange={onFontFamilyChange}>
          <SelectTrigger id="font-family">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="title-size">Title Size: {titleSize}px</Label>
          <span className="text-sm text-muted-foreground">{titleSize}px</span>
        </div>
        <Slider
          id="title-size"
          min={12}
          max={28}
          step={1}
          value={[titleSize]}
          onValueChange={(value) => onTitleSizeChange(value[0])}
        />
        <div className="mt-1 p-2 border rounded" style={{ fontSize: `${titleSize}px`, fontFamily }}>
          Title Preview
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="item-size">Item Text Size: {itemSize}px</Label>
          <span className="text-sm text-muted-foreground">{itemSize}px</span>
        </div>
        <Slider
          id="item-size"
          min={10}
          max={24}
          step={1}
          value={[itemSize]}
          onValueChange={(value) => onItemSizeChange(value[0])}
        />
        <div className="mt-1 p-2 border rounded" style={{ fontSize: `${itemSize}px`, fontFamily }}>
          Agenda Item Preview
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="time-size">Time Display Size: {timeSize}px</Label>
          <span className="text-sm text-muted-foreground">{timeSize}px</span>
        </div>
        <Slider
          id="time-size"
          min={12}
          max={28}
          step={1}
          value={[timeSize]}
          onValueChange={(value) => onTimeSizeChange(value[0])}
        />
        <div className="mt-1 p-2 border rounded font-mono" style={{ fontSize: `${timeSize}px`, fontFamily }}>
          10:00
        </div>
      </div>
    </div>
  )
}
