"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/sidebar"
import { useAuthStore } from "@/store/auth-store"
import Link from "next/link"

export default function AboutPage() {
  const { isAuthenticated } = useAuthStore()

  // Si el usuario no está autenticado, mostrar una versión simplificada
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              HABY
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium hover:underline">
                Iniciar sesión
              </Link>
              <Link href="/register" className="text-sm font-medium hover:underline">
                Registrarse
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Acerca de HABY</h1>

            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg mb-4">
                HABY es una plataforma educativa inspirada en Google Classroom, diseñada para facilitar la gestión de
                clases, tareas y comunicación entre profesores y alumnos.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Nuestra Misión</h2>
              <p>
                Nuestra misión es proporcionar una herramienta educativa accesible y fácil de usar que mejore la
                experiencia de enseñanza y aprendizaje para profesores y alumnos.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Fundador</h2>
              <p>
                HABY fue fundada por Heber Zadkiel Garcia Perez, con la visión de crear una plataforma educativa que
                combine la simplicidad con la funcionalidad.
              </p>

              <div className="mt-8 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Iniciar sesión para acceder a todas las funciones
                </Link>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t bg-background py-6">
          <div className="container px-4 md:px-6 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} HABY. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  // Versión para usuarios autenticados
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Acerca de HABY</h1>

            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg mb-4">
                HABY es una plataforma educativa inspirada en Google Classroom, diseñada para facilitar la gestión de
                clases, tareas y comunicación entre profesores y alumnos.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Nuestra Misión</h2>
              <p>
                Nuestra misión es proporcionar una herramienta educativa accesible y fácil de usar que mejore la
                experiencia de enseñanza y aprendizaje para profesores y alumnos.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Fundador</h2>
              <p>
                HABY fue fundada por Heber Zadkiel Garcia Perez, con la visión de crear una plataforma educativa que
                combine la simplicidad con la funcionalidad.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Características Principales</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestión de clases y tareas</li>
                <li>Comunicación efectiva entre profesores y alumnos</li>
                <li>Interfaz intuitiva y fácil de usar</li>
                <li>Soporte para múltiples idiomas</li>
                <li>Diseño adaptable a diferentes dispositivos</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

