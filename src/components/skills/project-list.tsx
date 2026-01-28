'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DeliveryTracker } from './delivery-tracker'
import { useAddProject, useUpdateProjectStatus } from '@/hooks/use-skills'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Project, Delivery, ProjectStatus } from '@/types/database'

const statusLabels: Record<ProjectStatus, string> = {
  planning: 'Planejando',
  in_progress: 'Em andamento',
  completed: 'Concluido',
  on_hold: 'Pausado',
}

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-500/20 text-blue-500',
  in_progress: 'bg-yellow-500/20 text-yellow-500',
  completed: 'bg-primary/20 text-primary',
  on_hold: 'bg-muted text-muted-foreground',
}

interface ProjectListProps {
  skillId: string
  projects: (Project & { deliveries: Delivery[] })[]
}

export function ProjectList({ skillId, projects }: ProjectListProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const addProject = useAddProject()
  const updateStatus = useUpdateProjectStatus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await addProject.mutateAsync({ skill_id: skillId, name })
      toast.success('Projeto criado')
      setName('')
      setOpen(false)
    } catch {
      toast.error('Erro ao criar projeto')
    }
  }

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status })
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Projetos</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Novo projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo projeto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nome do projeto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={addProject.isPending}>
                {addProject.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum projeto ainda
        </p>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <div key={project.id} className="border border-border rounded-lg">
              <div
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => setExpandedProject(
                  expandedProject === project.id ? null : project.id
                )}
              >
                <div className="flex items-center gap-2">
                  {expandedProject === project.id
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  }
                  <span className="font-medium text-sm">{project.name}</span>
                </div>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(project.id, e.target.value as ProjectStatus)}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    'text-xs px-2 py-1 rounded border-0 cursor-pointer',
                    statusColors[project.status]
                  )}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              {expandedProject === project.id && (
                <div className="border-t border-border p-3">
                  <DeliveryTracker
                    projectId={project.id}
                    deliveries={project.deliveries}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
