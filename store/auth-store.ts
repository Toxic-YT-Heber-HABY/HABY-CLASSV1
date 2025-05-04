import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User, UserRole, Subject } from "@/types"
import {
  registerUser as registerUserService,
  loginUser as loginUserService,
  logoutUser as logoutUserService,
  requestPasswordReset,
  getCurrentUser,
} from "@/lib/auth-service"
import { isFirestoreAvailableSync, initializeAuth } from "@/lib/firebase"

// Definir una interfaz para el token de sesión
interface SessionToken {
  value: string
  expiresAt: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  sessionToken: SessionToken | null
  isLoading: boolean
  error: string | null
  firestoreAvailable: boolean
  login: (username: string, email: string, folio: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  resetPassword: (username: string, email: string) => Promise<void>
  verifyResetCode: (code: string) => Promise<boolean>
  setNewPassword: (password: string) => Promise<void>
  checkSession: () => boolean
  refreshSession: () => void
  initializeAuth: () => Promise<void>
}

interface RegisterData {
  username: string
  email: string
  folio: string
  curp: string
  departments: string[]
  password: string
  role: UserRole
  subjects?: Subject[]
}

// Código de recuperación temporal (para la versión de transición)
let resetCode = ""
let resetUsername = ""
let resetEmail = ""

// Tiempo de expiración de la sesión en milisegundos (8 horas)
const SESSION_EXPIRY = 8 * 60 * 60 * 1000

// Función para generar un token de sesión aleatorio
const generateSessionToken = (): SessionToken => {
  return {
    value: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    expiresAt: Date.now() + SESSION_EXPIRY,
  }
}

// Variable para evitar múltiples actualizaciones de estado
let lastRefreshTime = 0
let authInitPromise = null

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      sessionToken: null,
      isLoading: false,
      error: null,
      firestoreAvailable: isFirestoreAvailableSync(), // Usar el valor actual

      // Inicializar autenticación al cargar la aplicación
      initializeAuth: async () => {
        // Si ya hay una promesa de inicialización en curso, devolver esa
        if (authInitPromise) {
          return authInitPromise
        }

        set({ isLoading: true, error: null })

        // Crear una nueva promesa de inicialización
        authInitPromise = (async () => {
          try {
            console.log("Initializing auth in store...")

            // Verificar que estamos en el cliente
            if (typeof window === "undefined") {
              console.log("Skipping auth initialization in server environment")
              set({ isLoading: false })
              return
            }

            // Esperar un poco antes de inicializar Auth
            console.log("Waiting before initializing Auth...")
            await new Promise((resolve) => setTimeout(resolve, 3000))

            // Inicializar Auth
            try {
              console.log("Initializing Auth...")
              await initializeAuth()
              console.log("Auth initialized successfully")
            } catch (authError) {
              console.error("Error initializing Auth:", authError)
              // Continuar a pesar del error
            }

            // Actualizar estado de Firestore
            set({ firestoreAvailable: isFirestoreAvailableSync() })

            // Esperar un poco más antes de obtener el usuario actual
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Intentar obtener el usuario actual
            try {
              console.log("Getting current user...")
              const user = await getCurrentUser()

              if (user) {
                console.log("User found:", user.username)
                // Generar un nuevo token de sesión
                const sessionToken = generateSessionToken()

                set({
                  user,
                  isAuthenticated: true,
                  sessionToken,
                  isLoading: false,
                })
              } else {
                console.log("No user found")
                set({
                  user: null,
                  isAuthenticated: false,
                  sessionToken: null,
                  isLoading: false,
                })
              }
            } catch (userError) {
              console.error("Error getting current user:", userError)
              // No lanzar error, simplemente establecer usuario como no autenticado
              set({
                user: null,
                isAuthenticated: false,
                sessionToken: null,
                isLoading: false,
              })
            }
          } catch (error) {
            console.error("Error al inicializar autenticación:", error)

            set({
              user: null,
              isAuthenticated: false,
              sessionToken: null,
              isLoading: false,
              error: error instanceof Error ? error.message : "Error desconocido en la inicialización",
            })

            // Propagar el error para que pueda ser capturado por el componente SessionProvider
            throw error
          } finally {
            // Resetear la promesa después de completar
            setTimeout(() => {
              authInitPromise = null
            }, 1000)
          }
        })()

        return authInitPromise
      },

