import { create } from "zustand"
import type { Class, Announcement, Assignment } from "@/types"
import {
  getUserClasses,
  getClassById,
  getClassAnnouncements,
  createAnnouncement,
  getClassAssignments,
  createAssignment,
} from "@/lib/class-service"
import type { DocumentSnapshot } from "firebase/firestore"

/**
 * Class Store - Gestiona el estado global de las clases y cursos
 *
 * Este store maneja:
 * - Lista de clases disponibles
 * - Clase seleccionada actualmente
 * - Operaciones CRUD para clases, anuncios y tareas
 *
 * Ahora utiliza Firestore para persistencia de datos
 */

interface ClassState {
  classes: Class[] // Lista de todas las clases disponibles
  currentClass: Class | null // Clase seleccionada actualmente
  isLoading: boolean // Estado de carga durante operaciones asíncronas
  error: string | null // Mensaje de error si la operación falla

  // Anuncios y paginación
  announcements: Announcement[]
  lastAnnouncementDoc: DocumentSnapshot | null
  loadingAnnouncements: boolean

  // Tareas y paginación
  assignments: Assignment[]
  lastAssignmentDoc: DocumentSnapshot | null
  loadingAssignments: boolean

  // Métodos
  fetchClasses: () => Promise<void> // Obtiene todas las clases disponibles
  fetchClassById: (id: string) => Promise<void> // Obtiene una clase específica por ID
  createAnnouncement: (classId: string, content: string) => Promise<void> // Crea un anuncio en una clase
  createAssignment: (classId: string, assignment: Partial<Assignment>) => Promise<void> // Crea una tarea en una clase

  // Métodos de paginación
  fetchMoreAnnouncements: (classId: string) => Promise<void> // Carga más anuncios (paginación)
  fetchMoreAssignments: (classId: string) => Promise<void> // Carga más tareas (paginación)
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: [],
  currentClass: null,
  isLoading: false,
  error: null,

  // Estado para anuncios
  announcements: [],
  lastAnnouncementDoc: null,
  loadingAnnouncements: false,

  // Estado para tareas
  assignments: [],
  lastAssignmentDoc: null,
  loadingAssignments: false,

  fetchClasses: async () => {
    set({ isLoading: true, error: null })

    try {
      // Obtener el usuario actual del store de autenticación
      const authStore = await import("@/store/auth-store").then((mod) => mod.useAuthStore.getState())

      if (!authStore.user) {
        throw new Error("Usuario no autenticado")
      }

      const classes = await getUserClasses(authStore.user.id, authStore.user.role)

      set({
        classes,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error desconocido",
        isLoading: false,
      })
    }
  },

  fetchClassById: async (id) => {
    set({
      isLoading: true,
      error: null,
      announcements: [],
      assignments: [],
      lastAnnouncementDoc: null,
      lastAssignmentDoc: null,
    })

    try {
      // Obtener la clase
      const classData = await getClassById(id)

      if (!classData) {
        throw new Error("Clase no encontrada")
      }

      // Obtener anuncios iniciales
      const { announcements, lastDoc: lastAnnouncementDoc } = await getClassAnnouncements(id)

      // Obtener tareas iniciales
      const { assignments, lastDoc: lastAssignmentDoc } = await getClassAssignments(id)

      set({
        currentClass: classData,
        announcements,
        assignments,
        lastAnnouncementDoc,
        lastAssignmentDoc,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error desconocido",
        isLoading: false,
      })
    }
  },

  createAnnouncement: async (classId, content) => {
    set({ loadingAnnouncements: true, error: null })

    try {
      // Obtener el usuario actual del store de autenticación
      const authStore = await import("@/store/auth-store").then((mod) => mod.useAuthStore.getState())

      if (!authStore.user) {
        throw new Error("Usuario no autenticado")
      }

      // Crear anuncio
      const newAnnouncement = await createAnnouncement(classId, authStore.user.id, content)

      // Actualizar estado
      set((state) => ({
        announcements: [newAnnouncement, ...state.announcements],
        loadingAnnouncements: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error desconocido",
        loadingAnnouncements: false,
      })
    }
  },

  createAssignment: async (classId, assignmentData) => {
    set({ loadingAssignments: true, error: null })

    try {
      // Validar datos
      if (!assignmentData.title || !assignmentData.dueDate) {
        throw new Error("Faltan datos requeridos para la tarea")
      }

      // Crear tarea
      const newAssignment = await createAssignment(classId, {
        title: assignmentData.title || "",
        description: assignmentData.description || "",
        dueDate: assignmentData.dueDate || new Date(),
        points: assignmentData.points || 100,
      })

      // Actualizar estado
      set((state) => ({
        assignments: [...state.assignments, newAssignment],
        loadingAssignments: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error desconocido",
        loadingAssignments: false,
      })
    }
  },

  fetchMoreAnnouncements: async (classId) => {
    const { lastAnnouncementDoc, loadingAnnouncements } = get()

    // Evitar múltiples solicitudes simultáneas
    if (loadingAnnouncements || !lastAnnouncementDoc) {
      return
    }

    set({ loadingAnnouncements: true })

    try {
      const { announcements: newAnnouncements, lastDoc } = await getClassAnnouncements(classId, lastAnnouncementDoc)

      set((state) => ({
        announcements: [...state.announcements, ...newAnnouncements],
        lastAnnouncementDoc: lastDoc,
        loadingAnnouncements: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error desconocido",
        loadingAnnouncements: false,
      })
    }
  },

  fetchMoreAssignments: async (classId) => {
    const { lastAssignmentDoc, loadingAssignments } = get()

    // Evitar múltiples solicitudes simultáneas
    if (loadingAssignments || !lastAssignmentDoc) {
      return
    }

    set({ loadingAssignments: true })

    try {
      const { assignments: newAssignments, lastDoc } = await getClassAssignments(classId, lastAssignmentDoc)

      set((state) => ({
        assignments: [...state.assignments, ...newAssignments],
        lastAssignmentDoc: lastDoc,
        loadingAssignments: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error desconocido",
        loadingAssignments: false,
      })
    }
  },
}))

