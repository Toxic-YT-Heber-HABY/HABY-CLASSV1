/**
 * SearchBar - Componente de barra de búsqueda
 *
 * Este componente permite:
 * - Buscar clases por nombre o materia
 * - Limpiar la consulta con un botón
 * - Navegar directamente a la página de la clase encontrada
 *
 * Implementa una búsqueda básica en memoria utilizando los datos
 * del store de clases.
 */
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useClassStore } from "@/store/class-store"

export function SearchBar() {
  const [query, setQuery] = useState("") // Texto de búsqueda
  const inputRef = useRef<HTMLInputElement>(null) // Referencia al input para enfocar
  const router = useRouter()
  const { classes } = useClassStore()

  /**
   * Maneja el envío del formulario de búsqueda
   * Busca clases que coincidan con la consulta y navega a la primera coincidencia
   * @param e Evento de formulario
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Implementación básica de búsqueda en memoria
      const foundClass = classes.find(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) || c.subject.toLowerCase().includes(query.toLowerCase()),
      )

      if (foundClass) {
        router.push(`/class/${foundClass.id}`)
      }
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Buscar..."
        className="w-full pl-8 pr-10 md:w-[300px]"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Buscar clases"
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => {
            setQuery("")
            inputRef.current?.focus()
          }}
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  )
}

