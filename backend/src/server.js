import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sensorDataRoutes from './routes/sensor-data-routes.js';
import sensorDataController from './controllers/sensor-data-controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// LOG básico para ver qué llega
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 🔹 Rutas directas (para eliminar dudas del router)
app.get('/api/sensor-data/latest', (req, res) => {
  sensorDataController.getLatestReading(req, res);
});

app.get('/api/sensor-data/history', (req, res) => {
  sensorDataController.getHistoricalData(req, res);
});

app.get('/api/sensor-data/stats', (req, res) => {
  sensorDataController.getLocationStats(req, res);
});

// 🔹 (Opcional) si quieres seguir usando el router también
app.use('/api/sensor-data', sensorDataRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
