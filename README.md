# MarketHub 🚀

Enterprise-grade microservices platform with real-time crypto streaming, high-load booking system, task management, and full DevOps pipeline.

## 🏗️ Architecture

MarketHub follows a **microservices architecture** pattern with:

- **API Gateway** (Nginx) for routing and load balancing
- **Auth Service** (NestJS) for authentication and authorization
- **Market Stream Service** (Go) for real-time crypto price streaming
- **Booking Service** (FastAPI) for high-load VIP analyst booking
- **Task Service** (Django) for workflow and task management
- **Frontend** (Next.js) for modern, reactive user interface

## 🛠️ Tech Stack

### Backend Services
- **Auth Service**: NestJS + PostgreSQL + Prisma + JWT + OAuth2
- **Market Stream**: Go + WebSocket + TimescaleDB + Redis
- **Booking Service**: FastAPI + PostgreSQL + Redis (Distributed Locks)
- **Task Service**: Django + MongoDB + Celery + RabbitMQ

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI**: Tailwind CSS + ShadcnUI
- **State**: Zustand
- **Real-time**: Socket.io

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (Minikube locally)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **IaC**: Terraform

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **Python** >= 3.10
- **Go** >= 1.21 (optional, for Market Stream Service)
- **Docker Desktop** (required for databases)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/markethub.git
cd markethub
```

### 2. Install Dependencies

```bash
# Install root dependencies (Turborepo)
npm install

# Navigate to Auth Service and install
cd apps/auth-service
npm install
cp .env.example .env
```

### 3. Start Databases (Docker)

You need Docker Desktop running!

```bash
# From root directory
docker-compose up -d postgres redis mongodb timescaledb rabbitmq

# Check if all containers are running
docker ps
```

### 4. Setup Auth Service Database

```bash
cd apps/auth-service

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Auth Service

```bash
# Development mode (from auth-service directory)
npm run start:dev
```

The Auth Service will be available at `http://localhost:3001`

### 6. Test the API

```bash
# Health check
curl http://localhost:3001/auth/health

# Register a new user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## 📦 Project Structure

```
MarketHub/
├── apps/                          # Microservices
│   ├── auth-service/             # ✅ NestJS Authentication
│   ├── market-stream-service/    # 🔜 Go WebSocket Streaming
│   ├── booking-service/          # 🔜 FastAPI High-Load Booking
│   ├── task-service/             # 🔜 Django Task Management
│   └── frontend/                 # 🔜 Next.js Frontend
├── packages/                      # Shared packages
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Common utilities
│   └── config/                   # Shared configurations
├── infrastructure/                # DevOps
│   ├── docker/                   # Docker configs
│   ├── k8s/                      # Kubernetes manifests
│   ├── terraform/                # Infrastructure as Code
│   └── monitoring/               # Observability
├── docker-compose.yml            # Local development
└── README.md                     # This file
```

## 🔑 API Endpoints

### Auth Service (`http://localhost:3001`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| GET | `/auth/me` | Get current user | Yes (JWT) |
| GET | `/auth/admin-only` | Admin only endpoint | Yes (JWT + Admin role) |
| GET | `/auth/health` | Health check | No |

## 🗄️ Database Setup

All databases run in Docker containers. Connection strings:

- **PostgreSQL (Auth)**: `postgresql://markethub:markethub_password@localhost:5432/markethub_auth`
- **PostgreSQL (Booking)**: `postgresql://markethub:markethub_password@localhost:5432/markethub_booking`
- **TimescaleDB (Market Data)**: `postgresql://markethub:markethub_password@localhost:5433/markethub_market`
- **MongoDB (Tasks)**: `mongodb://markethub:markethub_password@localhost:27017/markethub_tasks`
- **Redis**: `redis://:markethub_password@localhost:6379`
- **RabbitMQ**: `amqp://markethub:markethub_password@localhost:5672/`

## 🧪 Testing

```bash
# Unit tests (from root)
npm run test

# E2E tests
npm run test:e2e

# Load testing (requires JMeter)
# Coming soon...
```

## 📊 Monitoring

Access monitoring dashboards (when running):

- **RabbitMQ Management**: http://localhost:15672
  - Username: `markethub`
  - Password: `markethub_password`

Coming soon:
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Remove all containers and volumes
docker-compose down -v
```

## ☸️ Kubernetes Deployment

```bash
# Start Minikube
minikube start

# Apply Kubernetes manifests
kubectl apply -f infrastructure/k8s/

# Check pods
kubectl get pods

# View service
kubectl get services
```

## 🔧 Development

### Adding a New Service

1. Create service directory in `apps/`
2. Add Dockerfile
3. Update `docker-compose.yml`
4. Update Nginx config for routing
5. Document in README

### Running Individual Services

```bash
# Use Turborepo for faster builds
npm run dev              # All services
turbo run dev --filter=auth-service  # Specific service
```

## 📝 Environment Variables

Each service has its own `.env` file. See `.env.example` in each service directory for required variables.

**Security Note**: Never commit `.env` files to Git. Always use `.env.example` as a template.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Azamat Qalmuratov** - Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/azamatqalmuratov)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/azamatqalmuratov)

## 🚧 Roadmap

### ✅ Completed Features
- [x] Monorepo setup with Turborepo
- [x] Docker Compose with all databases (PostgreSQL, MongoDB, Redis, TimescaleDB, RabbitMQ)
- [x] Auth Service with JWT + RBAC (4 roles: USER, TRADER, VIP_ANALYST, ADMIN)
- [x] OAuth2 integration (Google + GitHub)
- [x] 2FA implementation (TOTP)
- [x] Market Stream Service (Go + Real Binance WebSocket)
- [x] Booking Service with Redis distributed locks
- [x] Task Service with Django + Celery
- [x] Next.js Frontend with real-time dashboard
- [x] Price Alerts feature
- [x] AI Predictions Service (ML-based forecasting)
- [x] Kubernetes manifests
- [x] CI/CD Pipeline (GitHub Actions)
- [x] Rate Limiting & Security Headers
- [x] Production documentation

### 🔜 Future Enhancements
- [ ] Mobile App (React Native)
- [ ] Trading Bot integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 📊 Current Status

| Service | Status | Port | Technology |
|---------|--------|------|------------|
| Frontend | 🟢 Running | 3000 | Next.js 16 |
| Auth | 🟢 Running | 3001 | NestJS |
| Market Stream | 🟢 Running | 3002 | Go + WebSocket |
| Booking | 🟢 Running | 3003 | FastAPI |
| Task | 🟢 Running | 3004 | Django |
| Predictions | 🟢 Running | 3005 | FastAPI + ML |

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

<p align="center">
  <b>Built with ❤️ by Azamat Qalmuratov</b><br>
  <i>Enterprise-grade Microservices Architecture</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white" alt="Go"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white" alt="Kubernetes"/>
</p>

