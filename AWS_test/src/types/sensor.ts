export type SensorStatus = "good" | "warning" | "bad";

export interface SensorReading {
  device_id: string;
  mushroom_type: string;
  timestamp: string;
  temperature_c: number;
  humidity_pct: number;
  co2_ppm: number;
  light_lux: number;
  status: SensorStatus;
}

export interface ApiResponse {
  data: SensorReading[];
}


