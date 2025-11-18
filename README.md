# Indoor Location Tracking System

Sistema de monitoreo en tiempo real de localización indoor usando sensores ESP32 e InfluxDB.

## Estructura del Proyecto

\`\`\`
indoor-location-tracker/
├── backend/           # API REST con Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── services/
│   ├── .env.example
│   └── package.json
│
└── frontend/          # Dashboard con Next.js
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── lib/
    │   └── types/
    ├── .env.local.example
    └── package.json
\`\`\`

## Configuración y Ejecución

### 1. Backend (API)

\`\`\`bash
cd backend
npm install
\`\`\`

Crea un archivo `.env` basado en `.env.example`:

\`\`\`env
PORT=3001
INFLUXDB_URL=https://us-east-1-1.aws.cloud2.influxdata.com
INFLUXDB_TOKEN=GfintTt1N5AK2gZIJm4LTHDmQDCRuFHpk2GQ-3y4SKYuvXgexQQjdLJUdx-fAYIrPkJX4_UgNr2v69DYBEqSwQ==
INFLUXDB_ORG=94f71b941204e5fb
INFLUXDB_BUCKET=favila_project_indoorLocation
\`\`\`

Ejecuta el servidor:

\`\`\`bash
npm run dev
\`\`\`

El servidor estará en `http://localhost:3001`

### 2. Frontend (Dashboard)

En otra terminal:

\`\`\`bash
cd frontend
npm install
\`\`\`

Crea un archivo `.env.local`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

Ejecuta el dashboard:

\`\`\`bash
npm run dev
\`\`\`

El dashboard estará en `http://localhost:3000`

## API Endpoints

- `GET /api/sensor-data/latest` - Obtiene la última lectura del sensor
- `GET /api/sensor-data/history?hours=24` - Obtiene historial de lecturas
- `GET /api/sensor-data/stats` - Obtiene estadísticas agregadas

## Tecnologías

- **Backend**: Node.js, Express, InfluxDB Client, CORS
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, Recharts
- **Database**: InfluxDB (Time Series)
