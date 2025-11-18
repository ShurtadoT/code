"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Battery, MapPin, Radio, Clock, Activity } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface PetLocationData {
  measurement: string
  tags: {
    sensor_id: string
    pet_id: string
    room: string
  }
  fields: {
    rssi: number
    distance: number
    tx_power: number
    battery_level: number
    mac_address: string
  }
  time: string
}

const ROOMS = ["sala", "patio", "cocina", "habitación 1"]
const ROOM_COLORS = {
  sala: "hsl(var(--chart-1))",
  patio: "hsl(var(--chart-2))",
  cocina: "hsl(var(--chart-3))",
  "habitación 1": "hsl(var(--chart-4))",
}

function generateMockData(): PetLocationData {
  const randomRoom = ROOMS[Math.floor(Math.random() * ROOMS.length)]
  const now = new Date()

  return {
    measurement: "pet_location_data",
    tags: {
      sensor_id: `ESP32_${randomRoom.replace(/\s/g, "_")}`,
      pet_id: "Pet_Collar_01",
      room: randomRoom,
    },
    fields: {
      rssi: -Math.floor(Math.random() * 30 + 50), // -50 to -80
      distance: Number.parseFloat((Math.random() * 5 + 0.5).toFixed(2)), // 0.5 to 5.5 meters
      tx_power: -59,
      battery_level: Math.floor(Math.random() * 20 + 75), // 75% to 95%
      mac_address: "A4:C1:38:77:2B:5F",
    },
    time: now.toISOString(),
  }
}

function calculateRoomDistribution(history: PetLocationData[]) {
  const roomCount: Record<string, number> = {}

  history.forEach((data) => {
    roomCount[data.tags.room] = (roomCount[data.tags.room] || 0) + 1
  })

  return Object.entries(roomCount).map(([room, count]) => ({
    name: room,
    value: count,
    color: ROOM_COLORS[room as keyof typeof ROOM_COLORS],
  }))
}

export default function PetTracker() {
  const [currentData, setCurrentData] = useState<PetLocationData>(generateMockData())
  const [dataHistory, setDataHistory] = useState<PetLocationData[]>([])
  const [nextUpdate, setNextUpdate] = useState<Date>(new Date(Date.now() + 30000))

  useEffect(() => {
    // Initialize with some history
    const initialHistory = Array.from({ length: 20 }, () => generateMockData())
    setDataHistory(initialHistory)

    // Update every 30 seconds
    const interval = setInterval(() => {
      const newData = generateMockData()
      setCurrentData(newData)
      setDataHistory((prev) => [...prev.slice(-19), newData])
      setNextUpdate(new Date(Date.now() + 30000))
    }, 30000)

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setNextUpdate(new Date(Date.now() + 30000))
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(countdownInterval)
    }
  }, [])

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `hace ${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `hace ${hours}h`
  }

  const timeUntilNext = () => {
    const seconds = Math.floor((nextUpdate.getTime() - Date.now()) / 1000)
    if (seconds <= 0) return "actualizando..."
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-chart-3"
    if (level > 30) return "text-chart-5"
    return "text-destructive"
  }

  const getSignalStrength = (rssi: number) => {
    if (rssi > -60) return "Excelente"
    if (rssi > -70) return "Buena"
    if (rssi > -80) return "Regular"
    return "Débil"
  }

  const roomDistribution = calculateRoomDistribution(dataHistory)

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Pet<span className="text-primary">Track</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Sistema de seguimiento en tiempo real · ESP32 IoT</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Location Card */}
        <Card className="p-6 lg:col-span-2 bg-gradient-to-br from-card via-card to-card/50 border-border/50 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span>Ubicación Actual</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold capitalize tracking-tight text-balance">
                {currentData.tags.room}
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
              <div className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">En vivo</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Radio className="w-3.5 h-3.5" />
                <span>Distancia</span>
              </div>
              <p className="text-2xl font-bold">{currentData.fields.distance}m</p>
              <p className="text-xs text-muted-foreground">{getSignalStrength(currentData.fields.rssi)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="w-3.5 h-3.5" />
                <span>RSSI</span>
              </div>
              <p className="text-2xl font-bold font-mono">{currentData.fields.rssi}</p>
              <p className="text-xs text-muted-foreground">dBm</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Battery className={`w-3.5 h-3.5 ${getBatteryColor(currentData.fields.battery_level)}`} />
                <span>Batería</span>
              </div>
              <p className={`text-2xl font-bold ${getBatteryColor(currentData.fields.battery_level)}`}>
                {currentData.fields.battery_level}%
              </p>
              <p className="text-xs text-muted-foreground">
                {currentData.fields.battery_level > 20 ? "Normal" : "Baja"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Última actualización</span>
              </div>
              <p className="text-2xl font-bold">{timeAgo(currentData.time)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(currentData.time).toLocaleTimeString("es", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Sensor Info */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Sensor ID:</span>
                <code className="px-1.5 py-0.5 rounded bg-muted/50 font-mono text-[10px]">
                  {currentData.tags.sensor_id}
                </code>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Pet ID:</span>
                <code className="px-1.5 py-0.5 rounded bg-muted/50 font-mono text-[10px]">
                  {currentData.tags.pet_id}
                </code>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">MAC:</span>
                <code className="px-1.5 py-0.5 rounded bg-muted/50 font-mono text-[10px]">
                  {currentData.fields.mac_address}
                </code>
              </div>
            </div>
          </div>
        </Card>

        {/* Distribution Chart */}
        <Card className="p-6 bg-gradient-to-br from-card via-card to-card/50 border-border/50 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Distribución de Tiempo</h3>
            <p className="text-xs text-muted-foreground">Últimas 20 lecturas</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {roomDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                          <p className="text-sm font-medium capitalize">{payload[0].name}</p>
                          <p className="text-xs text-muted-foreground">
                            {payload[0].value} lecturas ({Math.round((payload[0].value / 20) * 100)}%)
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {roomDistribution.map((room) => (
              <div key={room.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
                  <span className="capitalize">{room.name}</span>
                </div>
                <span className="font-mono text-muted-foreground">{Math.round((room.value / 20) * 100)}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Next Update Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span>Próxima Actualización</span>
          </div>
          <p className="text-5xl font-bold font-mono tracking-tight mb-2">{timeUntilNext()}</p>
          <p className="text-xs text-muted-foreground">
            {nextUpdate.toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </Card>
      </div>
    </div>
  )
}
