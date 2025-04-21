"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, MoreVertical, Edit, Trash2, Copy, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getTemplates, saveTemplate, deleteTemplate, generateId } from "@/utils/template-storage"
import type { AgendaTemplate, AgendaSettings } from "@/types/agenda-types"

interface TemplateManagerDialogProps {
  currentSettings: AgendaSettings
  onLoadTemplate: (template: AgendaTemplate) => void
  onSaveAsTemplate: (name: string) => void
}

export function TemplateManagerDialog({
  currentSettings,
  onLoadTemplate,
  onSaveAsTemplate,
}: TemplateManagerDialogProps) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<AgendaTemplate[]>([])
  const [newTemplateName, setNewTemplateName] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<AgendaTemplate | null>(null)

  // Load templates when dialog opens
  useEffect(() => {
    if (open) {
      refreshTemplates()
    }
  }, [open])

  const refreshTemplates = () => {
    setTemplates(getTemplates())
  }

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      })
      return
    }

    onSaveAsTemplate(newTemplateName)
    setNewTemplateName("")
    refreshTemplates()

    toast({
      title: "Template Saved",
      description: `Template "${newTemplateName}" has been saved`,
    })
  }

  // Handle loading a template
  const handleLoadTemplate = (template: AgendaTemplate) => {
    onLoadTemplate(template)
    setOpen(false)

    toast({
      title: "Template Loaded",
      description: `Template "${template.name}" has been loaded`,
    })
  }

  const handleDeleteTemplate = (template: AgendaTemplate) => {
    deleteTemplate(template.id)
    refreshTemplates()

    toast({
      title: "Template Deleted",
      description: `Template "${template.name}" has been deleted`,
    })
  }

  const handleDuplicateTemplate = (template: AgendaTemplate) => {
    const newTemplate: AgendaTemplate = {
      ...template,
      id: generateId(),
      name: `${template.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    saveTemplate(newTemplate)
    refreshTemplates()

    toast({
      title: "Template Duplicated",
      description: `Template "${template.name}" has been duplicated`,
    })
  }

  const handleRenameTemplate = (template: AgendaTemplate, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      })
      return
    }

    const updatedTemplate: AgendaTemplate = {
      ...template,
      name: newName,
      updatedAt: Date.now(),
    }

    saveTemplate(updatedTemplate)
    setEditingTemplate(null)
    refreshTemplates()

    toast({
      title: "Template Renamed",
      description: `Template has been renamed to "${newName}"`,
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-5 w-5 rounded-md" title="Templates">
          <FileText className="h-2 w-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Agenda Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Save as new template */}
          <div className="flex items-center gap-2">
            <div className="flex-grow">
              <Input
                placeholder="Enter template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveAsTemplate} className="whitespace-nowrap">
              <Save className="h-4 w-4 mr-2" />
              Save Current
            </Button>
          </div>

          {/* Templates list */}
          <div className="border rounded-md">
            <ScrollArea className="h-[300px]">
              {templates.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No saved templates. Create one by saving your current agenda.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          {editingTemplate?.id === template.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingTemplate.name}
                                onChange={(e) =>
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    name: e.target.value,
                                  })
                                }
                                autoFocus
                                className="h-8"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRenameTemplate(template, editingTemplate.name)}
                              >
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingTemplate(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <span className="font-medium">{template.name}</span>
                          )}
                        </TableCell>
                        <TableCell>{template.agenda.length} items</TableCell>
                        <TableCell>{formatDate(template.updatedAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleLoadTemplate(template)}>
                              Load
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingTemplate(template)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTemplate(template)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
