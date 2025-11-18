"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Clock, MapPin, Timer, LogOut } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Pet, Prediction, LocationStats } from "@/lib/types"

interface PetDashboardProps {
  user: any
  profile: any
  pet: Pet
  allPets: Pet[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PetDashboard({ user, profile, pet }: PetDashboardProps) {
  const router = useRouter()
  const supabase = createClient()

  const { data: latestData, error: latestError } = useSWR(
    `/api/predictions/latest?petId=${pet.id}`,
    fetcher,
    { refreshInterval: 30000 }, // Refresh every 30 seconds
  )

  const { data: statsData, error: statsError } = useSWR(
    `/api/predictions/stats?petId=${pet.id}&hours=24`,
    fetcher,
    { refreshInterval: 60000 }, // Refresh every minute
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const prediction: Prediction | null = latestData?.prediction || null
  const stats: LocationStats[] = statsData?.stats || []

  const lastUpdate = prediction?.timestamp ? new Date(prediction.timestamp) : new Date()
  const nextUpdate = new Date(lastUpdate.getTime() + 5 * 60000) // 5 minutes later

  const chartData = stats.map((stat, index) => ({
    name: stat.location,
    value: Number.parseFloat(stat.percentage),
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
  }))

  const userName = profile?.first_name || user.email?.split("@")[0] || "Usuario"
  const currentLocation = prediction?.location?.name || "ubicación desconocida"
  const confidence = prediction?.confidence || 0

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header con logo y logout */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">PetTrack</h1>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid de cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
          {/* Card: Ubicación actual */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-card-foreground">Ubicación Actual</CardTitle>
            </CardHeader>
            <CardContent>
              {latestError ? (
                <p className="text-destructive">Error al cargar la ubicación</p>
              ) : !prediction ? (
                <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
              ) : (
                <>
                  <p className="text-balance text-xl text-card-foreground md:text-2xl">
                    Hola {userName}, {pet.name} se encuentra en la {currentLocation}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Confianza: {(confidence * 100).toFixed(0)}%</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card: Última actualización */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-card-foreground">Última Actualización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-card-foreground">{formatTime(lastUpdate)}</p>
                  <p className="text-sm text-muted-foreground">
                    {lastUpdate.toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Próxima actualización */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-card-foreground">Próxima Actualización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-card-foreground">{formatTime(nextUpdate)}</p>
                  <p className="text-sm text-muted-foreground">
                    En {Math.ceil((nextUpdate.getTime() - lastUpdate.getTime()) / 60000)} minutos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Distribución de ubicaciones */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-card-foreground">Distribución de Tiempo (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              {statsError ? (
                <p className="text-destructive">Error al cargar estadísticas</p>
              ) : chartData.length === 0 ? (
                <p className="text-muted-foreground">No hay suficientes datos para mostrar</p>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-4 space-y-2">
                    {stats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: chartData[index]?.color }} />
                        <span className="text-muted-foreground">
                          {stat.location} ({stat.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
