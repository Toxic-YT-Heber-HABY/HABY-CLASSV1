/**
 * Header - Componente de navegación principal de la aplicación
 *
 * Este componente:
 * - Muestra el logo de la aplicación
 * - Proporciona la barra de búsqueda
 * - Muestra notificaciones al usuario
 * - Permite cambiar el idioma y el tema
 * - Ofrece acceso al menú de usuario y cierre de sesión
 */
"use client"
import { useRouter } from "next/navigation"
import { Bell, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/auth-store"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { SearchBar } from "@/components/search-bar"

export function Header() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  /**
   * Maneja el cierre de sesión del usuario
   * y redirige al login
   */
  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Logo className="hidden md:flex" />
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 text-sm">
                  <p className="font-medium">Nueva tarea asignada</p>
                  <p className="text-muted-foreground">Proyecto Final: Aplicación React</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 2 horas</p>
                </div>
                <DropdownMenuSeparator />
                <div className="p-3 text-sm">
                  <p className="font-medium">Recordatorio de entrega</p>
                  <p className="text-muted-foreground">Tarea 1: Ecuaciones Diferenciales</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 1 día</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <LanguageSelector />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

