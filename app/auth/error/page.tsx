import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Try Games</h1>
          </div>

          <Card className="competition-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-red-600">Error de Autenticación</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                {params?.error ? (
                  <p className="text-sm text-red-700">Error: {params.error}</p>
                ) : (
                  <p className="text-sm text-red-700">Ha ocurrido un error inesperado durante la autenticación.</p>
                )}
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full bg-red-500 hover:bg-red-600">
                  <Link href="/auth/login">Intentar de Nuevo</Link>
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
