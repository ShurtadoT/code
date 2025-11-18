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


export async function fetchHistoricalData(hours: number = 24): Promise<HistoricalDataResponse> {
  const response = await fetch(`${API_URL}/api/sensor-data/history?hours=${hours}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch historical data: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchLocationStats(hours: number = 24): Promise<LocationStats> {
  const response = await fetch(`${API_URL}/api/sensor-data/stats?hours=${hours}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch location stats: ${response.statusText}`);
  }
  
  return response.json();
}
