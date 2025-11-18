import { SensorData, HistoricalDataResponse, LocationStats } from '@/types/sensor-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchLatestReading(): Promise<SensorData | null> {
  const response = await fetch(`${API_URL}/api/sensor-data/latest`);

  // 404 = no hay lecturas recientes → lo tratamos como "sin datos"
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch latest reading: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchHistoryReading(): Promise<SensorData | null> {
  const response = await fetch(`${API_URL}/api/sensor-data/history`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch history reading: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAllReadings(hours: number = 24): Promise<SensorData[]> {
  const response = await fetch(`${API_URL}/api/sensor-data/all?hours=${hours}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch all readings: ${response.statusText}`);
  }

  return response.json();
}
