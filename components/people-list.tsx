"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getClassStudents } from "@/lib/class-service"
import { Loader2 } from "lucide-react"

interface PeopleListProps {
  classId: string
}

export function PeopleList({ classId }: PeopleListProps) {
  const [teacher, setTeacher] = useState<User | null>(null)
  const [students, setStudents] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar personas de la clase
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setIsLoading(true)

        // Obtener la clase actual del store
        const classStore = await import("@/store/class-store").then((mod) => mod.useClassStore.getState())
        const currentClass = classStore.currentClass

        if (!currentClass) {
          throw new Error("Clase no encontrada")
        }

        // Establecer el profesor
        if (currentClass.teacher) {
          setTeacher(currentClass.teacher)
        }

        // Obtener estudiantes
        const studentsList = await getClassStudents(classId)
        setStudents(studentsList)
      } catch (error) {
        console.error("Error al cargar personas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPeople()
  }, [classId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando personas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profesor</CardTitle>
        </CardHeader>
        <CardContent>
          {teacher ? (
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{teacher.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{teacher.username}</p>
                <p className="text-sm text-muted-foreground">{teacher.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No hay profesor asignado</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estudiantes ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground">No hay estudiantes inscritos</p>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{student.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.username}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

