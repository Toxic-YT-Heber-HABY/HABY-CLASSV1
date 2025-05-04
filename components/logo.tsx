/**
 * Logo - Componente del logo de la aplicación
 *
 * Este componente:
 * - Muestra el logo de HABY con opciones de personalización
 * - Adapta su visualización según el tema (claro/oscuro)
 * - Permite diferentes tamaños predefinidos
 * - Opcionalmente muestra el texto del logo junto a la imagen
 * - Incluye protección para hidratación en Server-Side Rendering
 * - Optimizado para carga rápida con next/image
 */
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string // Clases CSS adicionales
  size?: "sm" | "md" | "lg" // Tamaño del logo (pequeño, mediano, grande)
  showText?: boolean // Si debe mostrar el texto "HABY" junto al logo
}

export function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  // Estado para controlar la hidratación del componente
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratación en SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Dimensiones del logo según el tamaño seleccionado
  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 60, height: 60 },
  }

  const { width, height } = dimensions[size]

  // Placeholder durante la hidratación para evitar saltos de contenido
  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-[${width}px] h-[${height}px] bg-muted rounded-md`} />
        {showText && <div className={`h-6 w-16 bg-muted rounded-md ${size === "lg" ? "h-8 w-20" : ""}`} />}
      </div>
    )
  }

  // Ruta del archivo de imagen del logo
  const logoSrc = "/images/logo.png"

  return (
    <Link href="/home" className={`flex items-center gap-2 ${className}`}>
      <Image
        src={logoSrc || "/placeholder.svg"}
        alt="HABY Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
        loading="eager"
        sizes={`${width}px`}
      />
      {showText && <span className={`font-bold ${size === "lg" ? "text-2xl" : "text-xl"}`}>HABY</span>}
    </Link>
  )
}

