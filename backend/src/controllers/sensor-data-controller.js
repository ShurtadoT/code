import influxDBService from '../services/influxdb-service.js';

class SensorDataController {
  async getLatestReading(req, res) {
    try {
      const data = await influxDBService.getLatestReading();
      
      if (!data) {
        return res.status(404).json({ 
          error: 'No data found',
          message: 'No sensor readings available in the last hour'
        });
      }

      const formattedData = {
        device: data.device,
        location: data.location,
        distance: data.distance,
        rssi: data.rssi,
        signal_strength: data.signal_strength,
        timestamp: data._time,
      };

      res.json(formattedData);
    } catch (error) {
      console.error('Error in getLatestReading:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  async getLatestReading1(req, res) {
  try {
    const data = await influxDBService.getLatestReading1();
      
    if (!data) {
      return res.status(404).json({ 
        error: 'No data found',
        message: 'No sensor readings available'
      });
    }

    const formattedData = {
      device: data.device,
      location: data.location,
      distance: data.distance,
      rssi: data.rssi,
      signal_strength: data.signal_strength,
      timestamp: data._time,
    };

    res.json(formattedData);
  } catch (error) {
    console.error('Error in getLatestReading1:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}


  // 🔹 NUEVO: TODOS LOS REGISTROS PARA LAS GRÁFICAS
  async getAllReadings(req, res) {
    try {
      const hours = Number(req.query.hours) || 24;

      const data = await influxDBService.getAllReadings(hours);

      if (!data || data.length === 0) {
        return res.status(404).json({
          error: 'No data found',
          message: `No sensor readings available in the last ${hours} hours`,
        });
      }

      // Formateamos cada registro igual que en latest
      const formatted = data.map((row) => ({
        device: row.device,
        location: row.location,
        distance: row.distance,
        rssi: row.rssi,
        signal_strength: row.signal_strength,
        timestamp: row._time,
      }));

      res.json(formatted);
    } catch (error) {
      console.error('Error in getAllReadings:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
}

export default new SensorDataController();
