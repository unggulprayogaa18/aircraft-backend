// src/types.ts

// Struct yang dikirim ke frontend
export interface Aircraft {
 callsign: string;
 lat: number;
 lng: number;
 altitude: number;
 speed: number;
 heading: number;
 // Track key untuk ambil rute
 tk: string;
}

// --- Tipe untuk GeoJSON dari API tracker ---

export interface GeoJSONResponse {
 type: string;
 features: Feature[];
}

export interface Feature {
 type: string;
 geometry: Geometry;
 properties: Property;
}

export interface Geometry {
 type: string;
 coordinates: number[]; // [lng, lat]
}

export interface Property {
 name: string;      // Callsign
 trk: number;      // Heading
 popupContent: string;  // HTML (Altitude, Speed, dsb)
 tk: string;       // <-- Kunci unik
}