"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/sidebar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Centro de Ayuda</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Guías de Uso</h2>
                    <p className="text-muted-foreground">
                      Aprende a utilizar todas las funciones de HABY con nuestras guías detalladas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Preguntas Frecuentes</h2>
                    <p className="text-muted-foreground">
                      Encuentra respuestas a las preguntas más comunes sobre nuestra plataforma.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Soporte Técnico</h2>
                    <p className="text-muted-foreground">
                      ¿Tienes problemas técnicos? Nuestro equipo de soporte está aquí para ayudarte.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Preguntas Frecuentes</h2>

            <Accordion type="single" collapsible className="mb-8">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Cómo puedo crear una clase?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Para crear una clase, debes tener una cuenta de profesor. Una vez que hayas iniciado sesión, ve a la
                    página de inicio y haz clic en el botón "Crear clase". Completa la información requerida como nombre
                    de la clase, sección, materia y aula. Finalmente, haz clic en "Crear" para crear tu clase.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>¿Cómo puedo unirme a una clase?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Para unirte a una clase, necesitas el código de la clase que te proporcionará tu profesor. Ve a la
                    página de inicio y haz clic en el botón "Unirse a clase". Ingresa el código de la clase y haz clic
                    en "Unirse".
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>¿Cómo puedo crear una tarea?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Para crear una tarea, debes ser profesor de una clase. Ve a la página de la clase y selecciona la
                    pestaña "Trabajo de clase". Haz clic en el botón "Crear tarea" y completa la información requerida
                    como título, descripción, fecha de entrega y puntos. Finalmente, haz clic en "Crear tarea".
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>¿Cómo puedo entregar una tarea?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Para entregar una tarea, ve a la página de la clase y selecciona la pestaña "Trabajo de clase".
                    Encuentra la tarea que deseas entregar y haz clic en ella. En la página de la tarea, haz clic en el
                    botón "Entregar" y sigue las instrucciones para adjuntar tu trabajo.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>¿Cómo puedo cambiar mi contraseña?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Para cambiar tu contraseña, ve a la página de configuración de tu cuenta. Haz clic en tu perfil en
                    la esquina superior derecha y selecciona "Configuración". En la sección de seguridad, haz clic en
                    "Cambiar contraseña" y sigue las instrucciones.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <h2 className="text-2xl font-semibold mb-4">Contacto de Soporte</h2>

            <p className="mb-4">
              Si no encuentras la respuesta a tu pregunta, no dudes en contactar a nuestro equipo de soporte:
            </p>

            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>Email: soporte@haby.edu.mx</li>
              <li>Teléfono: +52 (55) 5622-5678</li>
              <li>Horario de atención: Lunes a Viernes, 9:00 AM - 6:00 PM</li>
            </ul>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

