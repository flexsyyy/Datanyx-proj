// Live sensor status API
export const API_URL = "https://a9tpfpdyxh.execute-api.ap-south-1.amazonaws.com/status";

// Dataset API (FINALDATASET2.csv from S3 via Lambda)
export const DATASET_API_URL = import.meta.env.VITE_FUNGI_DATASET_API || "https://wcwmzfhxsc.execute-api.ap-south-1.amazonaws.com/prod/dataset";

export function getApiHost(url: string = API_URL): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function getAwsRegionFromHost(host: string): string | null {
  // e.g., execute-api.ap-south-1.amazonaws.com
  const match = host.match(/execute-api\.([^.]+)\.amazonaws\.com/i);
  return match ? match[1] : null;
}

// Fetch fungi dataset from AWS API
export interface FungiRow {
  timestamp: string;
  humidity_pct: number;
  CO2_ppm: number;
  substrate_moisture_pct: number;
  light_lux: number;
  water_quality_index: number;
  temp_C: number;
  harvest_cycle: number;
  mushroom_variety: string;
}

export interface FetchDatasetOptions {
  species?: string;
  limit?: number;
}

export async function fetchFungiDataset(options: FetchDatasetOptions = {}): Promise<FungiRow[]> {
  const { species, limit = 200 } = options;
  
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (species) {
    params.set('species', species);
  }
  
  const url = `${DATASET_API_URL}?${params.toString()}`;
  
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset: HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  // Handle both array and object with data property
  if (Array.isArray(data)) {
    return data;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data.body) {
    // Lambda may return stringified JSON in body
    const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    return Array.isArray(parsed) ? parsed : parsed.data || [];
  }
  
  return [];
}


