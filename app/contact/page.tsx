"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MathCaptcha } from "@/components/captcha"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCaptchaValid) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulación de envío de formulario
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mostrar mensaje de éxito
      setSuccessMessage("Tu mensaje ha sido enviado. Te contactaremos pronto.")

      // Limpiar formulario
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      setIsCaptchaValid(false)
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Contacto</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Ponte en contacto con nosotros</h2>
                <p className="text-muted-foreground mb-6">
                  ¿Tienes alguna pregunta o comentario? Completa el formulario y nos pondremos en contacto contigo lo
                  antes posible.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">contacto@haby.edu.mx</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Dirección</h3>
                      <p className="text-sm text-muted-foreground">
                        Av. Universidad 3000, Ciudad Universitaria, Coyoacán, 04510 Ciudad de México, CDMX
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Teléfono</h3>
                      <p className="text-sm text-muted-foreground">+52 (55) 5622-1234</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Card>
                  <CardContent className="p-6">
                    {successMessage ? (
                      <Alert className="mb-4">
                        <AlertDescription>{successMessage}</AlertDescription>
                      </Alert>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Correo electrónico</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Asunto</Label>
                          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Mensaje</Label>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            required
                          />
                        </div>

                        <MathCaptcha onVerify={setIsCaptchaValid} />

                        <Button type="submit" className="w-full" disabled={isSubmitting || !isCaptchaValid}>
                          {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                        </Button>
                      </form>
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

