"use client"

import { useState, useEffect } from "react"
import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Definir los idiomas disponibles
export type Language = "es" | "en"

// Interfaz para el store de idioma
interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

// Crear el store de idioma con persistencia
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "es",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => {
        // Verificamos si localStorage está disponible
        if (typeof window !== "undefined") {
          return localStorage
        }
        // Fallback para entornos sin localStorage
        return {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        }
      }),
    },
  ),
)

// Componente para seleccionar el idioma
export function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore()
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Globe className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("es")} className="flex items-center gap-2">
          <span>Español</span>
          {language === "es" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")} className="flex items-center gap-2">
          <span>English</span>
          {language === "en" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

