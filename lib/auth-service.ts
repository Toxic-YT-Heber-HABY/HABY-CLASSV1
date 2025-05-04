import { getFirestore_safe, isFirebaseConfigured, isFirestoreAvailableSync, initializeAuth } from "@/lib/firebase"
import type { UserRole } from "@/types"

/**
 * Servicio de autenticación que utiliza Firebase Auth
 * Proporciona métodos para registro, inicio de sesión, cierre de sesión y gestión de contraseñas
 */

// Convertir usuario de Firebase a usuario de la aplicación
const mapFirebaseUser = async (firebaseUser) => {
  if (!firebaseUser) return null

  try {
    // Datos básicos del usuario que siempre estarán disponibles
    const basicUserData = {
      id: firebaseUser.uid,
      username: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      folio: "",
      curp: "",
      departments: [],
      role: "student" as UserRole, // Rol por defecto
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Verificar si Firestore está disponible
    if (!isFirestoreAvailableSync()) {
      console.log("Firestore no está disponible, devolviendo datos básicos del usuario")
      return basicUserData
    }

    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    if (!firestore) {
      console.warn("Firestore no está disponible, devolviendo datos básicos del usuario")
      return basicUserData
    }

    // Importar funciones de Firestore bajo demanda
    try {
      const { doc, getDoc } = await import("firebase/firestore")

      // Obtener datos adicionales del usuario desde Firestore
      const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid))

      if (!userDoc.exists()) {
        console.warn("Usuario no encontrado en Firestore, devolviendo datos básicos")
        return basicUserData
      }

      const userData = userDoc.data()

      return {
        id: firebaseUser.uid,
        username: userData.username || firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        folio: userData.folio || "",
        curp: userData.curp || "",
        departments: userData.departments || [],
        role: userData.role as UserRole,
        subjects: userData.subjects || undefined,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      }
    } catch (firestoreError) {
      console.error("Error al obtener datos de usuario desde Firestore:", firestoreError)
      return basicUserData
    }
  } catch (error) {
    console.error("Error al mapear usuario de Firebase:", error)
    return null
  }
}

