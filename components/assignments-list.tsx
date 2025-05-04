"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useClassStore } from "@/store/class-store"
import { useAuthStore } from "@/store/auth-store"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, FileText, Loader2 } from "lucide-react"

interface AssignmentsListProps {
  classId: string
}

export function AssignmentsList({ classId }: AssignmentsListProps) {
  const { createAssignment, assignments, fetchMoreAssignments, loadingAssignments } = useClassStore()
  const { user } = useAuthStore()
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: new Date(),
    points: 100,
  })
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAssignment.title.trim()) return

    setIsSubmitting(true)
    try {
      await createAssignment(classId, newAssignment)
      setIsCreating(false)
      setNewAssignment({
        title: "",
        description: "",
        dueDate: new Date(),
        points: 100,
      })
    } catch (error) {
      console.error("Error al crear tarea:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Configurar Intersection Observer para carga infinita
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !loadingAssignments) {
          fetchMoreAssignments(classId)
        }
      },
      {
        rootMargin: "0px 0px 200px 0px", // Cargar más cuando estemos a 200px del final
      },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
  }, [classId, fetchMoreAssignments, loadingAssignments])

  // Configurar observer cuando cambian las dependencias
  useEffect(() => {
    setupObserver()

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [setupObserver])

  // Ordenar tareas por fecha de entrega (más próximas primero)
  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  )

  return (
    <div className="space-y-6">
      {user?.role === "teacher" && (
        <div className="mb-6">
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)}>Crear tarea</Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nueva tarea</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Título
                    </label>
                    <Input
                      id="title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Descripción
                    </label>
                    <Textarea
                      id="description"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fecha de entrega</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(newAssignment.dueDate, "PPP", { locale: es })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newAssignment.dueDate}
                            onSelect={(date) => date && setNewAssignment({ ...newAssignment, dueDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="points" className="text-sm font-medium">
                        Puntos
                      </label>
                      <Input
                        id="points"
                        type="number"
                        min="0"
                        value={newAssignment.points}
                        onChange={(e) =>
                          setNewAssignment({
                            ...newAssignment,
                            points: Number.parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !newAssignment.title.trim()}>
                      {isSubmitting ? "Creando..." : "Crear tarea"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {sortedAssignments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay tareas asignadas todavía</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {sortedAssignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden fade-in">
                <div className="flex">
                  <div className="p-4 bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardContent className="p-4 flex-1">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription>
                      Fecha de entrega: {format(new Date(assignment.dueDate), "PPP", { locale: es })}
                    </CardDescription>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm font-medium">{assignment.points} puntos</span>
                      <Button size="sm">Ver detalles</Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {/* Elemento de referencia para carga infinita */}
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
            {loadingAssignments && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando más tareas...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

