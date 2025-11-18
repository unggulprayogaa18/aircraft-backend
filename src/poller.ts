// src/poller.ts

import axios from "axios";
import type { Aircraft, GeoJSONResponse } from "./types.js";

const DATA_URL = "https://tx.ozrunways.com/tx/geo";

const BROWSER_HEADERS = {
"User-Agent": "Mozilla/5.0",
"Referer": "https://tx.ozrunways.com/",
"Accept": "application/json, text/javascript, */*; q=0.01",
"X-Requested-With": "XMLHttpRequest",
};

/** Ekstrak value dari HTML popupContent. */
function extractFromPopup(html: string, key: string): number {
const searchKey = new RegExp(`<dt>${key}</dt><dd>(.*?)</dd>`);
let match = html.match(searchKey);

// fallback untuk "Speed" (karena API menggunakan "Speed")
if (!match && (key === "Groundspeed" || key === "Speed")) {
const speedKey = new RegExp(`<dt>Speed</dt><dd>(.*?)</dd>`);
match = html.match(speedKey);
}

if (!match || !match[1]) return 0;

const valueStr = match[1].replace(/ ft| kts|,/g, "");
const parsed = parseInt(valueStr, 10);
return isNaN(parsed) ? 0 : parsed;
}

/** Fetch data pesawat (flight positions). */
export async function fetchAircraftData(): Promise<Aircraft[]> {
try {
const response = await axios.get<GeoJSONResponse>(DATA_URL, {
headers: BROWSER_HEADERS,
timeout: 10000,
});

const geoData = response.data;
const aircraftList: Aircraft[] = [];

if (!geoData?.features) return [];

for (const feature of geoData.features) {
const lng = feature.geometry.coordinates?.[0];
const lat = feature.geometry.coordinates?.[1];

// Pastikan koordinat & tk valid
if (lng === undefined || lat === undefined || !feature.properties.tk) {
continue;
}

const altitude = extractFromPopup(feature.properties.popupContent, "Altitude");
const speed = extractFromPopup(feature.properties.popupContent, "Speed");

aircraftList.push({
callsign: feature.properties.name,
lat: lat,
lng: lng,
altitude,
speed,
heading: Math.round(feature.properties.trk || 0),
tk: feature.properties.tk, // <-- teruskan tk
});
}

return aircraftList;
} catch (error) {
console.error("Fetch aircraft error:", error);
return [];
}
}