/**
 * SessionDebug - Componente para depurar problemas de sesión
 */
"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { isFirebaseConfigured, initializeFirebaseManually, isFirestoreAvailableSync } from "@/lib/firebase"

export function SessionDebug() {
  const {
    user,
    isAuthenticated,
    sessionToken,
    checkSession,
    refreshSession,
    logout,
    initializeAuth,
    firestoreAvailable,
  } = useAuthStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [sessionInfo, setSessionInfo] = useState({
    isValid: false,
    remainingTime: 0,
  })
  const [firebaseStatus, setFirebaseStatus] = useState({
    configured: false,
    initialized: false,
    firestoreAvailable: false,
  })

  // Verificar estado de Firebase
  useEffect(() => {
    if (!isExpanded) return

    const checkFirebase = async () => {
      const configured = isFirebaseConfigured()
      let initialized = false
      let firestoreAvailable = isFirestoreAvailableSync()

      try {
        const result = await initializeFirebaseManually()
        initialized = result.initialized
        firestoreAvailable = result.firestoreAvailable
      } catch (error) {
        console.error("Error checking Firebase initialization:", error)
      }

      setFirebaseStatus({
        configured,
        initialized,
        firestoreAvailable,
      })
    }

    checkFirebase()
  }, [isExpanded])

  // Actualizar información de sesión periódicamente
  useEffect(() => {
    if (!isExpanded) return

    const updateSessionInfo = () => {
      setSessionInfo({
        isValid: checkSession(),
        remainingTime: sessionToken ? Math.max(0, Math.floor((sessionToken.expiresAt - Date.now()) / 60000)) : 0,
      })
    }

    updateSessionInfo()
    const interval = setInterval(updateSessionInfo, 10000) // Actualizar cada 10 segundos

    return () => clearInterval(interval)
  }, [isExpanded, sessionToken, checkSession])

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === "production") {
    return null
  }

  const handleToggle = () => {
    setIsExpanded((prev) => !prev)
  }

  const handleRefresh = () => {
    refreshSession()
    // Actualizar información inmediatamente después de refrescar
    setSessionInfo({
      isValid: checkSession(),
      remainingTime: sessionToken ? Math.max(0, Math.floor((sessionToken.expiresAt - Date.now()) / 60000)) : 0,
    })
  }

  const handleLogout = () => {
    logout()
  }

  const handleInitializeAuth = async () => {
    try {
      await initializeAuth()
      alert("Auth initialized successfully")
    } catch (error) {
      alert(`Error initializing Auth: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleInitializeFirebase = async () => {
    try {
      const result = await initializeFirebaseManually()
      if (result.initialized) {
        alert(`Firebase initialized successfully. Firestore available: ${result.firestoreAvailable}`)
        setFirebaseStatus((prev) => ({
          ...prev,
          initialized: true,
          firestoreAvailable: result.firestoreAvailable,
        }))
      } else {
        alert(`Failed to initialize Firebase: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      alert(`Error initializing Firebase: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={handleToggle} className="mb-2">
        {isExpanded ? "Ocultar" : "Depurar Sesión"}
      </Button>

      {isExpanded && (
        <Card className="w-80 shadow-lg">
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Información de Sesión</CardTitle>
          </CardHeader>
          <CardContent className="py-2 text-xs">
            <div className="space-y-2">
              <div>
                <strong>Estado de autenticación:</strong> {isAuthenticated ? "Autenticado" : "No autenticado"}
              </div>

              <div>
                <strong>Sesión válida:</strong> {sessionInfo.isValid ? "Sí" : "No"}
              </div>

              <div>
                <strong>Firebase configurado:</strong> {firebaseStatus.configured ? "Sí" : "No"}
              </div>

              <div>
                <strong>Firebase inicializado:</strong> {firebaseStatus.initialized ? "Sí" : "No"}
              </div>

              <div>
                <strong>Firestore disponible:</strong> {firebaseStatus.firestoreAvailable ? "Sí" : "No"}
                {!firebaseStatus.firestoreAvailable && <span className="text-yellow-500 ml-1">(Modo limitado)</span>}
              </div>

              {sessionToken && (
                <>
                  <div>
                    <strong>Token:</strong> {sessionToken.value.substring(0, 8)}...
                  </div>

                  <div>
                    <strong>Expira:</strong> {new Date(sessionToken.expiresAt).toLocaleString()}
                  </div>

                  <div>
                    <strong>Tiempo restante:</strong> {sessionInfo.remainingTime} minutos
                  </div>
                </>
              )}

              {user && (
                <div>
                  <strong>Usuario:</strong> {user.username} ({user.role})
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={handleRefresh}>
                  Refrescar
                </Button>

                <Button size="sm" variant="destructive" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={handleInitializeFirebase}>
                  Init Firebase
                </Button>

                <Button size="sm" variant="outline" onClick={handleInitializeAuth}>
                  Init Auth
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

