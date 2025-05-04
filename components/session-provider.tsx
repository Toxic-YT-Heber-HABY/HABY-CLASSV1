/**
 * SessionProvider - Componente para gestionar la sesión del usuario
 */
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getFirebaseApp, isFirestoreAvailableSync } from "@/lib/firebase"

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const {
    isAuthenticated,
    sessionToken,
    checkSession,
    refreshSession,
    initializeAuth: storeInitAuth,
    firestoreAvailable,
  } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [initAttempts, setInitAttempts] = useState(0)
  const [showFirestoreWarning, setShowFirestoreWarning] = useState(false)
  const MAX_ATTEMPTS = 3

  // Verificar estado de Firebase y Auth al montar
  useEffect(() => {
    if (typeof window === "undefined") return

    // Verificar si Firestore está disponible
    if (!isFirestoreAvailableSync()) {
      setShowFirestoreWarning(true)
    }
  }, [])

  // Inicializar una sola vez
  useEffect(() => {
    if (!isInitialized && initAttempts < MAX_ATTEMPTS) {
      const init = async () => {
        try {
          console.log(`Initializing auth in SessionProvider (attempt ${initAttempts + 1}/${MAX_ATTEMPTS})...`)

          // Verificar que estamos en el cliente
          if (typeof window === "undefined") {
            console.log("Skipping auth initialization in server environment")
            setIsInitialized(true)
            return
          }

          // Verificar si Firebase está inicializado
          const app = getFirebaseApp()
          if (!app) {
            throw new Error("Firebase app is not initialized")
          }

          // Esperar un poco antes de inicializar Auth
          console.log("Waiting before initializing Auth...")
          await new Promise((resolve) => setTimeout(resolve, 3000))

          // Intentar inicializar a través del store
          try {
            console.log("Initializing Auth through store...")
            await storeInitAuth()
            console.log("Auth initialized through store")
          } catch (storeError) {
            console.warn("Error initializing Auth through store:", storeError)
            // Continuar a pesar del error
          }

          setIsInitialized(true)
          setInitError(null)
          console.log("Session initialization successful")

          // Mostrar advertencia si Firestore no está disponible
          if (!firestoreAvailable) {
            console.warn("Firestore is not available, some features may be limited")
            setShowFirestoreWarning(true)
          }
        } catch (error) {
          console.error(`Error al inicializar la sesión (intento ${initAttempts + 1}/${MAX_ATTEMPTS}):`, error)
          setInitError(error instanceof Error ? error.message : "Error desconocido al inicializar la sesión")

          // Incrementar contador de intentos
          setInitAttempts((prev) => prev + 1)

          // Si no es el último intento, esperar antes de reintentar
          if (initAttempts < MAX_ATTEMPTS - 1) {
            const retryDelay = 3000 * (initAttempts + 1) // Aumentar el tiempo de espera entre intentos
            console.log(`Retrying in ${retryDelay}ms...`)
            setTimeout(() => setIsInitialized(false), retryDelay)
          }
        }
      }

      init()
    }
  }, [isInitialized, storeInitAuth, initAttempts, firestoreAvailable])

  // Verificar y refrescar la sesión periódicamente (cada 5 minutos)
  useEffect(() => {
    if (!isAuthenticated || !sessionToken) return

    const interval = setInterval(
      () => {
        const isValid = checkSession()

        if (isValid) {
          refreshSession()
        }
      },
      5 * 60 * 1000,
    ) // 5 minutos

    return () => clearInterval(interval)
  }, [isAuthenticated, sessionToken, checkSession, refreshSession])

  // Refrescar la sesión cuando la ventana recupera el foco
  useEffect(() => {
    if (!isAuthenticated) return

    const handleFocus = () => {
      const isValid = checkSession()

      if (isValid) {
        refreshSession()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [isAuthenticated, checkSession, refreshSession])

  // Si hay demasiados intentos fallidos, mostrar un mensaje de error pero permitir continuar
  if (initAttempts >= MAX_ATTEMPTS) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-4 z-50">
          <div className="container mx-auto">
            <h2 className="text-lg font-semibold text-yellow-800">Advertencia de inicialización</h2>
            <p className="text-yellow-800">
              No se pudo inicializar completamente la autenticación. Algunas funciones pueden estar limitadas.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                setInitAttempts(0)
                setIsInitialized(false)
                setInitError(null)
              }}
            >
              Reintentar
            </Button>
          </div>
        </div>
        {children}
      </>
    )
  }

  // Si está inicializando, mostrar un indicador de carga
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg">Inicializando sesión...</p>
        {initAttempts > 0 && (
          <p className="text-sm text-muted-foreground">
            Intento {initAttempts + 1} de {MAX_ATTEMPTS}
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      {showFirestoreWarning && (
        <Alert variant="warning" className="fixed top-4 right-4 z-50 max-w-md">
          <AlertDescription>
            Firestore no está disponible. Algunas funciones como el almacenamiento de datos de usuario y clases pueden
            estar limitadas.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  )
}