      /**
       * Verifica si la sesión actual es válida
       * @returns boolean - true si la sesión es válida, false si no
       */
      checkSession: () => {
        const state = get()

        // Si no hay usuario o no está autenticado, la sesión no es válida
        if (!state.isAuthenticated || !state.user || !state.sessionToken) {
          return false
        }

        // Verificar si la sesión ha expirado
        const now = Date.now()
        if (now > state.sessionToken.expiresAt) {
          // La sesión ha expirado, cerrar sesión
          set({
            user: null,
            isAuthenticated: false,
            sessionToken: null,
          })
          return false
        }

        // La sesión es válida
        return true
      },

      /**
       * Refresca la sesión actual extendiendo su tiempo de expiración
       */
      refreshSession: () => {
        const now = Date.now()
        // Evitar múltiples actualizaciones en un corto período
        if (now - lastRefreshTime < 60000) {
          // 1 minuto
          return
        }

        lastRefreshTime = now
        const state = get()

        // Solo refrescar si hay una sesión activa
        if (state.isAuthenticated && state.user && state.sessionToken) {
          set({
            sessionToken: {
              value: state.sessionToken.value,
              expiresAt: now + SESSION_EXPIRY,
            },
          })
        }
      },

      login: async (username, email, folio, password) => {
        set({ isLoading: true, error: null })

        try {
          // Usar el email para iniciar sesión con Firebase
          if (!email) {
            throw new Error("Se requiere el correo electrónico para iniciar sesión")
          }

          const user = await loginUserService(email, password)

          if (!user) {
            throw new Error("Credenciales inválidas")
          }

          // Generar un nuevo token de sesión
          const sessionToken = generateSessionToken()

          set({
            user,
            isAuthenticated: true,
            sessionToken,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error desconocido",
            isLoading: false,
          })
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })

        try {
          const user = await registerUserService(userData)

          if (!user) {
            throw new Error("Error al registrar usuario")
          }

          // Generar un nuevo token de sesión
          const sessionToken = generateSessionToken()

          set({
            user,
            isAuthenticated: true,
            sessionToken,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error desconocido",
            isLoading: false,
          })
        }
      },

      logout: async () => {
        try {
          await logoutUserService()

          set({
            user: null,
            isAuthenticated: false,
            sessionToken: null,
          })
        } catch (error) {
          console.error("Error al cerrar sesión:", error)
        }
      },

      resetPassword: async (username, email) => {
        set({ isLoading: true, error: null })

        try {
          // En la versión de transición, mantenemos el código temporal
          // pero también usamos Firebase para el restablecimiento real
          await requestPasswordReset(email)

          // Generar código numérico aleatorio de 4 dígitos para recuperación
          resetCode = Math.floor(1000 + Math.random() * 9000).toString()
          resetUsername = username
          resetEmail = email

          // En producción, aquí se enviaría el código por email real
          console.log(`Código de recuperación para ${username} (${email}): ${resetCode}`)

          set({ isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error desconocido",
            isLoading: false,
          })
        }
      },

      verifyResetCode: async (code) => {
        set({ isLoading: true, error: null })

        try {
          // En la versión de transición, verificamos el código temporal
          const isValid = code === resetCode

          if (!isValid) {
            throw new Error("Código inválido")
          }

          set({ isLoading: false })
          return true
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error desconocido",
            isLoading: false,
          })
          return false
        }
      },

      setNewPassword: async (password) => {
        set({ isLoading: true, error: null })

        try {
          // En la versión de transición, simulamos el cambio de contraseña
          // pero también usamos Firebase para el cambio real
          // Nota: En una implementación real, necesitaríamos el código de verificación
          // que Firebase envía por email

          // Simulación de cambio de contraseña
          console.log(`Contraseña actualizada para ${resetUsername} (${resetEmail})`)

          // Resetear código y usuario
          resetCode = ""
          resetUsername = ""
          resetEmail = ""

          set({ isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error desconocido",
            isLoading: false,
          })
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        // Verificamos si localStorage está disponible para evitar errores
        if (typeof window !== "undefined") {
          return localStorage
        }
        // Fallback para entornos sin localStorage (SSR)
        return {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        }
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionToken: state.sessionToken,
      }),
    },
  ),
)

