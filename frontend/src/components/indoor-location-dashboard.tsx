'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Signal, MapPin, Battery, Radio, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { SensorData, HistoricalDataResponse, LocationStats } from '@/types/sensor-types';
import { fetchLatestReading, fetchHistoricalData, fetchLocationStats } from '@/lib/api-client';

export default function IndoorLocationDashboard() {
  const [latestReading, setLatestReading] = useState<SensorData | null>(null);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [noData, setNoData] = useState(false);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats | null>(null);
  const [setIsLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 40000); // Actualizar cada 40 segundos
    return () => clearInterval(interval);
  }, []);

async function loadAllData() {
  try {
    setError(null);
    setNoData(false);
    setIsLoading(true);

    const [latest, historical, stats] = await Promise.all([
      fetchLatestReading(),
      fetchHistoricalData(24),
      fetchLocationStats(24),
    ]);

    if (!latest) {
      // No hay datos recientes -> mostrar mensaje amigable, no error rojo
      setNoData(true);
      setLatestReading(null);
      setHistoricalData(historical);
      setLocationStats(stats);
      return;
    }

    setLatestReading(latest);
    setHistoricalData(historical);
    setLocationStats(stats);
  } catch (err) {
    setError('Error al conectar con la API');
  } finally {
    setIsLoading(false);
  }
}


  const getSignalQuality = (rssi: number): { label: string; color: string } => {
    if (rssi >= -50) return { label: 'Excelente', color: 'text-emerald-400' };
    if (rssi >= -60) return { label: 'Buena', color: 'text-blue-400' };
    if (rssi >= -70) return { label: 'Regular', color: 'text-yellow-400' };
    return { label: 'Débil', color: 'text-red-400' };
  };

  const getBatteryColor = (level: number): string => {
    if (level >= 70) return 'text-emerald-400';
    if (level >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const locationChartData = locationStats?.by_location
    ? Object.entries(locationStats.by_location).map(([location, count]) => ({
        location,
        readings: count,
      }))
    : [];

  const rssiChartData = historicalData.slice(-20).map((item) => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    rssi: item.rssi,
    distance: item.distance,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando datos del sensor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md p-6 bg-card rounded-lg border border-border">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error de Conexión</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadAllData}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!latestData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <Signal className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const signalQuality = getSignalQuality(latestData.rssi);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              Indoor Location Tracker
            </h1>
            <p className="text-muted-foreground mt-1">Sistema de Monitoreo ESP32 en Tiempo Real</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow" />
            <span className="text-sm text-emerald-400 font-medium">En Vivo</span>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Location */}
          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Ubicación</span>
            </div>
            <p className="text-3xl font-bold text-foreground capitalize">{latestData.location}</p>
            <p className="text-sm text-muted-foreground mt-1">{latestData.device}</p>
          </div>

          {/* Distance */}
          <div className="bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Distancia</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{latestData.distance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">metros al sensor</p>
          </div>

          {/* Signal Strength */}
          <div className="bg-card border border-border rounded-xl p-5 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Signal className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Señal</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{latestData.rssi} dBm</p>
            <p className={`text-sm mt-1 ${signalQuality.color} font-medium`}>{signalQuality.label}</p>
          </div>

          {/* Last Update */}
          <div className="bg-card border border-border rounded-xl p-5 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Actualización</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {format(new Date(latestData.timestamp), 'HH:mm:ss')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(latestData.timestamp), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RSSI & Distance Chart */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Signal className="w-5 h-5 text-primary" />
              Historial de Señal (últimos 20 registros)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rssiChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131825',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#e4e8f0',
                  }}
                />
                <Line type="monotone" dataKey="rssi" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="RSSI (dBm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Location Distribution */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Distribución por Ubicación (24h)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="location" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131825',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#e4e8f0',
                  }}
                />
                <Bar dataKey="readings" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Detalles Técnicos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Device ID</p>
              <p className="text-sm font-mono text-foreground">{latestData.device}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Signal Strength</p>
              <p className="text-sm font-mono text-foreground">{latestData.signal_strength} dBm</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Readings (24h)</p>
              <p className="text-sm font-mono text-foreground">{locationStats?.total_readings || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Data Source</p>
              <p className="text-sm font-mono text-accent">InfluxDB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
