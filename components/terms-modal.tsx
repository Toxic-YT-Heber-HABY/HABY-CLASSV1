"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface TermsModalProps {
  isChecked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function TermsModal({ isChecked, onCheckedChange }: TermsModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id="terms"
        checked={isChecked}
        onCheckedChange={onCheckedChange}
        className={isChecked ? "bg-green-500 text-white border-green-500" : "border-red-500"}
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor="terms"
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
            isChecked ? "text-green-500" : "text-red-500"
          }`}
        >
          Acepto los{" "}
          <button type="button" className="text-blue-500 underline" onClick={() => setIsOpen(true)}>
            términos y condiciones
          </button>
        </Label>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Términos y Condiciones</DialogTitle>
            <DialogDescription>Por favor, lee detenidamente los siguientes términos y condiciones.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-2">1. Introducción</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Estos Términos y Condiciones regulan el uso de la plataforma educativa. Al registrarte y utilizar nuestros
              servicios, aceptas cumplir con estos términos.
            </p>

            <h3 className="text-lg font-semibold mb-2">2. Privacidad de Datos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nos comprometemos a proteger tu información personal de acuerdo con nuestra Política de Privacidad. Los
              datos proporcionados serán utilizados únicamente para los fines específicos de la plataforma educativa.
            </p>

            <h3 className="text-lg font-semibold mb-2">3. Uso Responsable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Te comprometes a utilizar la plataforma de manera responsable, respetando los derechos de otros usuarios y
              cumpliendo con las normas de conducta establecidas.
            </p>

            <h3 className="text-lg font-semibold mb-2">4. Propiedad Intelectual</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Todo el contenido disponible en la plataforma está protegido por derechos de autor y otras leyes de
              propiedad intelectual. No está permitida la reproducción o distribución no autorizada de dicho contenido.
            </p>

            <h3 className="text-lg font-semibold mb-2">5. Modificaciones</h3>
            <p className="text-sm text-muted-foreground">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados
              a través de la plataforma y entrarán en vigor inmediatamente después de su publicación.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                onCheckedChange(true)
                setIsOpen(false)
              }}
            >
              Aceptar y Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

