"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordInput } from "@/components/password-input"
import { MathCaptcha } from "@/components/captcha"
import { useAuthStore } from "@/store/auth-store"
import { Logo } from "@/components/logo"
import { Footer } from "@/components/footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector, useLanguageStore } from "@/components/language-selector"
import { toast } from "@/components/ui/use-toast"
import { SessionDebug } from "@/components/session-debug"

// Esquema de validación con Zod
const loginSchema = z
  .object({
    username: z.string().optional(), // Nombre de usuario (opcional)
    email: z.string().email("Correo electrónico inválido").optional(), // Email (opcional)
    folio: z.string().optional(), // Folio (opcional)
    password: z.string().min(1, "La contraseña es requerida"), // Contraseña (requerida)
  })
  .refine((data) => !!data.username || !!data.email || !!data.folio, {
    message: "Debes proporcionar al menos un método de identificación",
    path: ["username"],
  })

/**
 * Traducciones para internacionalización
 * Soporta español e inglés, se selecciona según el idioma del usuario
 */
const translations = {
  es: {
    title: "Iniciar sesión",
    description: "Ingresa tus credenciales para acceder a la plataforma",
    username: "Nombre de usuario",
    email: "Correo electrónico",
    folio: "Folio",
    password: "Contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    login: "Iniciar sesión",
    loggingIn: "Iniciando sesión...",
    noAccount: "¿No tienes una cuenta?",
    createAccount: "Crear cuenta",
    invalidCredentials: "Credenciales inválidas",
    unknownError: "Error desconocido",
    provideIdentification: "Debes proporcionar al menos un método de identificación",
    passwordRequired: "La contraseña es requerida",
    invalidEmail: "Correo electrónico inválido",
    loginSuccess: "Inicio de sesión exitoso",
    redirecting: "Redirigiendo...",
  },
  en: {
    title: "Log in",
    description: "Enter your credentials to access the platform",
    username: "Username",
    email: "Email",
    folio: "Folio",
    password: "Password",
    forgotPassword: "Forgot your password?",
    login: "Log in",
    loggingIn: "Logging in...",
    noAccount: "Don't have an account?",
    createAccount: "Create account",
    invalidCredentials: "Invalid credentials",
    unknownError: "Unknown error",
    provideIdentification: "You must provide at least one identification method",
    passwordRequired: "Password is required",
    invalidEmail: "Invalid email",
    loginSuccess: "Login successful",
    redirecting: "Redirecting...",
  },
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, error, isAuthenticated, checkSession } = useAuthStore()
  const { language } = useLanguageStore()
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // Obtener la URL de retorno si existe
  const callbackUrl = searchParams.get("callbackUrl") || "/home"

  // Obtener traducciones según el idioma seleccionado
  const t = translations[language]

  // Redirigir si ya está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated && checkSession()) {
        setRedirecting(true)

        toast({
          title: t.loginSuccess,
          description: `${t.redirecting} ${callbackUrl}`,
        })

        // Pequeño retraso para mostrar el mensaje de éxito
        setTimeout(() => {
          router.push(callbackUrl)
        }, 1000)
      }
    }

    checkAuth()
  }, [isAuthenticated, router, callbackUrl, checkSession, t])

  // Actualizar el esquema de validación según el idioma
  const localizedLoginSchema = z
    .object({
      username: z.string().optional(),
      email: z.string().email(t.invalidEmail).optional(),
      folio: z.string().optional(),
      password: z.string().min(1, t.passwordRequired),
    })
    .refine((data) => !!data.username || !!data.email || !!data.folio, {
      message: t.provideIdentification,
      path: ["username"],
    })

  // Actualizar los valores por defecto del formulario
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof localizedLoginSchema>>({
    resolver: zodResolver(localizedLoginSchema),
    defaultValues: {
      username: "",
      email: "",
      folio: "",
      password: "",
    },
  })

  // Resetear el formulario cuando cambia el idioma
  useEffect(() => {
    reset()
  }, [language, reset])

  /**
   * Maneja el envío del formulario de login
   * @param data Datos validados del formulario
   */
  const onSubmit = async (data: z.infer<typeof localizedLoginSchema>) => {
    if (!isCaptchaValid) {
      return
    }

    setIsSubmitting(true)
    try {
      await login(data.username || "", data.email || "", data.folio || "", data.password)

      // La redirección se maneja en el useEffect
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setIsSubmitting(false)
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t.loginSuccess}</h2>
          <p className="text-muted-foreground">{t.redirecting}</p>
        </div>
      </div>
    )
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
            <CardDescription className="text-center">{t.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error === "Credenciales inválidas"
                      ? t.invalidCredentials
                      : error === "Error desconocido"
                        ? t.unknownError
                        : error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">{t.username}</Label>
                <Input
                  id="username"
                  {...register("username")}
                  className={errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="folio">{t.folio}</Label>
                <Input
                  id="folio"
                  {...register("folio")}
                  className={errors.folio ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.folio && <p className="text-sm text-red-500">{errors.folio.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t.password}</Label>
                  <Link href="/recuperar" className="text-sm text-blue-500 hover:underline">
                    {t.forgotPassword}
                  </Link>
                </div>
                <PasswordInput id="password" {...register("password")} error={errors.password?.message} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <MathCaptcha onVerify={setIsCaptchaValid} />

              <Button type="submit" className="w-full" disabled={isSubmitting || !isCaptchaValid}>
                {isSubmitting ? t.loggingIn : t.login}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              {t.noAccount}{" "}
              <Link href="/register" className="text-blue-500 hover:underline">
                {t.createAccount}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Footer />
      <SessionDebug />
    </div>
  )
}

