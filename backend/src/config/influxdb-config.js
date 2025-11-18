import { InfluxDB } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';

dotenv.config();

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});

const queryApi = influxDB.getQueryApi(process.env.INFLUXDB_ORG);
const bucket = process.env.INFLUXDB_BUCKET;

export { queryApi, bucket };
