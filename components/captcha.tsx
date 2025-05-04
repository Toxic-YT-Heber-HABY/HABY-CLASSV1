/**
 * MathCaptcha - Componente de CAPTCHA basado en operaciones matemáticas sencillas
 *
 * Este componente:
 * - Genera un problema matemático aleatorio (suma, resta o multiplicación)
 * - Verifica la respuesta proporcionada por el usuario
 * - Provee retroalimentación visual sobre la validez de la respuesta
 * - Permite generar nuevos problemas con un botón de recarga
 * - Notifica al componente padre sobre el estado de la verificación
 *
 * Se utiliza como medida de seguridad para prevenir ataques automatizados.
 */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MathCaptchaProps {
  onVerify: (isValid: boolean) => void // Callback para notificar el estado de verificación
}

export function MathCaptcha({ onVerify }: MathCaptchaProps) {
  const [num1, setNum1] = useState(0) // Primer número de la operación
  const [num2, setNum2] = useState(0) // Segundo número de la operación
  const [operation, setOperation] = useState<"+" | "-" | "*">("*") // Tipo de operación
  const [answer, setAnswer] = useState("") // Respuesta del usuario
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null) // Estado de verificación

  /**
   * Genera un nuevo problema matemático aleatorio
   * Ajusta la dificultad según el tipo de operación
   */
  const generateProblem = () => {
    const operations: Array<"+" | "-" | "*"> = ["+", "-", "*"]
    const randomOp = operations[Math.floor(Math.random() * operations.length)]

    let a = 0
    let b = 0

    // Ajustar dificultad según la operación
    if (randomOp === "+") {
      a = Math.floor(Math.random() * 10) + 1
      b = Math.floor(Math.random() * 10) + 1
    } else if (randomOp === "-") {
      a = Math.floor(Math.random() * 10) + 5 // Asegurar que a > b
      b = Math.floor(Math.random() * 5) + 1
    } else if (randomOp === "*") {
      a = Math.floor(Math.random() * 5) + 1 // Multiplicaciones sencillas
      b = Math.floor(Math.random() * 5) + 1
    }

    setNum1(a)
    setNum2(b)
    setOperation(randomOp)
    setAnswer("")
    setIsCorrect(null)
  }

  /**
   * Calcula la respuesta correcta según la operación
   * @returns El resultado numérico de la operación
   */
  const calculateCorrectAnswer = (): number => {
    switch (operation) {
      case "+":
        return num1 + num2
      case "-":
        return num1 - num2
      case "*":
        return num1 * num2
      default:
        return 0
    }
  }

  /**
   * Verifica si la respuesta del usuario es correcta
   * y notifica al componente padre
   */
  const verifyAnswer = () => {
    const userAnswer = Number.parseInt(answer, 10)
    const correctAnswer = calculateCorrectAnswer()
    const result = userAnswer === correctAnswer
    setIsCorrect(result)
    onVerify(result)
  }

  // Manejar cambios en la respuesta del usuario
  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value)
    setIsCorrect(null)
  }

  // Generar un problema al montar el componente
  useEffect(() => {
    generateProblem()
  }, [])

  // Verificar la respuesta cuando cambia
  useEffect(() => {
    if (answer !== "") {
      verifyAnswer()
    }
  }, [answer])

  // Renderizado del componente
  return (
    <div className="space-y-2">
      <Label htmlFor="captcha" className="text-sm font-medium">
        Captcha: Resuelve el problema matemático
      </Label>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center p-2 bg-muted rounded-md min-w-[120px]">
          <span className="text-lg font-medium">
            {num1} {operation} {num2} = ?
          </span>
        </div>
        <Input
          id="captcha"
          type="number"
          value={answer}
          onChange={handleAnswerChange}
          className={`w-20 ${
            isCorrect === true
              ? "border-green-500 focus-visible:ring-green-500"
              : isCorrect === false
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
          }`}
          placeholder="?"
        />
        <button
          type="button"
          onClick={generateProblem}
          className="p-2 text-sm text-muted-foreground hover:text-primary"
          aria-label="Generar nuevo problema"
        >
          ↻
        </button>
      </div>
      {isCorrect === false && <p className="text-sm text-red-500">Respuesta incorrecta, intenta de nuevo</p>}
    </div>
  )
}

