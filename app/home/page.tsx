"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthStore } from "@/store/auth-store"
import { useClassStore } from "@/store/class-store"
import { useLanguageStore } from "@/components/language-selector"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ClassCard } from "@/components/class-card"
import { toast } from "@/components/ui/use-toast"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { classes, fetchClasses, isLoading } = useClassStore()
  const { language } = useLanguageStore()
  const [isSessionChecked, setIsSessionChecked] = useState(false)

  // Traducciones
  const translations = {
    es: {
      myClasses: "Mis clases",
      loading: "Cargando clases...",
      noClasses: "No tienes clases",
      notEnrolled: "Aún no estás inscrito en ninguna clase",
      welcome: "Bienvenido a HABY",
      welcomeMessage: "Has iniciado sesión correctamente. Estamos cargando tus clases...",
    },
    en: {
      myClasses: "My classes",
      loading: "Loading classes...",
      noClasses: "You don't have any classes",
      notEnrolled: "You are not enrolled in any class yet",
      welcome: "Welcome to HABY",
      welcomeMessage: "You have successfully logged in. We are loading your classes...",
    },
  }

  const t = translations[language]

  // Verificar autenticación una sola vez al cargar
  useEffect(() => {
    if (!isSessionChecked) {
      if (!isAuthenticated) {
        router.push("/login")
      } else {
        // Mostrar mensaje de bienvenida
        toast({
          title: t.welcome,
          description: t.welcomeMessage,
        })

        // Cargar clases
        fetchClasses()
      }
      setIsSessionChecked(true)
    }
  }, [isAuthenticated, router, isSessionChecked, fetchClasses, t])

  // Si aún no se ha verificado la sesión, mostrar spinner
  if (!isSessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text={t.loading} />
      </div>
    )
  }

  // Si no está autenticado (después de verificar), no renderizar nada
  // (la redirección ya se habrá iniciado)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text={t.loading} />
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
            <h1 className="text-3xl font-bold mb-6">{t.myClasses}</h1>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text={t.loading} />
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">{t.noClasses}</h2>
                <p className="text-muted-foreground">{t.notEnrolled}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                  <ClassCard key={classItem.id} classData={classItem} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

