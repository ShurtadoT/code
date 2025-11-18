export interface Pet {
  id: string
  user_id: string
  name: string
  species: string | null
  breed: string | null
  age: number | null
  weight: number | null
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  user_id: string
  name: string
  description: string | null
  floor_level: number
  created_at: string
  updated_at: string
}

export interface Prediction {
  id: string
  pet_id: string
  location_id: string | null
  confidence: number | null
  timestamp: string
  created_at: string
  location?: Location
  pet?: Pet
}

export interface LocationStats {
  location: string
  count: number
  percentage: string
}
