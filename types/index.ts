/**
 * Definición de tipos y interfaces del sistema
 *
 * Este archivo contiene todas las definiciones de tipos
 * necesarias para la tipificación estática de la aplicación.
 * Sirve como punto central para todas las interfaces y tipos.
 */

// Roles de usuario del sistema
/**
 * Enum que define los roles de usuario disponibles en el sistema
 * - STUDENT: Estudiantes que pueden inscribirse a clases y entregar tareas
 * - TEACHER: Profesores que pueden crear y gestionar clases
 * - ADMIN: Administradores del sistema con privilegios completos
 */
export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

// Materias disponibles en el sistema
/**
 * Enum que define las materias disponibles en el sistema
 * Estas materias son utilizadas para categorizar las clases
 * y para asignar especialidades a los profesores
 */
export enum Subject {
  SOCIAL_SCIENCES = "CIENCIAS SOCIALES",
  ENGLISH = "ENGLISH",
  CHEMICAL_REACTIONS = "REACCIONES QUÍMICAS",
  ORIENTATION = "Orientación",
  HISTORICAL_CONSCIOUSNESS = "Conciencia Histórica",
  SELECTED_MATH_TOPICS = "TEMAS SELECTOS DE MATEMATICAS",
  PROGRAMMING = "Programación",
}

/**
 * Interfaz que define la estructura de un usuario en el sistema
 * Contiene toda la información personal y de autenticación
 */
export interface User {
  id: string // Identificador único del usuario
  username: string // Nombre de usuario para login
  email: string // Correo electrónico
  folio: string // Folio institucional
  curp: string // CURP (Clave Única de Registro de Población)
  departments: string[] // Departamentos a los que pertenece
  role: UserRole // Rol en el sistema (estudiante, profesor, admin)
  subjects?: Subject[] // Materias que enseña (solo para profesores)
  createdAt: Date // Fecha de creación del usuario
  updatedAt: Date // Fecha de última actualización
}

/**
 * Interfaz que define la estructura de una clase
 * Contiene la información básica y referencias a elementos relacionados
 */
export interface Class {
  id: string // Identificador único de la clase
  name: string // Nombre de la clase
  section: string // Sección o grupo
  subject: string // Materia de la clase
  room: string // Aula o salón
  color: string // Color para identificación visual
  teacherId: string // ID del profesor que imparte la clase
  teacher?: User // Referencia al profesor
  students?: User[] // Estudiantes inscritos
  announcements?: Announcement[] // Anuncios de la clase
  assignments?: Assignment[] // Tareas asignadas
  createdAt: Date // Fecha de creación
  updatedAt: Date // Fecha de última actualización
}

// Tipos para anuncios
export interface Announcement {
  id: string
  classId: string
  userId: string
  content: string
  attachments?: Attachment[]
  comments?: Comment[]
  createdAt: Date
  updatedAt: Date
}

// Tipos para tareas
export interface Assignment {
  id: string
  classId: string
  title: string
  description: string
  dueDate: Date
  points: number
  attachments?: Attachment[]
  submissions?: Submission[]
  createdAt: Date
  updatedAt: Date
}

// Tipos para entregas
export interface Submission {
  id: string
  assignmentId: string
  userId: string
  content: string
  attachments?: Attachment[]
  grade?: number
  comments?: Comment[]
  submittedAt: Date
  updatedAt: Date
}

// Tipos para comentarios
export interface Comment {
  id: string
  parentId: string // ID del anuncio o tarea
  parentType: "announcement" | "submission"
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// Tipos para archivos adjuntos
export interface Attachment {
  id: string
  parentId: string // ID del anuncio, tarea o entrega
  parentType: "announcement" | "assignment" | "submission"
  name: string
  type: string
  url: string
  size: number
  createdAt: Date
}

