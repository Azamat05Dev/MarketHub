# Production Deployment Guide

## 🚀 MarketHub - Production Deployment

Bu qo'llanma loyihani production serverga deploy qilish uchun mo'ljallangan.

---

## 1. Real Crypto API

### Binance WebSocket (Bepul, Cheksiz)

`.env` faylda:
```env
USE_REAL_API=true
```

Bu avtomatik ravishda Binance'dan real narxlarni oladi.

### Agar Binance ishlamasa
Loyiha avtomatik ravishda fake data'ga qaytadi.

---

## 2. OAuth2 Sozlamalari

### Google OAuth2

1. https://console.cloud.google.com ga boring
2. "APIs & Services" → "Credentials"
3. "Create Credentials" → "OAuth 2.0 Client ID"
4. Callback URL: `https://your-domain.com/auth/google/callback`

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
```

### GitHub OAuth2

1. https://github.com/settings/developers ga boring
2. "New OAuth App"
3. Callback URL: `https://your-domain.com/auth/github/callback`

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-domain.com/auth/github/callback
```

---

## 3. Hosting Variantlari

### A) Vercel + Railway (Tavsiya etiladi)

**Frontend (Vercel):**
```bash
cd apps/frontend
npx vercel --prod
```

**Backend (Railway):**
1. https://railway.app ga boring
2. GitHub repo'ni ulang
3. Har bir service uchun alohida project yarating

### B) DigitalOcean

```bash
# Docker image'larni build qilish
docker-compose build

# Push to registry
docker push your-registry/auth-service
docker push your-registry/market-stream-service
```

### C) Self-Hosted (VPS)

```bash
# SSH ga ulanish
ssh user@your-server

# Repo'ni clone qilish
git clone https://github.com/your-username/markethub.git
cd markethub

# Docker orqali ishga tushirish
docker-compose -f docker-compose.prod.yml up -d
```

---

## 4. Production Environment Variables

### Auth Service (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@db-host:5432/markethub_auth
JWT_SECRET=your-64-char-random-secret-here-make-it-very-long-and-secure-123456
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_URL=https://your-domain.com
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

### Market Stream (.env)
```env
PORT=3002
USE_REAL_API=true
REDIS_URL=redis://:password@redis-host:6379
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com
```

---

## 5. Security Checklist

- [x] HTTPS enabled (SSL sertifikat)
- [x] JWT Secret random va uzun (64+ chars)
- [x] Database credentials secure
- [x] Environment variables not in code
- [x] Rate limiting enabled
- [x] CORS restricted to your domain

### Generate Secure JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 6. Domain va SSL

### Cloudflare (Bepul SSL)

1. https://cloudflare.com ga ro'yxatdan o'ting
2. Domain'ni qo'shing
3. DNS recordlarni sozlang:
   - `A` record: `@` → server IP
   - `CNAME` record: `api` → server IP

### Let's Encrypt (Bepul SSL)

```bash
# Certbot o'rnatish
sudo apt install certbot

# SSL olish
sudo certbot certonly --standalone -d your-domain.com -d api.your-domain.com
```

---

## 7. Monitoring

### Health Checks

```bash
# Auth Service
curl https://api.your-domain.com/auth/health

# Market Stream
curl https://api.your-domain.com/market/health

# Booking Service
curl https://api.your-domain.com/booking/api/booking/health
```

### Prometheus + Grafana

Docker Compose'ga qo'shilgan. Port 9090 va 3001 orqali kirish mumkin.

---

## 8. Quick Deploy Commands

```bash
# 1. Build all Docker images
docker-compose build

# 2. Start all services
docker-compose up -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

---

## Yordam

Muammo bo'lsa, GitHub Issues orqali murojaat qiling yoki email: support@markethub.com
