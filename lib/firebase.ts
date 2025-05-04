// Enfoque ultra simplificado para la inicialización de Firebase
import { initializeApp } from "firebase/app"
// NO importamos getAuth aquí para evitar inicialización prematura

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCle9zZdK-aNxWaFrXL6VaatPvj7eVPijQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "haby-platform.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "haby-platform",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "haby-platform.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "541451105249",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:541451105249:web:78f3c77c9375266c5c98a0",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://haby-platform-default-rtdb.firebaseio.com/",
}

// Variables globales para almacenar las instancias
let firebaseApp = null
let auth = null
let firestore = null
let firestoreAvailable = false

// Función para verificar si Firebase está configurado
export function isFirebaseConfigured() {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain)
}

// Inicializar Firebase de manera síncrona, pero NO Auth
if (isBrowser && isFirebaseConfigured()) {
  try {
    console.log("Initializing Firebase app...")
    firebaseApp = initializeApp(firebaseConfig)
    console.log("Firebase app initialized successfully")
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
  }
}

// Función para inicializar Auth de manera segura
export async function initializeAuth() {
  // Si no estamos en el navegador o no hay app, no podemos inicializar Auth
  if (!isBrowser || !firebaseApp) {
    console.log("Cannot initialize Auth: Browser or Firebase app not available")
    return null
  }

  // Si Auth ya está inicializado, devolverlo directamente
  if (auth) {
    return auth
  }

  try {
    console.log("Initializing Auth...")

    // Esperar un poco para asegurarnos de que Firebase esté completamente inicializado
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Importar getAuth dinámicamente para evitar problemas de inicialización
    const { getAuth } = await import("firebase/auth")

    // Inicializar Auth
    auth = getAuth(firebaseApp)
    console.log("Auth initialized successfully")
    return auth
  } catch (error) {
    console.error("Error initializing Auth:", error)
    return null
  }
}

// Funciones de acceso simplificadas
export function getFirebaseApp() {
  return firebaseApp
}

export function getAuth_direct() {
  return auth
}

export async function getAuth_safe() {
  return await initializeAuth()
}

// Función para inicializar Firestore
export async function initializeFirestore() {
  if (!isBrowser || !firebaseApp) {
    console.log("Cannot initialize Firestore: Browser or Firebase app not available")
    return null
  }

  if (firestore) {
    return firestore
  }

  try {
    console.log("Initializing Firestore...")
    const { getFirestore } = await import("firebase/firestore")
    firestore = getFirestore(firebaseApp)
    firestoreAvailable = true
    console.log("Firestore initialized successfully")
    return firestore
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    firestoreAvailable = false
    return null
  }
}

export function isFirestoreAvailableSync() {
  return firestoreAvailable
}

export async function getFirestore_safe() {
  if (firestore) {
    return firestore
  }
  return await initializeFirestore()
}

export async function checkFirestoreAvailability() {
  if (firestore) {
    return true
  }
  const fs = await initializeFirestore()
  return !!fs
}

// Función para inicializar manualmente (para compatibilidad)
export async function initializeFirebaseManually() {
  if (!firebaseApp) {
    console.log("Firebase app not initialized")
    return {
      app: null,
      auth: null,
      firestore: null,
      initialized: false,
      firestoreAvailable: false,
      error: "Firebase app not initialized",
    }
  }

  // Inicializar Auth
  const authInstance = await initializeAuth()

  // Inicializar Firestore
  const firestoreInstance = await initializeFirestore()

  return {
    app: firebaseApp,
    auth: authInstance,
    firestore: firestoreInstance,
    initialized: !!firebaseApp,
    firestoreAvailable: !!firestoreInstance,
    error: !firebaseApp ? "Firebase initialization failed" : null,
  }
}

// Alias para compatibilidad
export const initializeFirebase = () => ({
  app: firebaseApp,
  initialized: !!firebaseApp,
})

