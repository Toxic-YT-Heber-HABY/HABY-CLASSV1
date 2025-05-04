"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/sidebar"
import { useAuthStore } from "@/store/auth-store"
import Link from "next/link"

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg mb-4">
                En HABY, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política de privacidad
                describe cómo recopilamos, usamos y protegemos su información personal.
              </p>

              {/* Contenido simplificado para usuarios no autenticados */}
              <h2 className="text-2xl font-semibold mt-8 mb-4">Información que Recopilamos</h2>
              <p>
                Recopilamos información personal como su nombre, dirección de correo electrónico, folio y CURP cuando se
                registra en nuestra plataforma.
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
            <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg mb-4">
                En HABY, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política de privacidad
                describe cómo recopilamos, usamos y protegemos su información personal.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Información que Recopilamos</h2>
              <p>
                Recopilamos información personal como su nombre, dirección de correo electrónico, folio y CURP cuando se
                registra en nuestra plataforma. También podemos recopilar información sobre su uso de la plataforma para
                mejorar nuestros servicios.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Cómo Usamos su Información</h2>
              <p>Usamos su información personal para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar y mantener nuestros servicios</li>
                <li>Mejorar, personalizar y ampliar nuestros servicios</li>
                <li>Comunicarnos con usted sobre actualizaciones o cambios en nuestros servicios</li>
                <li>Proporcionar soporte al cliente</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Protección de Datos</h2>
              <p>
                Implementamos medidas de seguridad para proteger su información personal contra acceso no autorizado,
                alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet o método
                de almacenamiento electrónico es 100% seguro.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Cambios a esta Política</h2>
              <p>
                Podemos actualizar nuestra política de privacidad de vez en cuando. Le notificaremos cualquier cambio
                publicando la nueva política de privacidad en esta página.
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

