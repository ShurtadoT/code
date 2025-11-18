'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Signal, MapPin, Radio, Clock, TrendingUp, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { SensorData } from '@/types/sensor-types';
import { fetchLatestReading, fetchHistoryReading, fetchAllReadings } from '@/lib/api-client';

// Colores base para el pie chart
const PIE_COLORS_DARK = ['#ffffff', '#e5e7eb', '#d4d4d8', '#a3a3a3', '#737373', '#525252'];
const PIE_COLORS_LIGHT = ['#111827', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'];

// Colores para las barras
const BAR_COLORS_DARK = ['#f97316', '#22c55e', '#38bdf8', '#eab308', '#f87171', '#a855f7'];
const BAR_COLORS_LIGHT = ['#7c2d12', '#14532d', '#0f172a', '#854d0e', '#7f1d1d', '#4c1d95'];


export default function IndoorLocationDashboard() {
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [allReadings, setAllReadings] = useState<SensorData[]>([]);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [noData, setNoData] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Tema inicial según hora
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 19) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }, []);

  const isDark = theme === 'dark';

  const bgClass = isDark
    ? 'bg-neutral-950 text-neutral-100'
    : 'bg-stone-100 text-neutral-900';

  const cardClass = isDark
    ? 'bg-neutral-900/85 border border-neutral-800 shadow-[0_0_0_1px_rgba(15,23,42,0.8)]'
    : 'bg-stone-50 border border-stone-200 shadow-sm';

  const subtleTextClass = isDark ? 'text-neutral-400' : 'text-neutral-500';

  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#111827' : '#e5e7eb';
  const tooltipBg = isDark ? '#020617' : '#f9fafb';
  const tooltipBorder = isDark ? '#1f2937' : '#e5e7eb';

  // Colores dinámicos para las gráficas
  const barFill = isDark ? '#ffffff' : '#111827';
  const lineColor = isDark ? '#ffffff' : '#111827';
  const pieColors = isDark ? PIE_COLORS_DARK : PIE_COLORS_LIGHT;
  const barColors = isDark ? BAR_COLORS_DARK : BAR_COLORS_LIGHT; 
  const tooltipTextColor = isDark ? '#f9fafb' : '#111827';

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 40000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      setError(null);
      setNoData(false);
      setIsLoading(true);

      const [latest, historyLatest, all] = await Promise.all([
        fetchLatestReading().catch(() => null),
        fetchHistoryReading().catch(() => null),
        fetchAllReadings(24).catch(() => [] as SensorData[]),
      ]);

      const safeAll = all || [];
      setAllReadings(safeAll);

      if (!latest && !historyLatest && safeAll.length === 0) {
        setNoData(true);
        setLatestData(null);
        setIsLive(false);
        return;
      }

      const effectiveLatest =
        latest || historyLatest || safeAll[safeAll.length - 1] || null;

      setLatestData(effectiveLatest);
      setIsLive(!!latest);
    } catch (err) {
      console.error(err);
      setError('Error al conectar con la API');
    } finally {
      setIsLoading(false);
    }
  }

  const getSignalQuality = (rssi: number): { label: string; color: string } => {
    if (rssi >= -50) return { label: 'Excelente', color: 'text-emerald-400' };
    if (rssi >= -60) return { label: 'Buena', color: 'text-lime-300' };
    if (rssi >= -70) return { label: 'Regular', color: 'text-amber-400' };
    return { label: 'Débil', color: 'text-rose-400' };
  };

  const signalQuality = latestData ? getSignalQuality(latestData.rssi) : null;

  // ======== DATA PARA GRÁFICAS (24h) ========

  const lineChartData = allReadings.map((item) => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    rssi: item.rssi,
  }));

  const locationCounts: Record<string, number> = allReadings.reduce(
    (acc, item) => {
      const key = item.location || 'desconocida';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const barChartData = Object.entries(locationCounts).map(([location, count]) => ({
    location,
    count,
  }));

  const totalReadings = allReadings.length || 1;
  const pieChartData = Object.entries(locationCounts).map(([location, count]) => ({
    name: location,
    value: count,
    percentage: (count / totalReadings) * 100,
  }));

  // ======== RENDER CONDICIONAL ========

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass}`}>
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin mx-auto" />
          <p className={`text-sm ${subtleTextClass}`}>Cargando datos del sensor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass}`}>
        <div className={`w-full max-w-md p-6 rounded-2xl space-y-4 ${cardClass}`}>
          <h2 className="text-lg font-semibold text-rose-400">Error de conexión</h2>
          <p className={`text-sm ${subtleTextClass}`}>{error}</p>
          <button
            onClick={loadData}
            className="w-full px-4 py-2 text-sm rounded-lg bg-neutral-800 text-neutral-100 hover:bg-neutral-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (noData || !latestData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass}`}>
        <div className="text-center space-y-3">
          <Signal className="w-10 h-10 mx-auto text-neutral-500" />
          <p className={`text-sm ${subtleTextClass}`}>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  // ======== DASHBOARD ========

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
      {/* Panel central centrado con espacio alrededor */}
      <div className="w-full max-w-5xl mx-auto px-6 lg:px-10 py-10 space-y-10">
        {/* Header + tema */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                  isDark
                    ? 'border-neutral-700 bg-neutral-900'
                    : 'border-stone-300 bg-stone-100'
                }`}
              >
                <Radio className="w-5 h-5 text-neutral-300" />
              </div>
              Indoor Location Tracker
            </h1>
            <p className={`text-xs md:text-sm ${subtleTextClass}`}>
              Monitoreo en tiempo real de ubicación y señal del dispositivo ESP32.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${
                isDark
                  ? 'border-neutral-700 bg-neutral-900'
                  : 'border-stone-300 bg-stone-50'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className={subtleTextClass}>
                {isLive ? 'En vivo (últimos 40s)' : 'Modo histórico'}
              </span>
            </div>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${
                isDark
                  ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800'
                  : 'border-stone-300 bg-stone-50 hover:bg-stone-200'
              } transition-colors`}
            >
              {isDark ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Modo noche</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Modo día</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* 1. Cards principales */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className={`rounded-2xl p-4 space-y-3 ${cardClass}`}>
            <div className="flex items-center justify-between text-xs uppercase tracking-wide">
              <span className={subtleTextClass}>Ubicación</span>
              <MapPin className="w-4 h-4 text-neutral-300" />
            </div>
            <p className="text-xl font-semibold capitalize truncate">{latestData.location}</p>
            <p className={`text-xs truncate ${subtleTextClass}`}>
              Device: {latestData.device}
            </p>
          </div>

          <div className={`rounded-2xl p-4 space-y-3 ${cardClass}`}>
            <div className="flex items-center justify-between text-xs uppercase tracking-wide">
              <span className={subtleTextClass}>Distancia</span>
              <TrendingUp className="w-4 h-4 text-neutral-300" />
            </div>
            <p className="text-xl font-semibold">
              {latestData.distance.toFixed(2)} m
            </p>
            <p className={`text-xs ${subtleTextClass}`}>Distancia estimada al sensor</p>
          </div>

          <div className={`rounded-2xl p-4 space-y-3 ${cardClass}`}>
            <div className="flex items-center justify-between text-xs uppercase tracking-wide">
              <span className={subtleTextClass}>Señal (RSSI)</span>
              <Signal className="w-4 h-4 text-neutral-300" />
            </div>
            <p className="text-xl font-semibold">{latestData.rssi} dBm</p>
            {signalQuality && (
              <p className={`text-xs font-medium ${signalQuality.color}`}>
                {signalQuality.label}
              </p>
            )}
          </div>

          <div className={`rounded-2xl p-4 space-y-3 ${cardClass}`}>
            <div className="flex items-center justify-between text-xs uppercase tracking-wide">
              <span className={subtleTextClass}>Última lectura</span>
              <Clock className="w-4 h-4 text-neutral-300" />
            </div>
            <p className="text-sm font-medium">
              {format(new Date(latestData.timestamp), 'HH:mm:ss')}
            </p>
            <p className={`text-xs ${subtleTextClass}`}>
              {format(new Date(latestData.timestamp), 'dd/MM/yyyy')}
            </p>
          </div>
        </section>

        {/* 2. Gráficos principales: barras + pastel */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Barras */}
          <div className={`rounded-2xl p-5 ${cardClass}`}>
            <h3 className="text-sm font-semibold mb-4">Lecturas por ubicación (24h)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 24, left: 8, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="location"
                    stroke={axisColor}
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke={axisColor}
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: 8,
                      fontSize: 11,
                      color: tooltipTextColor,
                    }}
                    labelStyle={{
                      color: tooltipTextColor,
                      fontSize: 11,
                    }}
                    itemStyle={{
                      color: tooltipTextColor,
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {barChartData.map((_entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={barColors[index % barColors.length]}  
                        />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pastel */}
          <div className={`rounded-2xl p-5 ${cardClass}`}>
            <h3 className="text-sm font-semibold mb-4">
              Distribución de lecturas por ubicación
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 24, left: 24, bottom: 10 }}>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={82}
                    innerRadius={48}
                    paddingAngle={2}
>
                    {pieChartData.map((_entry, index) => (
                      <Cell
                        key={`slice-${index}`}
                        fill={barColors[index % barColors.length]}   // 👈 aquí usas la misma paleta
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, _name: any, props: any) => {
                      const pct = props.payload.percentage.toFixed(1);
                      return [`${value} lecturas (${pct}%)`, 'Ubicación'];
                    }}
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: 8,
                      fontSize: 11,
                      color: tooltipTextColor,
                    }}
                    labelStyle={{
                      color: tooltipTextColor,
                      fontSize: 11,
                    }}
                    itemStyle={{
                      color: tooltipTextColor,
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    layout="horizontal"
                    formatter={(value) => (
                      <span
                        style={{
                          fontSize: 11,
                          color: isDark ? '#9ca3af' : '#6b7280',
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 3. RSSI en el tiempo */}
        <section className={`rounded-2xl p-5 ${cardClass}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              RSSI en el tiempo (últimas 24 horas)
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
                margin={{ top: 10, right: 24, left: 8, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="time"
                  stroke={axisColor}
                  tick={{ fontSize: 10 }}
                  minTickGap={16}
                />
                <YAxis
                  stroke={axisColor}
                  tick={{ fontSize: 10 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 8,
                    fontSize: 11,
                    color: tooltipTextColor,
                  }}
                  labelStyle={{
                    color: tooltipTextColor,
                    fontSize: 11,
                  }}
                  itemStyle={{
                    color: tooltipTextColor,
                    fontSize: 11,
                  }}
                  labelFormatter={(label) => `Hora: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="rssi"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={{ r: 2, stroke: lineColor, fill: lineColor }}
                  name="RSSI (dBm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 4. Detalles técnicos */}
        <section className={`rounded-2xl p-5 mb-4 ${cardClass}`}>
          <h3 className="text-sm font-semibold mb-4">Detalles técnicos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                Device ID
              </p>
              <p className="font-mono truncate">{latestData.device}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                Signal Strength
              </p>
              <p className="font-mono">{latestData.signal_strength} dBm</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                Total lecturas (24h)
              </p>
              <p className="font-mono">{allReadings.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                Data source
              </p>
              <p className="font-mono">InfluxDB (últimas 24h)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
