"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClassTabs } from "@/components/class-tabs"
import { useAuthStore } from "@/store/auth-store"
import { useClassStore } from "@/store/class-store"
import { LoadingSpinner } from "@/components/loading-spinner"
import { SessionDebug } from "@/components/session-debug"

export default function ClassPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params.id as string
  const { isAuthenticated, checkSession, refreshSession } = useAuthStore()
  const { currentClass, fetchClassById, isLoading } = useClassStore()

  // Verificar sesión y redireccionar si no está autenticado
  useEffect(() => {
    const verifySession = async () => {
      if (!isAuthenticated || !checkSession()) {
        // Si no está autenticado o la sesión no es válida, redirigir al login
        router.push(`/login?callbackUrl=${encodeURIComponent(`/class/${classId}`)}`)
        return
      }

      // Si la sesión es válida, refrescarla
      refreshSession()
    }

    verifySession()
  }, [isAuthenticated, router, classId, checkSession, refreshSession])

  // Cargar clase
  useEffect(() => {
    if (isAuthenticated && checkSession() && classId) {
      fetchClassById(classId)
    }
  }, [isAuthenticated, checkSession, classId, fetchClassById])

  // Si no está autenticado, mostrar spinner de carga
  if (!isAuthenticated || !checkSession()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando sesión..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="container mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Cargando clase..." />
              </div>
            ) : !currentClass ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Clase no encontrada</h2>
                <p className="text-muted-foreground">La clase que buscas no existe o no tienes acceso a ella</p>
              </div>
            ) : (
              <>
                <div
                  className={`p-6 mb-6 rounded-lg bg-${currentClass.color}/10 border border-${currentClass.color}/20`}
                >
                  <h1 className="text-3xl font-bold">{currentClass.name}</h1>
                  <p className="text-lg text-muted-foreground">
                    {currentClass.subject} • Sección: {currentClass.section} • Aula: {currentClass.room}
                  </p>
                </div>

                <ClassTabs />
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
      <SessionDebug />
    </div>
  )
}

