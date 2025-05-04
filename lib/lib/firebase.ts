// Enfoque simplificado para la inicialización de Firebase
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Valores predeterminados para desarrollo (solo usar en desarrollo)
const defaultConfig = {
  apiKey: "AIzaSyCle9zZdK-aNxWaFrXL6VaatPvj7eVPijQ",
  authDomain: "haby-platform.firebaseapp.com",
  projectId: "haby-platform",
  storageBucket: "haby-platform.firebasestorage.app",
  messagingSenderId: "541451105249",
  appId: "1:541451105249:web:78f3c77c9375266c5c98a0",
  databaseURL: "https://haby-platform-default-rtdb.firebaseio.com/",
}

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultConfig.appId,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || defaultConfig.databaseURL,
}

// Variables para almacenar las instancias
let firebaseApp = null
let authInstance = null
let firestoreInstance = null
let isFirestoreAvailable = false

// Función para verificar si Firebase está configurado
export function isFirebaseConfigured() {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain)
}

// Inicializar Firebase de manera segura
export function initializeFirebase() {
  if (!isBrowser) {
    console.log("Firebase cannot be initialized in server environment")
    return { app: null, initialized: false }
  }

  if (!isFirebaseConfigured()) {
    console.warn("Firebase configuration is missing or incomplete")
    return { app: null, initialized: false }
  }

  try {
    // Si ya tenemos una instancia, devolverla
    if (firebaseApp) {
      return { app: firebaseApp, initialized: true }
    }

    // Crear nueva instancia
    console.log("Initializing new Firebase app")
    firebaseApp = initializeApp(firebaseConfig)
    return { app: firebaseApp, initialized: true }
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
    return { app: null, initialized: false, error }
  }
}

// Obtener Auth de manera segura
export function getAuth_direct() {
  if (!isBrowser) {
    console.log("Auth cannot be initialized in server environment")
    return null
  }

  try {
    // Si ya tenemos una instancia, devolverla
    if (authInstance) {
      return authInstance
    }

    // Inicializar Firebase si no está inicializado
    const { app, initialized } = initializeFirebase()
    if (!initialized || !app) {
      console.error("Cannot initialize Auth: Firebase app initialization failed")
      return null
    }

    // Inicializar Auth
    console.log("Initializing Firebase Auth")
    authInstance = getAuth(app)
    return authInstance
  } catch (error) {
    console.error("Error initializing Auth:", error)
    return null
  }
}

// Obtener Auth de manera segura (para compatibilidad)
export async function getAuth_safe() {
  return getAuth_direct()
}

// Verificar si Firestore está disponible
export async function checkFirestoreAvailability() {
  if (!isBrowser) {
    return false
  }

  try {
    // Si ya sabemos que está disponible, devolver true
    if (isFirestoreAvailable && firestoreInstance) {
      return true
    }

    // Inicializar Firebase si no está inicializado
    const { app, initialized } = initializeFirebase()
    if (!initialized || !app) {
      return false
    }

    // Intentar inicializar Firestore
    firestoreInstance = getFirestore(app)
    isFirestoreAvailable = true
    return true
  } catch (error) {
    console.warn("Firestore is not available:", error)
    isFirestoreAvailable = false
    return false
  }
}

// Obtener Firestore de manera segura
export async function getFirestore_safe() {
  if (!isBrowser) {
    return null
  }

  try {
    // Verificar disponibilidad
    const available = await checkFirestoreAvailability()
    if (!available) {
      return null
    }

    return firestoreInstance
  } catch (error) {
    console.error("Error getting Firestore:", error)
    return null
  }
}

// Función para verificar si Firestore está disponible
export function isFirestoreAvailableSync() {
  return isFirestoreAvailable && isBrowser
}

// Inicializar Firebase manualmente (para uso en componentes)
export async function initializeFirebaseManually() {
  if (!isBrowser) {
    return {
      initialized: false,
      error: "Cannot initialize Firebase in server environment",
      auth: null,
      firestore: null,
      firestoreAvailable: false,
    }
  }

  try {
    // Inicializar Firebase App
    const { app, initialized } = initializeFirebase()
    if (!initialized || !app) {
      throw new Error("Failed to initialize Firebase app")
    }

    // Inicializar Auth
    const auth = getAuth_direct()
    if (!auth) {
      throw new Error("Failed to initialize Auth")
    }

    // Verificar si Firestore está disponible
    const firestoreAvailable = await checkFirestoreAvailability()
    const firestore = firestoreAvailable ? firestoreInstance : null

    return {
      app,
      auth,
      firestore,
      initialized: true,
      firestoreAvailable,
    }
  } catch (error) {
    console.error("Error in Firebase initialization:", error)
    return {
      app: null,
      auth: null,
      firestore: null,
      initialized: false,
      firestoreAvailable: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Inicializar Firebase inmediatamente si estamos en el navegador
if (isBrowser) {
  console.log("Initializing Firebase automatically on module load")
  initializeFirebase()
  getAuth_direct()
}

