"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/sidebar"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>

            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg mb-4">
                Estos Términos y Condiciones rigen el uso de la plataforma educativa HABY. Al acceder o utilizar
                nuestros servicios, usted acepta estar sujeto a estos términos.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Uso de la Plataforma</h2>
              <p>
                HABY es una plataforma educativa diseñada para facilitar la gestión de clases, tareas y comunicación
                entre profesores y alumnos. Usted se compromete a utilizar la plataforma de manera responsable y de
                acuerdo con todas las leyes y regulaciones aplicables.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Cuentas de Usuario</h2>
              <p>
                Para utilizar HABY, debe crear una cuenta. Usted es responsable de mantener la confidencialidad de su
                información de cuenta y de todas las actividades que ocurran bajo su cuenta.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Contenido del Usuario</h2>
              <p>
                Usted es responsable de todo el contenido que publique en HABY. No debe publicar contenido que sea
                ilegal, ofensivo, difamatorio o que infrinja los derechos de propiedad intelectual de terceros.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Propiedad Intelectual</h2>
              <p>
                HABY y su contenido, características y funcionalidad son propiedad de HABY y están protegidos por leyes
                de propiedad intelectual. No debe reproducir, distribuir, modificar, crear obras derivadas, mostrar
                públicamente, realizar públicamente, republicar, descargar, almacenar o transmitir cualquier material de
                nuestra plataforma sin nuestro consentimiento expreso por escrito.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Limitación de Responsabilidad</h2>
              <p>
                En ningún caso HABY, sus directores, empleados, socios, agentes, proveedores o afiliados serán
                responsables por cualquier daño indirecto, incidental, especial, consecuente o punitivo, incluyendo sin
                limitación, pérdida de beneficios, datos, uso, buena voluntad, u otras pérdidas intangibles, resultantes
                de su acceso o uso o incapacidad para acceder o usar la plataforma.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cambios a estos Términos</h2>
              <p>
                Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos términos en
                cualquier momento. Si una revisión es material, intentaremos proporcionar al menos 30 días de aviso
                antes de que los nuevos términos entren en vigencia.
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

