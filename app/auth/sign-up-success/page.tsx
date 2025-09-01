import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Try Games</h1>
          </div>

          <Card className="competition-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-green-600">¡Registro Exitoso!</CardTitle>
              <CardDescription className="text-center">Revisa tu email para confirmar tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  Te hemos enviado un email de confirmación. Haz clic en el enlace del email para activar tu cuenta y
                  poder acceder al panel de administración.
                </p>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full bg-red-500 hover:bg-red-600">
                  <Link href="/auth/login">Ir al Login</Link>
                </Button>

                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/">Volver a la Competición</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
