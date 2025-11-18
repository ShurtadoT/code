export interface SensorData {
  device: string;
  location: string;
  distance: number;
  rssi: number;
  signal_strength: number;
  timestamp: string;
}

export interface HistoricalDataResponse {
  count: number;
  hours: number;
  data: SensorData[];
}

export interface LocationStats {
  hours: number;
  total_readings: number;
  by_location: Record<string, number>;
}
