// src/server.ts

import { WebSocketServer, WebSocket } from 'ws';
import { fetchAircraftData } from './poller.js';
import express from 'express'; // BARU
import http from 'http';       // BARU
import cors from 'cors';       // BARU
import axios from 'axios';     // BARU

// --- Konfigurasi ---
// Render akan menyuntikkan process.env.PORT
const PORT = process.env.PORT || 8080;
const POLLING_INTERVAL = 5000; // 5 detik
const API_PLAN_URL = "https://tx.ozrunways.com/tx/plan?key=";
const API_BROWSER_HEADERS = { // (Kita perlukan ini untuk axios)
 "User-Agent": "Mozilla/5.0",
 "Referer": "https://tx.ozrunways.com/",
 "Accept": "application/json, text/javascript, */*; q=0.01",
 "X-Requested-With": "XMLHttpRequest",
};

// --- Setup Server HTTP Express ---
const app = express();
// Izinkan frontend Anda (misal localhost:3000) untuk mengakses backend ini
app.use(cors()); 
const server = http.createServer(app);

// --- Endpoint BARU untuk mengambil Rute (Proxy) ---
app.get('/plan', async (req, res) => {
 const { key } = req.query; // Mengambil 'tk' dari query (cth: /plan?key=abcde)

 if (!key) {
  return res.status(400).send('Parameter "key" (tk) dibutuhkan');
 }

 console.log(`[HTTP] Mengambil rute untuk tk: ${key}`);
 try {
  // Backend Anda memanggil API OzRunways (Server-ke-Server, BEBAS CORS)
  const response = await axios.get(`${API_PLAN_URL}${key}`, {
   headers: API_BROWSER_HEADERS
  });
  // Kirim data rute kembali ke frontend Anda
  res.json(response.data);
 } catch (error) {
    console.error("Gagal fetch rute:", error);

    // --- LOGIKA PERBAIKAN ERROR ---
    if (axios.isAxiosError(error) && error.response) {
        // Jika error dari Axios dan ada respons dari server eksternal
        return res.status(error.response.status).send({
            message: `Gagal dari OzRunways (${error.response.status}): ${error.response.statusText}`,
            detail: error.response.data
        });
    }

    // Default error handling jika bukan error HTTP
    res.status(500).send('Gagal mengambil rute dari server eksternal');
}
});

// --- Setup WebSocket Server ---
// 'Tempelkan' server WebSocket ke server HTTP Express
const wss = new WebSocketServer({ server });

console.log(`🚀 Server HTTP & WebSocket dimulai di port ${PORT}`);

// Logika WebSocket (TETAP SAMA)
wss.on('connection', ws => {
 console.log('[WS] Client terhubung');
 ws.on('message', message => {
  console.log('[WS] Menerima pesan: %s', message);
 });
 ws.on('close', () => {
  console.log('[WS] Client terputus');
 });
 ws.on('error', error => {
  console.error('[WS] WebSocket error:', error);
 });
});

function broadcast(data: any) {
 const jsonData = JSON.stringify(data);
 wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
   client.send(jsonData, (err) => {
    if (err) {
     console.error('[WS] Error saat mengirim data ke client:', err);
    }
   });
  }
 });
}

async function startPolling() {
 console.log("[Poller] Memulai Poller...");
 
 const poll = async () => {
  try {
   const aircraft = await fetchAircraftData();
   
   if (aircraft.length > 0) {
    console.log(`[Poller] Mengambil data ${aircraft.length} pesawat. Menyebarkan ke klien...`);
    broadcast(aircraft);
   } else {
    console.log(`[Poller] Tidak ada data pesawat yang diambil.`);
   }
  } catch (error) {
   if (error instanceof Error) {
    console.error("[Poller] Error dalam siklus polling:", error.message);
   } else {
    console.error("[Poller] Error dalam siklus polling:", String(error));
   }
  } finally {
   setTimeout(poll, POLLING_INTERVAL);
  }
 };
 poll();
}

// Mulai server HTTP (yang juga menyalakan WebSocket)
server.listen(PORT, () => {
 startPolling();
});