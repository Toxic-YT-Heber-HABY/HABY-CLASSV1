/**
 * LoadingSpinner - Componente para mostrar un indicador de carga
 *
 * Este componente muestra un spinner de carga con opciones de personalización
 * para tamaño y texto. Se utiliza para indicar operaciones asíncronas en curso.
 */
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" // Tamaño del spinner
  text?: string // Texto opcional a mostrar junto al spinner
  className?: string // Clases CSS adicionales
}

export function LoadingSpinner({ size = "md", text, className = "" }: LoadingSpinnerProps) {
  // Mapeo de tamaños a clases CSS
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