// Función para obtener Auth con reintentos
const getAuthWithRetries = async (maxRetries = 3, delayMs = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempting to get Auth (attempt ${i + 1}/${maxRetries})...`)

      // Esperar antes de intentar inicializar Auth
      await new Promise((resolve) => setTimeout(resolve, delayMs))

      // Inicializar Auth
      const auth = await initializeAuth()

      if (auth) {
        console.log("Auth obtained successfully")
        return auth
      }

      console.log(`Auth not available on attempt ${i + 1}, waiting before retry...`)
      // Esperar antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)))
    } catch (error) {
      console.error(`Error getting Auth (attempt ${i + 1}/${maxRetries}):`, error)

      // Esperar antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)))
    }
  }

  // Si llegamos aquí, no pudimos obtener Auth
  throw new Error("No se pudo inicializar Auth después de varios intentos")
}

// Registro de usuario
export const registerUser = async (userData: {
  username: string
  email: string
  folio: string
  curp: string
  departments: string[]
  password: string
  role: UserRole
  subjects?: string[]
}) => {
  try {
    // Verificar si Firebase está configurado
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase no está correctamente configurado. Verifica las variables de entorno.")
    }

    // Obtener Auth con reintentos
    const auth = await getAuthWithRetries()
    if (!auth) {
      throw new Error("No se pudo inicializar Auth")
    }

    // Importar funciones de Auth bajo demanda
    const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)

    // Actualizar perfil con nombre de usuario
    await updateProfile(userCredential.user, {
      displayName: userData.username,
    })

    // Verificar si Firestore está disponible
    if (!isFirestoreAvailableSync()) {
      console.warn("Firestore no está disponible, omitiendo almacenamiento de datos adicionales")
      return await mapFirebaseUser(userCredential.user)
    }

    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()

    // Si Firestore está disponible, guardar datos adicionales
    if (firestore) {
      try {
        // Importar funciones de Firestore bajo demanda
        const { doc, setDoc, serverTimestamp } = await import("firebase/firestore")

        // Guardar datos adicionales en Firestore
        await setDoc(doc(firestore, "users", userCredential.user.uid), {
          username: userData.username,
          email: userData.email,
          folio: userData.folio,
          curp: userData.curp,
          departments: userData.departments,
          role: userData.role,
          subjects: userData.subjects || [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } catch (firestoreError) {
        console.warn("Error al guardar datos en Firestore, continuando con autenticación básica:", firestoreError)
        // Continuar sin Firestore, ya tenemos el usuario autenticado
      }
    } else {
      console.warn("Firestore no está disponible, continuando con autenticación básica")
    }

    // Devolver usuario mapeado
    return await mapFirebaseUser(userCredential.user)
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    throw error
  }
}

// Inicio de sesión
export const loginUser = async (email: string, password: string) => {
  try {
    // Verificar si Firebase está configurado
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase no está correctamente configurado. Verifica las variables de entorno.")
    }

    // Obtener Auth con reintentos
    const auth = await getAuthWithRetries()
    if (!auth) {
      throw new Error("No se pudo inicializar Auth")
    }

    // Importar funciones de Auth bajo demanda
    const { signInWithEmailAndPassword } = await import("firebase/auth")

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return await mapFirebaseUser(userCredential.user)
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    throw error
  }
}

// Cierre de sesión
export const logoutUser = async () => {
  try {
    // Verificar si Firebase está configurado
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase no está correctamente configurado. Verifica las variables de entorno.")
    }

    // Obtener Auth con reintentos
    const auth = await getAuthWithRetries()
    if (!auth) {
      throw new Error("No se pudo inicializar Auth")
    }

    // Importar funciones de Auth bajo demanda
    const { signOut } = await import("firebase/auth")

    await signOut(auth)
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    throw error
  }
}

// Solicitar restablecimiento de contraseña
export const requestPasswordReset = async (email: string) => {
  try {
    // Verificar si Firebase está configurado
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase no está correctamente configurado. Verifica las variables de entorno.")
    }

    // Obtener Auth con reintentos
    const auth = await getAuthWithRetries()
    if (!auth) {
      throw new Error("No se pudo inicializar Auth")
    }

    // Importar funciones de Auth bajo demanda
    const { sendPasswordResetEmail } = await import("firebase/auth")

    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Error al solicitar restablecimiento de contraseña:", error)
    throw error
  }
}

// Confirmar restablecimiento de contraseña
export const confirmPasswordResetAction = async (code: string, newPassword: string) => {
  try {
    // Verificar si Firebase está configurado
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase no está correctamente configurado. Verifica las variables de entorno.")
    }

    // Obtener Auth con reintentos
    const auth = await getAuthWithRetries()
    if (!auth) {
      throw new Error("No se pudo inicializar Auth")
    }

    // Importar funciones de Auth bajo demanda
    const { confirmPasswordReset } = await import("firebase/auth")

    await confirmPasswordReset(auth, code, newPassword)
  } catch (error) {
    console.error("Error al confirmar restablecimiento de contraseña:", error)
    throw error
  }
}

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    // Verificar si Firebase está configurado
    if (!isFirebaseConfigured()) {
      console.warn("Firebase no está correctamente configurado. Verifica las variables de entorno.")
      return null
    }

    // Obtener Auth con reintentos (menos intentos para no bloquear)
    let auth
    try {
      auth = await getAuthWithRetries(2, 1000)
    } catch (error) {
      console.warn("No se pudo inicializar Auth para obtener usuario actual:", error)
      return null
    }

    if (!auth) {
      console.warn("No se pudo inicializar Auth para obtener usuario actual")
      return null
    }

    // Verificar si hay un usuario actual
    const currentUser = auth.currentUser
    if (currentUser) {
      return await mapFirebaseUser(currentUser)
    }

    // Si no hay usuario actual, intentar obtenerlo con onAuthStateChanged
    return new Promise((resolve) => {
      // Usar un timeout para evitar bloqueos
      const timeoutId = setTimeout(() => {
        console.warn("Auth state change listener timed out")
        resolve(null)
      }, 5000)

      try {
        // Importar onAuthStateChanged de manera dinámica
        import("firebase/auth")
          .then(({ onAuthStateChanged }) => {
            const unsubscribe = onAuthStateChanged(
              auth,
              async (firebaseUser) => {
                clearTimeout(timeoutId)
                unsubscribe()

                if (firebaseUser) {
                  try {
                    const user = await mapFirebaseUser(firebaseUser)
                    resolve(user)
                  } catch (error) {
                    console.error("Error mapping Firebase user:", error)
                    resolve(null)
                  }
                } else {
                  resolve(null)
                }
              },
              (error) => {
                clearTimeout(timeoutId)
                unsubscribe()
                console.error("Error in onAuthStateChanged:", error)
                resolve(null) // Resolver con null en caso de error
              },
            )
          })
          .catch((error) => {
            clearTimeout(timeoutId)
            console.error("Error importing onAuthStateChanged:", error)
            resolve(null) // Resolver con null en caso de error
          })
      } catch (error) {
        clearTimeout(timeoutId)
        console.error("Error setting up onAuthStateChanged:", error)
        resolve(null) // Resolver con null en caso de error
      }
    })
  } catch (error) {
    console.error("Error al obtener usuario actual:", error)
    return null
  }
}

