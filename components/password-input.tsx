/**
 * PasswordInput - Componente de entrada de contraseña con visibilidad alternante
 *
 * Este componente:
 * - Permite al usuario mostrar u ocultar la contraseña
 * - Muestra estado de error si se proporciona
 * - Aplica estilos de error para retroalimentación visual
 * - Extiende la funcionalidad del componente Input base
 *
 * Se utiliza en formularios de login, registro y recuperación de contraseña.
 */
"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
  id: string // ID único para el input
  value?: string // Valor actual del input
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void // Handler para cambios
  placeholder?: string // Texto placeholder
  error?: string // Mensaje de error opcional
  className?: string // Clases CSS adicionales
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  error,
  className = "",
  ...props
}: PasswordInputProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "className">) {
  // Estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"} // Alternar entre texto y password
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`pr-10 ${error ? "border-red-500 focus-visible:ring-red-500" : ""} ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      <div className="absolute right-0 top-0 h-full flex items-center pr-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-muted-foreground"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1} // Excluir del orden de tabulación
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </div>
    </div>
  )
}

