# Vercel va Railway Deploy Qo'llanmasi

## 📍 Arxitektura

```
┌─────────────────┐     ┌─────────────────┐
│   VERCEL        │     │    RAILWAY      │
│  (Frontend)     │     │   (Backend)     │
│ markethub.com   │────▶│ api.markethub   │
└─────────────────┘     └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
               ┌────▼────┐        ┌────▼────┐
               │ Supabase │        │ Upstash │
               │  (PG)    │        │ (Redis) │
               └──────────┘        └─────────┘
```

---

## 1. VERCEL - Frontend Deploy (Bepul!)

### Qadamlar:

```bash
# 1. Vercel CLI o'rnatish
npm i -g vercel

# 2. Frontend papkaga o'ting
cd apps/frontend

# 3. Deploy qilish
vercel

# 4. Production deploy
vercel --prod
```

### Environment Variables (Vercel Dashboard):
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com
```

### Custom Domain:
1. Vercel Dashboard → Settings → Domains
2. Domain qo'shing: `markethub.com`
3. DNS recordlarni sozlang

---

## 2. RAILWAY - Backend Deploy

### A. Dashboard orqali:

1. https://railway.app ga kiring (GitHub bilan)
2. **New Project** → **Deploy from GitHub repo**
3. Repo tanlang: `markethub`
4. Har bir service uchun alohida deploy:
   - Auth Service: `apps/auth-service/Dockerfile`
   - Market Stream: `apps/market-stream-service/Dockerfile`
   - Booking Service: `apps/booking-service/Dockerfile`
   - Task Service: `apps/task-service/Dockerfile`

### B. Railway CLI orqali:

```bash
# CLI o'rnatish
npm i -g @railway/cli

# Login
railway login

# Project yaratish
railway init

# Deploy
cd apps/auth-service
railway up
```

### Environment Variables:
Railway Dashboard → Variables:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-secret
```

---

## 3. DATABASE SOZLASH

### Railway PostgreSQL:
```bash
# Railway Dashboard → Add service → PostgreSQL
# Automatic: ${{Postgres.DATABASE_URL}}
```

### Supabase (Bepul alternativ):
1. https://supabase.com
2. New Project yarating
3. Connection string oling:
```
postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

### Upstash Redis (Bepul):
1. https://upstash.com
2. Redis database yarating
3. Connection string:
```
redis://default:[PASSWORD]@[ENDPOINT].upstash.io:6379
```

---

## 4. STEP-BY-STEP DEPLOY

### Auth Service:
```bash
cd apps/auth-service
railway up
# Set env vars in dashboard
```

### Market Stream:
```bash
cd apps/market-stream-service
railway up
# USE_REAL_API=true
```

### Booking Service:
```bash
cd apps/booking-service
railway up
```

### Task Service:
```bash
cd apps/task-service
railway up
```

---

## 5. DOMAIN ULASH

### Railway:
1. Service → Settings → Domains
2. Custom domain qo'shing: `api.markethub.com`
3. DNS: `CNAME api → your-app.up.railway.app`

### Vercel:
1. Settings → Domains → `markethub.com`
2. DNS: `A @ → 76.76.21.21`

---

## 6. FINAL URLS

| Service | URL |
|---------|-----|
| Frontend | https://markethub.com |
| Auth API | https://api.markethub.com/auth |
| Market Stream | wss://api.markethub.com/ws |
| Booking API | https://api.markethub.com/booking |
| Tasks API | https://api.markethub.com/tasks |

---

## 7. NARXLAR

| Xizmat | Bepul Limit | Pro Narx |
|--------|-------------|----------|
| Vercel | 100GB/oy | $20/oy |
| Railway | $5 credit | $5/service |
| Supabase | 500MB db | $25/oy |
| Upstash | 10K req/kun | $0.2/100K |

**Minimal xarajat: $10-20/oy**

---

## 8. TEST COMMANDS

```bash
# Health checks
curl https://api.markethub.com/auth/health
curl https://api.markethub.com/market/health
curl https://api.markethub.com/booking/api/booking/health

# WebSocket test
wscat -c wss://api.markethub.com/ws
```

---

## Yordam

Muammo bo'lsa:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
