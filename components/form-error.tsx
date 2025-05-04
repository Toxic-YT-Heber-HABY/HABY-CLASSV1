/**
 * FormError - Componente para mostrar mensajes de error en formularios
 *
 * Este componente:
 * - Muestra un mensaje de error formateado consistentemente
 * - Incluye un icono de alerta para mejor visibilidad
 * - No renderiza nada si no hay mensaje de error (evita espacios vacíos)
 *
 * @param message - El mensaje de error a mostrar (opcional)
 */
import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  message?: string // Mensaje de error a mostrar
}

export function FormError({ message }: FormErrorProps) {
  // Si no hay mensaje, no renderizar nada
  if (!message) return null

  return (
    <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
      <AlertCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  )
}

