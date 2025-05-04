"use client"

import { Logo } from "@/components/logo"
import Link from "next/link"
import { useLanguageStore } from "@/components/language-selector"

export function Footer() {
  const { language } = useLanguageStore()

  const translations = {
    es: {
      founder: "HABY, fundada por Heber Zadkiel Garcia Perez.",
      rights: "Todos los derechos reservados.",
      about: "Acerca de",
      privacy: "Privacidad",
      terms: "Términos",
      contact: "Contacto",
      help: "Ayuda",
    },
    en: {
      founder: "HABY, founded by Heber Zadkiel Garcia Perez.",
      rights: "All rights reserved.",
      about: "About",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
      help: "Help",
    },
  }

  const t = translations[language]

  return (
    <footer className="w-full border-t bg-background py-6">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col space-y-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">{t.founder}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium">Enlaces rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/home" className="text-muted-foreground hover:text-foreground">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="text-muted-foreground hover:text-foreground">
                  Calendario
                </Link>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-4 text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    {t.about}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    {t.privacy}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    {t.terms}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-medium">Soporte</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    {t.contact}
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground">
                    {t.help}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} HABY. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}

