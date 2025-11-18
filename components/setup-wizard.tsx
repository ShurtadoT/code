"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface SetupWizardProps {
  user: any
  profile: any
}

export default function SetupWizard({ user, profile }: SetupWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pet form
  const [petName, setPetName] = useState("")
  const [petSpecies, setPetSpecies] = useState("Perro")
  const [petBreed, setPetBreed] = useState("")

  // Locations form
  const [locations, setLocations] = useState([
    { name: "Cocina", description: "Área de cocina" },
    { name: "Sala", description: "Sala de estar" },
    { name: "Habitación", description: "Dormitorio principal" },
  ])

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: petName,
          species: petSpecies,
          breed: petBreed,
        }),
      })

      if (!response.ok) throw new Error("Error al crear la mascota")

      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLocations = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      for (const location of locations) {
        const response = await fetch("/api/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: location.name,
            description: location.description,
            floor_level: 0,
          }),
        })

        if (!response.ok) throw new Error("Error al crear ubicaciones")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const userName = profile?.first_name || user.email?.split("@")[0] || "Usuario"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido, {userName}</CardTitle>
              <CardDescription>Primero, cuéntanos sobre tu mascota</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePet} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="petName">Nombre de la mascota</Label>
                  <Input
                    id="petName"
                    placeholder="Bruno"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petSpecies">Especie</Label>
                  <Input
                    id="petSpecies"
                    placeholder="Perro"
                    value={petSpecies}
                    onChange={(e) => setPetSpecies(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petBreed">Raza (opcional)</Label>
                  <Input
                    id="petBreed"
                    placeholder="Labrador"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creando..." : "Continuar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Configurar Ubicaciones</CardTitle>
              <CardDescription>Define las áreas de tu casa donde se rastreará a tu mascota</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLocations} className="space-y-4">
                {locations.map((location, index) => (
                  <div key={index} className="space-y-2">
                    <Label>Ubicación {index + 1}</Label>
                    <Input
                      placeholder="Nombre"
                      value={location.name}
                      onChange={(e) => {
                        const newLocations = [...locations]
                        newLocations[index].name = e.target.value
                        setLocations(newLocations)
                      }}
                      required
                    />
                  </div>
                ))}
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Configurando..." : "Finalizar Configuración"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
