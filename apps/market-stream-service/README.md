# Market Stream Service

Real-time cryptocurrency price streaming service built with Go.

## Features

- WebSocket server for real-time price updates
- Fake crypto price generator
- TimescaleDB integration for historical data
- Redis caching for latest prices
- Support for multiple crypto pairs (BTC, ETH, SOL, etc.)

## Tech Stack

- **Language**: Go 1.25+
- **WebSocket**: Gorilla WebSocket
- **Database**: TimescaleDB (PostgreSQL extension)
- **Cache**: Redis
- **HTTP Router**: Gorilla Mux

## Installation

```bash
go mod download
```

## Running

```bash
go run cmd/server/main.go
```

Service will run on `http://localhost:3002`

## API Endpoints

- `GET /api/prices` - Get current prices for all symbols
- `GET /api/prices/:symbol` - Get price for specific symbol
- `GET /api/history/:symbol` - Get historical data
- `WS /ws` - WebSocket connection for real-time updates

## WebSocket Usage

```javascript
const ws = new WebSocket('ws://localhost:3002/ws');

ws.onmessage = (event) => {
  const prices = JSON.parse(event.data);
  console.log(prices);
};
```

## Environment Variables

See `.env.example` for configuration.

## License

MIT
