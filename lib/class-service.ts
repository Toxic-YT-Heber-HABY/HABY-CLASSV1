import type { DocumentSnapshot } from "firebase/firestore"
import { getFirestore_safe } from "./firebase"
import { type Class, type Announcement, type Assignment, type User, UserRole } from "@/types"

/**
 * Servicio para gestionar clases utilizando Firestore
 * Proporciona métodos para crear, leer, actualizar y eliminar clases y sus componentes
 */

// Convertir documento de Firestore a objeto Class
const mapFirestoreClass = async (docId: string, data: any): Promise<Class> => {
  // Obtener Firestore bajo demanda
  const firestore = await getFirestore_safe()
  const { doc, getDoc } = await import("firebase/firestore")

  // Obtener profesor
  let teacher: User | undefined
  if (data.teacherId) {
    const teacherDoc = await getDoc(doc(firestore, "users", data.teacherId))
    if (teacherDoc.exists()) {
      const teacherData = teacherDoc.data()
      teacher = {
        id: teacherDoc.id,
        username: teacherData.username,
        email: teacherData.email,
        folio: teacherData.folio,
        curp: teacherData.curp,
        departments: teacherData.departments,
        role: teacherData.role as UserRole,
        subjects: teacherData.subjects,
        createdAt: teacherData.createdAt.toDate(),
        updatedAt: teacherData.updatedAt.toDate(),
      }
    }
  }

  return {
    id: docId,
    name: data.name,
    section: data.section,
    subject: data.subject,
    room: data.room,
    color: data.color,
    teacherId: data.teacherId,
    teacher,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

// Obtener todas las clases de un usuario
export const getUserClasses = async (userId: string, role: UserRole): Promise<Class[]> => {
  try {
    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore")

    let classesQuery

    if (role === UserRole.TEACHER) {
      // Si es profesor, obtener clases donde es el profesor
      classesQuery = query(
        collection(firestore, "classes"),
        where("teacherId", "==", userId),
        orderBy("createdAt", "desc"),
      )
    } else {
      // Si es estudiante, obtener clases donde está inscrito
      classesQuery = query(
        collection(firestore, "classes"),
        where("studentIds", "array-contains", userId),
        orderBy("createdAt", "desc"),
      )
    }

    const querySnapshot = await getDocs(classesQuery)
    const classes: Class[] = []

    for (const doc of querySnapshot.docs) {
      const classData = await mapFirestoreClass(doc.id, doc.data())
      classes.push(classData)
    }

    return classes
  } catch (error) {
    console.error("Error al obtener clases del usuario:", error)
    throw error
  }
}

// Obtener una clase por ID
export const getClassById = async (classId: string): Promise<Class | null> => {
  try {
    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    const { doc, getDoc } = await import("firebase/firestore")

    const classDoc = await getDoc(doc(firestore, "classes", classId))

    if (!classDoc.exists()) {
      return null
    }

    return await mapFirestoreClass(classDoc.id, classDoc.data())
  } catch (error) {
    console.error("Error al obtener clase por ID:", error)
    throw error
  }
}

// Crear una nueva clase
export const createClass = async (classData: {
  name: string
  section: string
  subject: string
  room: string
  color: string
  teacherId: string
}): Promise<Class> => {
  try {
    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    const { collection, addDoc, serverTimestamp, getDoc } = await import("firebase/firestore")

    const newClassRef = await addDoc(collection(firestore, "classes"), {
      ...classData,
      studentIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const newClassDoc = await getDoc(newClassRef)
    return await mapFirestoreClass(newClassRef.id, newClassDoc.data())
  } catch (error) {
    console.error("Error al crear clase:", error)
    throw error
  }
}

// Obtener anuncios de una clase
export const getClassAnnouncements = async (
  classId: string,
  lastDoc?: DocumentSnapshot,
  pageSize = 10,
): Promise<{ announcements: Announcement[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    const { collection, query, orderBy, startAfter, limit, getDocs } = await import("firebase/firestore")

    let announcementsQuery

    if (lastDoc) {
      // Paginación: obtener siguiente página
      announcementsQuery = query(
        collection(firestore, `classes/${classId}/announcements`),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize),
      )
    } else {
      // Primera página
      announcementsQuery = query(
        collection(firestore, `classes/${classId}/announcements`),
        orderBy("createdAt", "desc"),
        limit(pageSize),
      )
    }

    const querySnapshot = await getDocs(announcementsQuery)
    const announcements: Announcement[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      announcements.push({
        id: doc.id,
        classId,
        userId: data.userId,
        content: data.content,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      })
    })

    const newLastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null

    return { announcements, lastDoc: newLastDoc }
  } catch (error) {
    console.error("Error al obtener anuncios de la clase:", error)
    throw error
  }
}

// Crear un anuncio en una clase
export const createAnnouncement = async (classId: string, userId: string, content: string): Promise<Announcement> => {
  try {
    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    const { collection, addDoc, serverTimestamp, getDoc } = await import("firebase/firestore")

    const announcementRef = await addDoc(collection(firestore, `classes/${classId}/announcements`), {
      userId,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const announcementDoc = await getDoc(announcementRef)
    const data = announcementDoc.data()

    return {
      id: announcementRef.id,
      classId,
      userId,
      content,
      createdAt: data?.createdAt.toDate(),
      updatedAt: data?.updatedAt.toDate(),
    }
  } catch (error) {
    console.error("Error al crear anuncio:", error)
    throw error
  }
}

// Obtener tareas de una clase
export const getClassAssignments = async (
  classId: string,
  lastDoc?: DocumentSnapshot,
  pageSize = 10,
): Promise<{ assignments: Assignment[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    const { collection, query, orderBy, startAfter, limit, getDocs } = await import("firebase/firestore")

    let assignmentsQuery

    if (lastDoc) {
      // Paginación: obtener siguiente página
      assignmentsQuery = query(
        collection(firestore, `classes/${classId}/assignments`),
        orderBy("dueDate", "asc"),
        startAfter(lastDoc),
        limit(pageSize),
      )
    } else {
      // Primera página
      assignmentsQuery = query(
        collection(firestore, `classes/${classId}/assignments`),
        orderBy("dueDate", "asc"),
        limit(pageSize),
      )
    }

    const querySnapshot = await getDocs(assignmentsQuery)
    const assignments: Assignment[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      assignments.push({
        id: doc.id,
        classId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate.toDate(),
        points: data.points,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      })
    })

    const newLastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null

    return { assignments, lastDoc: newLastDoc }
  } catch (error) {
    console.error("Error al obtener tareas de la clase:", error)
    throw error
  }
}

// Crear una tarea en una clase
export const createAssignment = async (
  classId: string,
  assignmentData: {
    title: string
    description: string
    dueDate: Date
    points: number
  },
): Promise<Assignment> => {
  try {
    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    const { collection, addDoc, serverTimestamp, getDoc, Timestamp } = await import("firebase/firestore")

    const assignmentRef = await addDoc(collection(firestore, `classes/${classId}/assignments`), {
      ...assignmentData,
      dueDate: Timestamp.fromDate(assignmentData.dueDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const assignmentDoc = await getDoc(assignmentRef)
    const data = assignmentDoc.data()

    return {
      id: assignmentRef.id,
      classId,
      title: assignmentData.title,
      description: assignmentData.description,
      dueDate: assignmentData.dueDate,
      points: assignmentData.points,
      createdAt: data?.createdAt.toDate(),
      updatedAt: data?.updatedAt.toDate(),
    }
  } catch (error) {
    console.error("Error al crear tarea:", error)
    throw error
  }
}

// Obtener estudiantes de una clase
export const getClassStudents = async (classId: string): Promise<User[]> => {
  try {
    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    const { doc, getDoc, collection, query, where, getDocs } = await import("firebase/firestore")

    // Primero obtenemos la clase para conseguir los IDs de los estudiantes
    const classDoc = await getDoc(doc(firestore, "classes", classId))

    if (!classDoc.exists()) {
      throw new Error("Clase no encontrada")
    }

    const classData = classDoc.data()
    const studentIds = classData.studentIds || []

    if (studentIds.length === 0) {
      return []
    }

    // Obtenemos los documentos de los estudiantes
    const students: User[] = []

    // Procesamos en lotes de 10 para evitar limitaciones de Firestore
    for (let i = 0; i < studentIds.length; i += 10) {
      const batch = studentIds.slice(i, i + 10)
      const studentsQuery = query(collection(firestore, "users"), where("__name__", "in", batch))

      const querySnapshot = await getDocs(studentsQuery)

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        students.push({
          id: doc.id,
          username: data.username,
          email: data.email,
          folio: data.folio,
          curp: data.curp,
          departments: data.departments,
          role: data.role as UserRole,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        })
      })
    }

    return students
  } catch (error) {
    console.error("Error al obtener estudiantes de la clase:", error)
    throw error
  }
}

// Inscribir estudiante en una clase
export const enrollStudentInClass = async (classId: string, studentId: string): Promise<void> => {
  try {
    // Obtener Firestore bajo demanda
    const firestore = await getFirestore_safe()
    const { doc, updateDoc, serverTimestamp, arrayUnion } = await import("firebase/firestore")

    const classRef = doc(firestore, "classes", classId)

    // Actualizar la clase para añadir el estudiante
    await updateDoc(classRef, {
      studentIds: arrayUnion(studentId),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error al inscribir estudiante en la clase:", error)
    throw error
  }
}

