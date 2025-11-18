import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Lo sentimos, algo salió mal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error ? (
              <p className="text-sm text-muted-foreground">Código de error: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Ocurrió un error no especificado.</p>
            )}
            <Button asChild className="w-full">
              <Link href="/auth/login">Volver a Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
