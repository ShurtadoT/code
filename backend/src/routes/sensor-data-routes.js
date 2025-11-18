import { Router } from 'express';
import sensorDataController from '../controllers/sensor-data-controller.js';

const router = Router();

// GET /api/sensor-data/latest
router.get('/latest', (req, res) => sensorDataController.getLatestReading(req, res));

// GET /api/sensor-data/history
router.get('/history', (req, res) => sensorDataController.getLatestReading1(req, res));

// GET /api/sensor-data/all?hours=24
router.get('/all', (req, res) => sensorDataController.getAllReadings(req, res));

export default router;
  