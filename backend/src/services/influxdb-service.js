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
      return null;
    }
  }

async getLatestReading1() {
  const query = `
    from(bucket: "${bucket}")
      |> range(start: 0)  // TODO el historial
      |> filter(fn: (r) => r["_measurement"] == "pet_location")
      |> pivot(
          rowKey: ["_time"],
          columnKey: ["_field"],
          valueColumn: "_value"
        )
  `;

  try {
    const rows = await this.executeQuery(query);

    if (!rows || rows.length === 0) {
      return null;
    }

    // Buscar en JS la fila con timestamp (_time) más reciente
    let latest = rows[0];
    for (const row of rows) {
      if (new Date(row._time) > new Date(latest._time)) {
        latest = row;
      }
    }

    return latest; // ← este es el ÚLTIMO dato real
  } catch (error) {
    console.error('Error fetching latest reading 1:', error);
    return null;
  }
}





  async getAllReadings(hours = 24) {
    const query = `
      from(bucket: "${bucket}")
        |> range(start: -${hours}h)
        |> filter(fn: (r) => r["_measurement"] == "pet_location")
        |> sort(columns: ["_time"], desc: false)
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    try {
      const result = await this.executeQuery(query);
      return result; // array de lecturas
    } catch (error) {
      console.error('Error fetching all readings:', error);
      return [];
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
