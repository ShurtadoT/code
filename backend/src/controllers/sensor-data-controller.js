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

  async getHistoricalData(req, res) {
    try {
      const hours = parseInt(req.query.hours) || 24;
      
      if (hours < 1 || hours > 168) {
        return res.status(400).json({ 
          error: 'Invalid hours parameter',
          message: 'Hours must be between 1 and 168 (1 week)'
        });
      }

      const data = await influxDBService.getHistoricalData(hours);
      
      const formattedData = data.map(record => ({
        device: record.device,
        location: record.location,
        distance: record.distance,
        rssi: record.rssi,
        signal_strength: record.signal_strength,
        timestamp: record._time,
      }));

      res.json({
        count: formattedData.length,
        hours: hours,
        data: formattedData
      });
    } catch (error) {
      console.error('Error in getHistoricalData:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  async getLocationStats(req, res) {
    try {
      const hours = parseInt(req.query.hours) || 24;
      const stats = await influxDBService.getLocationStats(hours);
      
      const formattedStats = stats.reduce((acc, record) => {
        const location = record.location;
        if (!acc[location]) {
          acc[location] = 0;
        }
        acc[location] += record._value;
        return acc;
      }, {});

      res.json({
        hours: hours,
        total_readings: Object.values(formattedStats).reduce((a, b) => a + b, 0),
        by_location: formattedStats
      });
    } catch (error) {
      console.error('Error in getLocationStats:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
}

export default new SensorDataController();
