"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  placeholder?: string
  onValueChange: (values: string[]) => void
  defaultValue?: string[]
  className?: string
}

export function MultiSelect({
  options,
  placeholder = "Seleccionar...",
  onValueChange,
  defaultValue = [],
  className,
}: MultiSelectProps) {
  const [selected, setSelected] = React.useState<string[]>(defaultValue)
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleUnselect = React.useCallback(
    (value: string) => {
      const newSelected = selected.filter((s) => s !== value)
      setSelected(newSelected)
      onValueChange(newSelected)
    },
    [selected, onValueChange],
  )

  const handleSelect = React.useCallback(
    (value: string) => {
      if (selected.includes(value)) {
        handleUnselect(value)
      } else {
        const newSelected = [...selected, value]
        setSelected(newSelected)
        onValueChange(newSelected)
      }
      setSearchTerm("")
    },
    [selected, handleUnselect, onValueChange],
  )

  // Cerrar el dropdown cuando se hace clic fuera
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  // Filtrar opciones basadas en el término de búsqueda
  const filteredOptions = options.filter(
    (option) => !selected.includes(option.value) && option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((value) => {
            const option = options.find((o) => o.value === value)
            return (
              <Badge key={value} variant="secondary" className="mb-1">
                {option?.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnselect(value)
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selected.length === 0 ? placeholder : undefined}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute w-full z-10 top-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <div className="h-full overflow-auto max-h-[200px] p-1">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

