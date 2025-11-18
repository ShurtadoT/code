import { queryApi, bucket } from '../config/influxdb-config.js';

class InfluxDBService {
  async getLatestReading() {
    const query = `
      from(bucket: "${bucket}")
        |> range(start: -40s)
        |> filter(fn: (r) => r["_measurement"] == "pet_location")
        |> last()
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    try {
      const result = await this.executeQuery(query);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching latest reading:', error);
    }
  }

  async getHistoricalData(hours = 24) {
    const query = `
      from(bucket: "${bucket}")
        |> range(start: -${hours}h)
        |> filter(fn: (r) => r["_measurement"] == "pet_location")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: false)
    `;

    try {
      return await this.executeQuery(query);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  async getLocationStats(hours = 24) {
    const query = ` 
      from(bucket: "${bucket}")
        |> range(start: -${hours}h)
        |> filter(fn: (r) => r["_measurement"] == "pet_location")
        |> filter(fn: (r) => r["_field"] == "distance")
        |> group(columns: ["location"])
        |> count()
    `;

    try {
      return await this.executeQuery(query);
    } catch (error) {
      console.error('Error fetching location stats:', error);
      throw error;
    }
  }

  async executeQuery(fluxQuery) {
    const rows = [];
    
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const record = tableMeta.toObject(row);
          rows.push(record);
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(rows);
        },
      });
    });
  }
}

export default new InfluxDBService();
