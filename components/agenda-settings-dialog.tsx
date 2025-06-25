"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Plus, Trash2, Clock, Music } from "lucide-react"
import { soundLibrary, type SoundType } from "@/utils/sound-library"
import { toast } from "@/components/ui/use-toast"
import { ColorPicker } from "./color-picker"
import type { AgendaItem, AgendaSettings } from "@/types/agenda-types"
import { FontSettings } from "./font-settings"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AgendaSettingsDialogProps {
  settings: AgendaSettings
  onSettingsChange: (settings: AgendaSettings) => void
  onTestSound: (soundId: string) => void
}

export function AgendaSettingsDialog({ settings, onSettingsChange, onTestSound }: AgendaSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<AgendaSettings>({ ...settings })
  const [open, setOpen] = useState(false)

  // Reset local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSettings({ ...settings })
    }
  }, [open, settings])

  const handleSave = () => {
    // Validate agenda items
    if (localSettings.agenda.some((item) => !item.title.trim())) {
      toast({
        title: "Validation Error",
        description: "All agenda items must have a title",
        variant: "destructive",
      })
      return
    }

    onSettingsChange(localSettings)
    setOpen(false)

    toast({
      title: "Settings Saved",
      description: "Your agenda settings have been updated",
    })
  }

  const addAgendaItem = () => {
    setLocalSettings({
      ...localSettings,
      agenda: [...localSettings.agenda, { title: "New Item", time: 5, color: "" }],
    })
  }

  const removeAgendaItem = (index: number) => {
    const newAgenda = [...localSettings.agenda]
    newAgenda.splice(index, 1)
    setLocalSettings({
      ...localSettings,
      agenda: newAgenda,
    })
  }

  const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string | number) => {
    const newAgenda = [...localSettings.agenda]
    newAgenda[index] = { ...newAgenda[index], [field]: value }
    setLocalSettings({
      ...localSettings,
      agenda: newAgenda,
    })
  }

  const updateSoundSelection = (type: SoundType, soundId: string) => {
    setLocalSettings({
      ...localSettings,
      soundSelections: {
        ...localSettings.soundSelections,
        [type]: soundId,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-5 w-5 rounded-md" title="Settings">
          <Settings className="h-2 w-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Agenda Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4 flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-4 mb-4 flex-shrink-0">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="items">Agenda Items</TabsTrigger>
            <TabsTrigger value="sounds">Sounds</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0">
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={localSettings.title}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter meeting title"
                />
              </div>
            </TabsContent>

            <TabsContent value="items" className="mt-0 h-full">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {localSettings.agenda.map((item, index) => (
                    <div key={index} className="space-y-2 border p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="flex-grow">
                          <Input
                            value={item.title}
                            onChange={(e) => updateAgendaItem(index, "title", e.target.value)}
                            placeholder="Item title"
                          />
                        </div>
                        <div className="flex items-center gap-1 w-24">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="1"
                            max="120"
                            value={item.time}
                            onChange={(e) => updateAgendaItem(index, "time", Number.parseInt(e.target.value) || 1)}
                            className="w-16"
                          />
                          <span className="text-xs text-muted-foreground">min</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAgendaItem(index)}
                          disabled={localSettings.agenda.length <= 1}
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`color-${index}`} className="text-xs w-16">
                          Color:
                        </Label>
                        <div className="flex-grow">
                          <ColorPicker
                            value={item.color || ""}
                            onChange={(color) => updateAgendaItem(index, "color", color)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" onClick={addAgendaItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sounds" className="space-y-4 mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-sound">Start Meeting Sound</Label>
                    <div className="flex gap-2">
                      <Select
                        value={localSettings.soundSelections.start}
                        onValueChange={(value) => updateSoundSelection("start", value)}
                      >
                        <SelectTrigger className="flex-grow">
                          <SelectValue placeholder="Select a sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(soundLibrary).map((sound) => (
                            <SelectItem key={sound.id} value={sound.id}>
                              {sound.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onTestSound(localSettings.soundSelections.start)}
                        title="Test sound"
                      >
                        <Music className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transition-sound">Transition Sound</Label>
                    <div className="flex gap-2">
                      <Select
                        value={localSettings.soundSelections.transition}
                        onValueChange={(value) => updateSoundSelection("transition", value)}
                      >
                        <SelectTrigger className="flex-grow">
                          <SelectValue placeholder="Select a sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(soundLibrary).map((sound) => (
                            <SelectItem key={sound.id} value={sound.id}>
                              {sound.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onTestSound(localSettings.soundSelections.transition)}
                        title="Test sound"
                      >
                        <Music className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-sound">End Meeting Sound</Label>
                    <div className="flex gap-2">
                      <Select
                        value={localSettings.soundSelections.end}
                        onValueChange={(value) => updateSoundSelection("end", value)}
                      >
                        <SelectTrigger className="flex-grow">
                          <SelectValue placeholder="Select a sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(soundLibrary).map((sound) => (
                            <SelectItem key={sound.id} value={sound.id}>
                              {sound.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onTestSound(localSettings.soundSelections.end)}
                        title="Test sound"
                      >
                        <Music className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="fonts" className="space-y-4 mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <FontSettings
                  fontFamily={localSettings.fontSettings.family}
                  titleSize={localSettings.fontSettings.titleSize}
                  itemSize={localSettings.fontSettings.itemSize}
                  timeSize={localSettings.fontSettings.timeSize}
                  onFontFamilyChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      fontSettings: {
                        ...localSettings.fontSettings,
                        family: value,
                      },
                    })
                  }
                  onTitleSizeChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      fontSettings: {
                        ...localSettings.fontSettings,
                        titleSize: value,
                      },
                    })
                  }
                  onItemSizeChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      fontSettings: {
                        ...localSettings.fontSettings,
                        itemSize: value,
                      },
                    })
                  }
                  onTimeSizeChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      fontSettings: {
                        ...localSettings.fontSettings,
                        timeSize: value,
                      },
                    })
                  }
                />
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
