"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MathCaptcha } from "@/components/captcha"
import { useAuthStore } from "@/store/auth-store"
import { PasswordInput } from "@/components/password-input"
import { Logo } from "@/components/logo"
import { Footer } from "@/components/footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector, useLanguageStore } from "@/components/language-selector"
import { toast } from "@/components/ui/use-toast"

// Traducciones
const translations = {
  es: {
    title: "Recuperar contraseña",
    requestDescription: "Ingresa tu nombre de usuario y correo para recuperar tu contraseña",
    verifyDescription: "Ingresa el código de 4 dígitos enviado a tu correo",
    resetDescription: "Establece tu nueva contraseña",
    username: "Nombre de usuario",
    email: "Correo electrónico",
    verificationCode: "Código de verificación",
    newPassword: "Escriba Su Nueva Contraseña",
    confirmPassword: "Reescriba Su Nueva Contraseña",
    sendCode: "Enviar código",
    sending: "Enviando...",
    verifyCode: "Verificar código",
    verifying: "Verificando...",
    updatePassword: "Actualizar contraseña",
    updating: "Actualizando...",
    back: "Volver",
    login: "Iniciar sesión",
    createAccount: "Crear cuenta",
    backToLogin: "Volver al inicio de sesión",
    codeSent: "Se ha enviado un código a tu correo electrónico",
    codeVerified: "Código verificado correctamente. Ahora puedes establecer tu nueva contraseña.",
    passwordUpdated: "Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...",
    userNotFound: "Usuario o email no encontrado",
    invalidCode: "Código inválido",
    unknownError: "Error desconocido",
    allFieldsRequired: "Todos los campos son requeridos",
    passwordRequired: "La contraseña debe tener al menos 8 caracteres",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
  },
  en: {
    title: "Recover password",
    requestDescription: "Enter your username and email to recover your password",
    verifyDescription: "Enter the 4-digit code sent to your email",
    resetDescription: "Set your new password",
    username: "Username",
    email: "Email",
    verificationCode: "Verification code",
    newPassword: "Enter Your New Password",
    confirmPassword: "Confirm Your New Password",
    sendCode: "Send code",
    sending: "Sending...",
    verifyCode: "Verify code",
    verifying: "Verifying...",
    updatePassword: "Update password",
    updating: "Updating...",
    back: "Back",
    login: "Log in",
    createAccount: "Create account",
    backToLogin: "Back to login",
    codeSent: "A code has been sent to your email",
    codeVerified: "Code verified successfully. Now you can set your new password.",
    passwordUpdated: "Password updated successfully. Redirecting to login...",
    userNotFound: "User or email not found",
    invalidCode: "Invalid code",
    unknownError: "Unknown error",
    allFieldsRequired: "All fields are required",
    passwordRequired: "Password must be at least 8 characters",
    passwordsDoNotMatch: "Passwords do not match",
  },
}

/**
 * RecuperarPage - Página de recuperación de contraseña
 *
 * Esta página implementa un flujo de recuperación de contraseña en tres pasos:
 * 1. Solicitud de código: El usuario ingresa su nombre de usuario y email
 * 2. Verificación de código: El usuario ingresa el código enviado a su correo
 * 3. Restablecimiento de contraseña: El usuario establece una nueva contraseña
 *
 * Características:
 * - Validación de formularios en cada paso
 * - Protección con CAPTCHA
 * - Mensajes de retroalimentación claros
 * - Soporte multilenguaje
 * - Notificaciones toast para mejorar UX
 */
