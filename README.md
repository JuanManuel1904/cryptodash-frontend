# CryptoDash — Frontend

Dashboard de criptomonedas en tiempo real con WebSockets, construido con React + Vite + Tailwind.

## Stack

- **React + Vite** — bundler y framework
- **Tailwind CSS** — estilos utilitarios
- **Recharts** — gráficas de precios
- **Zustand** — estado global del WebSocket

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Requiere el backend corriendo en `ws://localhost:8000`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_WS_URL` | URL del backend WebSocket |

## Deploy

Ver instrucciones en la Fase 5 del plan de desarrollo.
