"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useClassStore } from "@/store/class-store"
import { useAuthStore } from "@/store/auth-store"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2 } from "lucide-react"

interface AnnouncementsListProps {
  classId: string
}

export function AnnouncementsList({ classId }: AnnouncementsListProps) {
  const { createAnnouncement, announcements, fetchMoreAnnouncements, loadingAnnouncements } = useClassStore()
  const { user } = useAuthStore()
  const [newAnnouncement, setNewAnnouncement] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Manejar envío de nuevo anuncio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnnouncement.trim()) return

    setIsSubmitting(true)
    try {
      await createAnnouncement(classId, newAnnouncement)
      setNewAnnouncement("")
    } catch (error) {
      console.error("Error al crear anuncio:", error)
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
        if (entry.isIntersecting && !loadingAnnouncements) {
          fetchMoreAnnouncements(classId)
        }
      },
      {
        rootMargin: "0px 0px 200px 0px", // Cargar más cuando estemos a 200px del final
      },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
  }, [classId, fetchMoreAnnouncements, loadingAnnouncements])

  // Configurar observer cuando cambian las dependencias
  useEffect(() => {
    setupObserver()

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [setupObserver])

  return (
    <div className="space-y-6">
      {user?.role === "teacher" && (
        <Card>
          <CardHeader>
            <CardTitle>Crear anuncio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="Comparte algo con tu clase..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                className="min-h-[100px] mb-4"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !newAnnouncement.trim()}>
                  {isSubmitting ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay anuncios todavía</p>
        </div>
      ) : (
        <>
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="fade-in">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Profesor</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(announcement.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-line">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}

          {/* Elemento de referencia para carga infinita */}
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
            {loadingAnnouncements && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando más anuncios...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

