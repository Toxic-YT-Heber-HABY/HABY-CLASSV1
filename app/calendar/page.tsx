"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/sidebar"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClassStore } from "@/store/class-store"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { classes } = useClassStore()

  // Obtener todas las tareas de todas las clases
  const allAssignments = classes.flatMap((cls) =>
    (cls.assignments || []).map((assignment) => ({
      ...assignment,
      className: cls.name,
      classColor: cls.color,
    })),
  )

  // Filtrar tareas para la fecha seleccionada
  const assignmentsForSelectedDate = date
    ? allAssignments.filter(
        (assignment) => format(new Date(assignment.dueDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
      )
    : []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Calendario</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="p-4">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                      locale={es}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{date ? format(date, "PPPP", { locale: es }) : "Selecciona una fecha"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {assignmentsForSelectedDate.length > 0 ? (
                      <div className="space-y-4">
                        {assignmentsForSelectedDate.map((assignment) => (
                          <div
                            key={assignment.id}
                            className={`p-4 rounded-md border-l-4 border-${assignment.classColor}`}
                          >
                            <h3 className="font-medium">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground">{assignment.className}</p>
                            <p className="text-sm mt-2">{assignment.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-muted-foreground">
                                Entrega: {format(new Date(assignment.dueDate), "p", { locale: es })}
                              </span>
                              <span className="text-sm font-medium">{assignment.points} puntos</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No hay tareas para esta fecha</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

