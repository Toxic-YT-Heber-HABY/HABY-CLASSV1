/**
 * AuthGuard - Componente de protección de rutas basado en autenticación
 *
 * Este componente envuelve otras páginas/componentes y:
 * - Verifica el estado de autenticación del usuario
 * - Redirige a login si se requiere autenticación y el usuario no está autenticado
 * - Redirige a home si no se requiere autenticación y el usuario ya está autenticado
 * - Renderiza sus hijos solo cuando las condiciones de autenticación son cumplidas
 *
 * Esto proporciona una capa de seguridad a nivel de cliente para las rutas protegidas.
 */
"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

interface AuthGuardProps {
  children: React.ReactNode // Componentes/páginas a proteger
  requireAuth?: boolean // Si es true, requiere autenticación; si es false, requiere NO autenticación
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Si se requiere autenticación y el usuario no está autenticado, redirigir a login
    if (requireAuth && !isAuthenticated) {
      router.push("/login")
    }

    // Si no se requiere autenticación y el usuario está autenticado, redirigir a home
    if (!requireAuth && isAuthenticated) {
      router.push("/home")
    }
  }, [isAuthenticated, requireAuth, router])

  // Lógica de renderizado condicional basada en el estado de autenticación
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}

