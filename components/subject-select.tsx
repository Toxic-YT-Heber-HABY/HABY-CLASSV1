"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Subject } from "@/types"

interface SubjectSelectProps {
  value: Subject[]
  onValueChange: (value: Subject[]) => void
  disabled?: boolean
}

export function SubjectSelect({ value, onValueChange, disabled = false }: SubjectSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const subjects = Object.values(Subject)

  const toggleSubject = (subject: Subject) => {
    if (value.includes(subject)) {
      onValueChange(value.filter((s) => s !== subject))
    } else {
      onValueChange([...value, subject])
    }
  }

  // Filtrar materias basadas en el término de búsqueda
  const filteredSubjects = subjects.filter((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()))

  // Enfocar el input cuando se abre el popover
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value.length > 0
            ? `${value.length} materia${value.length !== 1 ? "s" : ""} seleccionada${value.length !== 1 ? "s" : ""}`
            : "Seleccionar materias"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="flex flex-col">
          <div className="p-2">
            <input
              ref={inputRef}
              placeholder="Buscar materia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredSubjects.length === 0 ? (
              <div className="py-6 text-center text-sm">No se encontraron materias.</div>
            ) : (
              filteredSubjects.map((subject) => (
                <div
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <Check className={cn("mr-2 h-4 w-4", value.includes(subject) ? "opacity-100" : "opacity-0")} />
                  {subject}
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

