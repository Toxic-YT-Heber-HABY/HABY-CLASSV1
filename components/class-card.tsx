import Link from "next/link"
import type { Class } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { memo } from "react"

interface ClassCardProps {
  classData: Class
}

/**
 * ClassCard - Componente para mostrar una tarjeta de clase
 *
 * Este componente está optimizado con memo para evitar re-renderizados innecesarios
 * cuando las propiedades no cambian.
 */
function ClassCardComponent({ classData }: ClassCardProps) {
  // Contar tareas pendientes
  const pendingAssignments =
    classData.assignments?.filter((assignment) => new Date(assignment.dueDate) > new Date()).length || 0

  return (
    <Link href={`/class/${classData.id}`}>
      <Card className={`h-full overflow-hidden hover:shadow-md transition-shadow border-t-4 border-${classData.color}`}>
        <CardContent className="p-6">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{classData.name}</h3>
            <p className="text-sm text-muted-foreground">{classData.subject}</p>
            <p className="text-sm text-muted-foreground">
              Sección: {classData.section} • Aula: {classData.room}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{classData.announcements?.length || 0} anuncios</div>
          {pendingAssignments > 0 && (
            <Badge variant="secondary">
              {pendingAssignments} {pendingAssignments === 1 ? "tarea pendiente" : "tareas pendientes"}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}

// Exportar componente memorizado para evitar re-renderizados innecesarios
export const ClassCard = memo(ClassCardComponent)

// Exportación por defecto para compatibilidad con dynamic import
export default { ClassCard }

