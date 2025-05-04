/**
 * Middleware de protección de rutas y redirección
 *
 * Este middleware:
 * - Intercepta todas las peticiones a rutas protegidas
 * - Verifica si el usuario está autenticado mediante cookies
 * - Redirige al login si intenta acceder a rutas protegidas sin autenticación
 * - Permite acceso limitado a rutas públicas para usuarios no autenticados
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que requieren autenticación para ser accedidas
const protectedRoutes = ["/home", "/calendar", "/class", "/tasks", "/settings"]

// Rutas públicas con versiones limitadas para usuarios no autenticados
const publicRoutes = ["/about", "/privacy", "/terms", "/help", "/contact"]

/**
 * Verifica si el usuario está autenticado basado en la cookie de autenticación
 * @param request La solicitud HTTP entrante
 * @returns boolean - true si el usuario está autenticado, false si no
 */
function isUserAuthenticated(request: NextRequest): boolean {
  try {
    // Obtener la cookie de autenticación
    const authCookie = request.cookies.get("auth-storage")

    // Si no hay cookie, el usuario no está autenticado
    if (!authCookie?.value) {
      return false
    }

    // Parsear el contenido de la cookie
    const authData = JSON.parse(authCookie.value)

    // Verificar si el usuario está autenticado según el estado
    if (!authData.state?.isAuthenticated || !authData.state?.user) {
      return false
    }

    // Verificar si hay un token de sesión válido
    if (!authData.state?.sessionToken?.value || !authData.state?.sessionToken?.expiresAt) {
      return false
    }

    // Verificar si el token de sesión ha expirado
    const now = Date.now()
    if (now > authData.state.sessionToken.expiresAt) {
      return false
    }

    // Si todas las verificaciones pasan, el usuario está autenticado
    return true
  } catch (error) {
    // Si hay algún error al procesar la cookie, consideramos que el usuario no está autenticado
    console.error("Error al verificar autenticación:", error)
    return false
  }
}

/**
 * Función principal del middleware que ejecuta las verificaciones de seguridad
 * @param request La solicitud HTTP entrante
 * @returns Respuesta modificada o redirección según corresponda
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Verificar si el usuario está autenticado
  const isAuthenticated = isUserAuthenticated(request)

  // Proteger rutas que requieren autenticación
  if (protectedRoutes.some((route) => path.startsWith(route)) && !isAuthenticated) {
    // Guardar la URL original para redirigir después del login
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname))
    return NextResponse.redirect(url)
  }

  // Para rutas públicas, permitir el acceso pero con una bandera para versión limitada
  if (publicRoutes.some((route) => path.startsWith(route)) && !isAuthenticated) {
    const response = NextResponse.next()
    response.headers.set("x-auth-status", "unauthenticated")
    return response
  }

  // Permitir el acceso si no hay restricciones
  return NextResponse.next()
}

// Configuración de las rutas a las que se aplica este middleware
export const config = {
  matcher: [
    "/home/:path*",
    "/calendar/:path*",
    "/class/:path*",
    "/tasks/:path*",
    "/settings/:path*",
    "/about/:path*",
    "/privacy/:path*",
    "/terms/:path*",
    "/help/:path*",
    "/contact/:path*",
  ],
}