export default function RecuperarPage() {
  const router = useRouter()
  const { resetPassword, verifyResetCode, setNewPassword, error } = useAuthStore()
  const { language } = useLanguageStore()
  const [step, setStep] = useState<"request" | "verify" | "reset">("request")
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [userEmail, setUserEmail] = useState("")

  // Obtener traducciones según el idioma seleccionado
  const t = translations[language]

  // Esquemas de validación simplificados
  const requestCodeSchema = z.object({
    username: z.string().min(1, t.username),
    email: z.string().email(t.email),
  })

  const verifyCodeSchema = z.object({
    code1: z.string().length(1, t.allFieldsRequired),
    code2: z.string().length(1, t.allFieldsRequired),
    code3: z.string().length(1, t.allFieldsRequired),
    code4: z.string().length(1, t.allFieldsRequired),
  })

  const newPasswordSchema = z
    .object({
      password: z.string().min(1, "La contraseña es requerida"),
      confirmPassword: z.string().min(1, "Confirme su contraseña"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.passwordsDoNotMatch,
      path: ["confirmPassword"],
    })

  // Formulario para solicitar código
  const requestForm = useForm<z.infer<typeof requestCodeSchema>>({
    resolver: zodResolver(requestCodeSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  })

  // Formulario para verificar código
  const verifyForm = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code1: "",
      code2: "",
      code3: "",
      code4: "",
    },
  })

  // Formulario para nueva contraseña
  const passwordForm = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Resetear los formularios cuando cambia el idioma
  useEffect(() => {
    requestForm.reset()
    verifyForm.reset()
    passwordForm.reset()
  }, [language, requestForm, verifyForm, passwordForm])

  /**
   * Maneja la solicitud de código de recuperación
   * @param data Datos validados del formulario de solicitud
   */
  const onRequestSubmit = async (data: z.infer<typeof requestCodeSchema>) => {
    // Verificar CAPTCHA
    if (!isCaptchaValid) {
      return
    }

    setIsSubmitting(true)
    try {
      // Guardar el email para mostrar en pantalla
      setUserEmail(data.email)

      // Solicitar código de recuperación
      await resetPassword(data.username, data.email)

      // Mostrar mensajes de éxito
      setSuccessMessage(t.codeSent)
      toast({
        title: "Código enviado",
        description: `Se ha enviado un código de recuperación a ${data.email}`,
      })

      // Avanzar al siguiente paso
      setStep("verify")
    } catch (error) {
      console.error("Error al solicitar código:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Maneja la verificación del código de recuperación
   * @param data Datos validados del formulario de verificación
   */
  const onVerifySubmit = async (data: z.infer<typeof verifyCodeSchema>) => {
    // Verificar CAPTCHA
    if (!isCaptchaValid) {
      return
    }

    setIsSubmitting(true)
    try {
      // Concatenar los 4 dígitos del código
      const code = `${data.code1}${data.code2}${data.code3}${data.code4}`

      // Verificar el código
      const isValid = await verifyResetCode(code)

      if (isValid) {
        setSuccessMessage(t.codeVerified)
        toast({
          title: "Código verificado",
          description: "El código ha sido verificado correctamente",
        })
        setStep("reset")
      }
    } catch (error) {
      console.error("Error al verificar código:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar cambio de contraseña
  const onPasswordSubmit = async (data: z.infer<typeof newPasswordSchema>) => {
    setIsSubmitting(true)
    try {
      await setNewPassword(data.password)
      setSuccessMessage(t.passwordUpdated)

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente",
      })

      // Redirigir después de un breve retraso para que el usuario pueda leer el mensaje
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Función para mover el cursor al siguiente campo del código
   * cuando el usuario ingresa un dígito
   * @param e Evento de cambio de input
   * @param index Índice del campo actual (1-4)
   */
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value

    if (value.length <= 1) {
      // Actualizar el valor actual
      const fieldName = `code${index}` as keyof z.infer<typeof verifyCodeSchema>
      verifyForm.setValue(fieldName, value)

      // Mover al siguiente input si hay un valor
      if (value && index < 4) {
        const nextInput = document.getElementById(`code${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <div className="container flex justify-end items-center p-4">
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md flex flex-col items-center mb-6">
          <Logo size="lg" />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{t.title}</CardTitle>
            <CardDescription className="text-center">
              {step === "request" && t.requestDescription}
              {step === "verify" && (
                <>
                  {t.verifyDescription}
                  {userEmail && <p className="mt-2 text-sm font-medium">Enviado a: {userEmail}</p>}
                </>
              )}
              {step === "reset" && t.resetDescription}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {successMessage && (
              <Alert className="mb-4">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {error === "Usuario o email no encontrado"
                    ? t.userNotFound
                    : error === "Código inválido"
                      ? t.invalidCode
                      : error === "Error desconocido"
                        ? t.unknownError
                        : error}
                </AlertDescription>
              </Alert>
            )}

            {step === "request" && (
              <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t.username}</Label>
                  <Input
                    id="username"
                    {...requestForm.register("username")}
                    className={requestForm.formState.errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {requestForm.formState.errors.username && (
                    <p className="text-sm text-red-500">{requestForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...requestForm.register("email")}
                    className={requestForm.formState.errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {requestForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{requestForm.formState.errors.email.message}</p>
                  )}
                </div>

                <MathCaptcha onVerify={setIsCaptchaValid} />

                <Button type="submit" className="w-full" disabled={isSubmitting || !isCaptchaValid}>
                  {isSubmitting ? t.sending : t.sendCode}
                </Button>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t.verificationCode}</Label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Input
                        key={i}
                        id={`code${i}`}
                        maxLength={1}
                        className="w-12 h-12 text-center text-lg"
                        {...verifyForm.register(`code${i}` as keyof z.infer<typeof verifyCodeSchema>)}
                        onChange={(e) => handleCodeChange(e, i)}
                      />
                    ))}
                  </div>
                  {Object.keys(verifyForm.formState.errors).length > 0 && (
                    <p className="text-sm text-red-500 text-center">{t.allFieldsRequired}</p>
                  )}
                </div>

                <MathCaptcha onVerify={setIsCaptchaValid} />

                <Button type="submit" className="w-full" disabled={isSubmitting || !isCaptchaValid}>
                  {isSubmitting ? t.verifying : t.verifyCode}
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t.newPassword}</Label>
                  <PasswordInput
                    id="password"
                    {...passwordForm.register("password")}
                    error={passwordForm.formState.errors.password?.message}
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <PasswordInput
                    id="confirmPassword"
                    {...passwordForm.register("confirmPassword")}
                    error={passwordForm.formState.errors.confirmPassword?.message}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t.updating : t.updatePassword}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {step === "request" ? (
              <>
                <Link href="/login" className="text-sm text-blue-500 hover:underline">
                  {t.login}
                </Link>
                <Link href="/register" className="text-sm text-blue-500 hover:underline">
                  {t.createAccount}
                </Link>
              </>
            ) : step === "verify" ? (
              <>
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="text-sm text-blue-500 hover:underline"
                >
                  {t.back}
                </button>
                <Link href="/login" className="text-sm text-blue-500 hover:underline">
                  {t.login}
                </Link>
              </>
            ) : (
              <div className="w-full text-center">
                <Link href="/login" className="text-sm text-blue-500 hover:underline">
                  {t.backToLogin}
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

