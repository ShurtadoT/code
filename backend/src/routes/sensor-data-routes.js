import { Router } from 'express';
import sensorDataController from '../controllers/sensor-data-controller.js';

const router = Router();

// GET http://localhost:3001/api/sensor-data/latest
router.get('/latest', (req, res) => {
  sensorDataController.getLatestReading(req, res);
});

// GET http://localhost:3001/api/sensor-data/history?hours=24
router.get('/history', (req, res) => {
  sensorDataController.getHistoricalData(req, res);
});

// GET http://localhost:3001/api/sensor-data/stats?hours=24
router.get('/stats', (req, res) => {
  sensorDataController.getLocationStats(req, res);
});

export default router;
