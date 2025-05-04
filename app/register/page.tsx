"use client"

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
import { PasswordInput } from "@/components/password-input"
import { MathCaptcha } from "@/components/captcha"
import { TermsModal } from "@/components/terms-modal"
import { useAuthStore } from "@/store/auth-store"
import { SubjectSelect } from "@/components/subject-select"
import { UserRole, Subject } from "@/types"
import { Logo } from "@/components/logo"
import { Footer } from "@/components/footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector, useLanguageStore } from "@/components/language-selector"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormError } from "@/components/form-error"
import { toast } from "@/components/ui/use-toast"

// Traducciones
const translations = {
  es: {
    title: "Registro",
    studentTitle: "Registro de Alumnos",
    teacherTitle: "Registro de Profesores",
    description: "Ingresa tus datos para registrarte en la plataforma",
    studentDescription: "Ingresa tus datos para registrarte como alumno",
    teacherDescription: "Ingresa tus datos para registrarte como profesor",
    username: "Nombre de usuario",
    email: "Correo electrónico",
    folio: "Folio",
    curp: "CURP",
    subjects: "Materias",
    password: "Contraseña",
    confirmPassword: "Confirme su contraseña",
    register: "Registrar",
    registering: "Registrando...",
    student: "Alumno",
    teacher: "Profesor",
    usernameRequired: "El nombre de usuario debe tener al menos 3 caracteres",
    invalidEmail: "Correo electrónico inválido",
    folioRequired: "El folio debe tener al menos 3 caracteres",
    invalidCurp: "CURP inválido. Formato: AAAA######ABCDEF##",
    subjectsRequired: "Los profesores deben seleccionar al menos una materia",
    passwordRequired: "La contraseña debe tener al menos 8 caracteres",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    haveAccount: "¿Ya tienes una cuenta?",
    login: "Iniciar sesión",
    back: "Volver",
    registerSuccess: "Registro exitoso",
    redirecting: "Redirigiendo al inicio...",
  },
  en: {
    title: "Registration",
    studentTitle: "Student Registration",
    teacherTitle: "Teacher Registration",
    description: "Enter your information to register on the platform",
    studentDescription: "Enter your information to register as a student",
    teacherDescription: "Enter your information to register as a teacher",
    username: "Username",
    email: "Email",
    folio: "Folio",
    curp: "CURP",
    subjects: "Subjects",
    password: "Password",
    confirmPassword: "Confirm your password",
    register: "Register",
    registering: "Registering...",
    student: "Student",
    teacher: "Teacher",
    usernameRequired: "Username must be at least 3 characters",
    invalidEmail: "Invalid email",
    folioRequired: "Folio must be at least 3 characters",
    invalidCurp: "Invalid CURP. Format: AAAA######ABCDEF##",
    subjectsRequired: "Teachers must select at least one subject",
    passwordRequired: "Password must be at least 8 characters",
    passwordsDoNotMatch: "Passwords do not match",
    haveAccount: "Already have an account?",
    login: "Log in",
    back: "Back",
    registerSuccess: "Registration successful",
    redirecting: "Redirecting to home...",
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, error, isAuthenticated, checkSession } = useAuthStore()
  const { language } = useLanguageStore()
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [isTermsAccepted, setIsTermsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
  const [activeTab, setActiveTab] = useState("student")
  const [redirecting, setRedirecting] = useState(false)

  // Obtener traducciones según el idioma seleccionado
  const t = translations[language]

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && checkSession()) {
      router.push("/home")
    }
  }, [isAuthenticated, router, checkSession])

  // Más abajo en el código, actualizar la sección de esquemas de validación:

  /**
   * Esquema de validación para el registro de profesores
   * Valida:
   * - Username: Mínimo 3 caracteres
   * - Email: Formato válido de correo electrónico
   * - Folio: Mínimo 3 caracteres
   * - CURP: Formato mexicano estándar
   * - Subjects: Opcional (se valida después)
   * - Password: Mínimo 8 caracteres
   * - Confirmación de password: Debe coincidir con password
   */
  const teacherSchema = z
    .object({
      username: z.string().min(3, t.usernameRequired),
      email: z.string().email(t.invalidEmail),
      folio: z.string().min(3, t.folioRequired),
      curp: z.string().regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, t.invalidCurp),
      subjects: z.array(z.nativeEnum(Subject)).optional(),
      password: z.string().min(1, "La contraseña es requerida"),
      confirmPassword: z.string().min(1, "Confirme su contraseña"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.passwordsDoNotMatch,
      path: ["confirmPassword"],
    })

  // Modificar el esquema de validación para estudiantes de manera similar
  const studentSchema = z
    .object({
      username: z.string().min(3, t.usernameRequired),
      email: z.string().email(t.invalidEmail),
      folio: z.string().min(3, t.folioRequired),
      curp: z.string().regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, t.invalidCurp),
      password: z.string().min(1, "La contraseña es requerida"), // Mensaje de error explícito
      confirmPassword: z.string().min(1, "Confirme su contraseña"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.passwordsDoNotMatch,
      path: ["confirmPassword"],
    })

  // Formulario para profesores
  const teacherForm = useForm<z.infer<typeof teacherSchema>>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      username: "",
      email: "",
      folio: "",
      curp: "",
      subjects: [],
      password: "",
      confirmPassword: "",
    },
  })

  // Formulario para alumnos
  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      username: "",
      email: "",
      folio: "",
      curp: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Resetear los formularios cuando cambia el idioma
  useEffect(() => {
    teacherForm.reset()
    studentForm.reset()
  }, [language, teacherForm, studentForm])

  // Actualizar subjects cuando cambian
  useEffect(() => {
    teacherForm.setValue("subjects", selectedSubjects)
  }, [selectedSubjects, teacherForm])

  // Actualizar los métodos de envío:

  /**
   * Procesa el envío del formulario de profesor
   * @param data Datos validados del formulario
   */
  const onTeacherSubmit = async (data: z.infer<typeof teacherSchema>) => {
    // Verificar requisitos de seguridad adicionales
    if (!isCaptchaValid || !isTermsAccepted) {
      return
    }

    // Asegurar que subjects tenga un valor por defecto
    const subjects = data.subjects || []

    // Verificar requisito adicional de materias para profesores
    if (subjects.length === 0) {
      teacherForm.setError("subjects", {
        type: "manual",
        message: t.subjectsRequired,
      })
      return
    }

    // Procesar registro
    setIsSubmitting(true)
    try {
      await registerUser({
        ...data,
        subjects,
        role: UserRole.TEACHER,
        departments: [], // No se necesitan departamentos
      })

      // Mostrar mensaje de éxito
      toast({
        title: t.registerSuccess,
        description: t.redirecting,
      })

      // Indicar que estamos redirigiendo
      setRedirecting(true)

      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push("/home")
      }, 1500)
    } catch (error) {
      console.error("Error al registrar profesor:", error)
      setIsSubmitting(false)
    }
  }

  /**
   * Procesa el envío del formulario de estudiante
   * @param data Datos validados del formulario
   */
  const onStudentSubmit = async (data: z.infer<typeof studentSchema>) => {
    // Verificar requisitos de seguridad
    if (!isCaptchaValid || !isTermsAccepted) {
      return
    }

    // Procesar registro
    setIsSubmitting(true)
    try {
      await registerUser({
        ...data,
        role: UserRole.STUDENT,
        departments: [], // No se necesitan departamentos
      })

      // Mostrar mensaje de éxito
      toast({
        title: t.registerSuccess,
        description: t.redirecting,
      })

      // Indicar que estamos redirigiendo
      setRedirecting(true)

      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push("/home")
      }, 1500)
    } catch (error) {
      console.error("Error al registrar alumno:", error)
      setIsSubmitting(false)
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t.registerSuccess}</h2>
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

        <Card className="w-full max-w-md shadow-lg card-hover-effect">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === "student" ? t.studentTitle : t.teacherTitle}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "student" ? t.studentDescription : t.teacherDescription}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">{t.student}</TabsTrigger>
                <TabsTrigger value="teacher">{t.teacher}</TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {activeTab === "student" ? (
              <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-username" className="text-sm font-medium">
                    {t.username}
                  </Label>
                  <Input
                    id="student-username"
                    {...studentForm.register("username")}
                    className={studentForm.formState.errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
                    placeholder="JuanPerez"
                  />
                  {studentForm.formState.errors.username && (
                    <FormError message={studentForm.formState.errors.username.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-email" className="text-sm font-medium">
                    {t.email}
                  </Label>
                  <Input
                    id="student-email"
                    type="email"
                    {...studentForm.register("email")}
                    className={studentForm.formState.errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                    placeholder="juan.perez@ejemplo.com"
                  />
                  {studentForm.formState.errors.email && (
                    <FormError message={studentForm.formState.errors.email.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-folio" className="text-sm font-medium">
                    {t.folio}
                  </Label>
                  <Input
                    id="student-folio"
                    {...studentForm.register("folio")}
                    className={studentForm.formState.errors.folio ? "border-red-500 focus-visible:ring-red-500" : ""}
                    placeholder="ALU12345"
                  />
                  {studentForm.formState.errors.folio && (
                    <FormError message={studentForm.formState.errors.folio.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-curp" className="text-sm font-medium">
                    {t.curp}
                  </Label>
                  <Input
                    id="student-curp"
                    {...studentForm.register("curp")}
                    className={studentForm.formState.errors.curp ? "border-red-500 focus-visible:ring-red-500" : ""}
                    placeholder="ABCD123456HDFXYZ01"
                  />
                  {studentForm.formState.errors.curp && (
                    <FormError message={studentForm.formState.errors.curp.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-password" className="text-sm font-medium">
                    {t.password}
                  </Label>
                  <PasswordInput
                    id="student-password"
                    {...studentForm.register("password")}
                    error={studentForm.formState.errors.password?.message}
                  />
                  {studentForm.formState.errors.password && (
                    <FormError message={studentForm.formState.errors.password.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-confirmPassword" className="text-sm font-medium">
                    {t.confirmPassword}
                  </Label>
                  <PasswordInput
                    id="student-confirmPassword"
                    {...studentForm.register("confirmPassword")}
                    error={studentForm.formState.errors.confirmPassword?.message}
                  />
                  {studentForm.formState.errors.confirmPassword && (
                    <FormError message={studentForm.formState.errors.confirmPassword.message} />
                  )}
                </div>

                <TermsModal isChecked={isTermsAccepted} onCheckedChange={setIsTermsAccepted} />

                <MathCaptcha onVerify={setIsCaptchaValid} />

                <Button type="submit" className="w-full" disabled={isSubmitting || !isCaptchaValid || !isTermsAccepted}>
                  {isSubmitting ? t.registering : t.register}
                </Button>
              </form>
            ) : (
              <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-username" className="text-sm font-medium">
                    {t.username}
                  </Label>
                  <Input
                    id="teacher-username"
                    {...teacherForm.register("username")}
                    className={teacherForm.formState.errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
                    placeholder="ProfesorMartinez"
                  />
                  {teacherForm.formState.errors.username && (
                    <FormError message={teacherForm.formState.errors.username.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-email" className="text-sm font-medium">
                    {t.email}
                  </Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    {...teacherForm.register("email")}
                    className={teacherForm.formState.errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                    placeholder="profesor.martinez@ejemplo.com"
                  />
                  {teacherForm.formState.errors.email && (
                    <FormError message={teacherForm.formState.errors.email.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-folio" className="text-sm font-medium">
                    {t.folio}
                  </Label>
                  <Input
                    id="teacher-folio"
                    {...teacherForm.register("folio")}
                    className={teacherForm.formState.errors.folio ? "border-red-500 focus-visible:ring-red-500" : ""}
                    placeholder="PROF12345"
                  />
                  {teacherForm.formState.errors.folio && (
                    <FormError message={teacherForm.formState.errors.folio.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-curp" className="text-sm font-medium">
                    {t.curp}
                  </Label>
                  <Input
                    id="teacher-curp"
                    {...teacherForm.register("curp")}
                    className={teacherForm.formState.errors.curp ? "border-red-500 focus-visible:ring-red-500" : ""}
                    placeholder="ABCD123456HDFXYZ01"
                  />
                  {teacherForm.formState.errors.curp && (
                    <FormError message={teacherForm.formState.errors.curp.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t.subjects}</Label>
                  <SubjectSelect value={selectedSubjects} onValueChange={setSelectedSubjects} />
                  {teacherForm.formState.errors.subjects && (
                    <FormError message={teacherForm.formState.errors.subjects.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-password" className="text-sm font-medium">
                    {t.password}
                  </Label>
                  <PasswordInput
                    id="teacher-password"
                    {...teacherForm.register("password")}
                    error={teacherForm.formState.errors.password?.message}
                  />
                  {teacherForm.formState.errors.password && (
                    <FormError message={teacherForm.formState.errors.password.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-confirmPassword" className="text-sm font-medium">
                    {t.confirmPassword}
                  </Label>
                  <PasswordInput
                    id="teacher-confirmPassword"
                    {...teacherForm.register("confirmPassword")}
                    error={teacherForm.formState.errors.confirmPassword?.message}
                  />
                  {teacherForm.formState.errors.confirmPassword && (
                    <FormError message={teacherForm.formState.errors.confirmPassword.message} />
                  )}
                </div>

                <TermsModal isChecked={isTermsAccepted} onCheckedChange={setIsTermsAccepted} />

                <MathCaptcha onVerify={setIsCaptchaValid} />

                <Button type="submit" className="w-full" disabled={isSubmitting || !isCaptchaValid || !isTermsAccepted}>
                  {isSubmitting ? t.registering : t.register}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              {t.haveAccount}{" "}
              <Link href="/login" className="text-blue-500 hover:underline">
                {t.login}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

