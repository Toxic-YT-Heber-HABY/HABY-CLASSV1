/**
 * Sidebar - Barra lateral de navegación principal
 *
 * Este componente:
 * - Muestra enlaces de navegación principal de la aplicación
 * - Adapta su visualización según el tamaño del dispositivo
 * - Permite navegar entre las clases del usuario
 * - Muestra información contextual del usuario
 *
 * Es responsive y se oculta automáticamente en dispositivos móviles,
 * mostrándose como un menú desplegable.
 */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, BookOpen, CheckSquare, Settings, ChevronDown, ChevronRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useClassStore } from "@/store/class-store"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { useAuthStore } from "@/store/auth-store"

interface SidebarProps {
  className?: string // Clases CSS adicionales para personalizar el componente
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { classes } = useClassStore()
  const { isAuthenticated } = useAuthStore()
  const [isClassesOpen, setIsClassesOpen] = useState(true) // Controla si la lista de clases está desplegada
  const [isMobileOpen, setIsMobileOpen] = useState(false) // Controla si el sidebar está abierto en móvil
  const [isMobile, setIsMobile] = useState(false) // Detecta si el dispositivo es móvil

  /**
   * Detecta si el dispositivo es móvil basado en el ancho de pantalla
   * y actualiza el estado correspondiente
   */
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Si el usuario no está autenticado, no mostrar la barra lateral
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <Logo size="lg" />
            <p className="text-sm text-muted-foreground mt-1">Plataforma Educativa</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <Link
              href="/home"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors",
                pathname === "/home" && "bg-muted font-medium",
              )}
              onClick={() => isMobile && setIsMobileOpen(false)}
            >
              <Home size={18} />
              <span>Inicio</span>
            </Link>

            <Link
              href="/calendar"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors",
                pathname === "/calendar" && "bg-muted font-medium",
              )}
              onClick={() => isMobile && setIsMobileOpen(false)}
            >
              <Calendar size={18} />
              <span>Calendario</span>
            </Link>

            <div className="pt-2">
              <button
                className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setIsClassesOpen(!isClassesOpen)}
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} />
                  <span>Clases</span>
                </div>
                {isClassesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isClassesOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {classes.map((cls) => (
                    <Link
                      key={cls.id}
                      href={`/class/${cls.id}`}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm",
                        pathname === `/class/${cls.id}` && "bg-muted font-medium",
                      )}
                      onClick={() => isMobile && setIsMobileOpen(false)}
                    >
                      <div className={`w-2 h-2 rounded-full bg-${cls.color}`} />
                      <span>{cls.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/tasks"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors",
                pathname === "/tasks" && "bg-muted font-medium",
              )}
              onClick={() => isMobile && setIsMobileOpen(false)}
            >
              <CheckSquare size={18} />
              <span>Tareas pendientes</span>
            </Link>

            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors",
                pathname === "/settings" && "bg-muted font-medium",
              )}
              onClick={() => isMobile && setIsMobileOpen(false)}
            >
              <Settings size={18} />
              <span>Configuración</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}

