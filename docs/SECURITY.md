# Security Guide

## 🔐 MarketHub - Production Security

Bu hujjat loyiha xavfsizligini ta'minlash uchun tavsiyalarni o'z ichiga oladi.

---

## 1. Environment Variables

### ❌ NOTO'G'RI:
```javascript
const JWT_SECRET = 'my-secret-key'; // Hech qachon kodda yozmang!
```

### ✅ TO'G'RI:
```javascript
const JWT_SECRET = process.env.JWT_SECRET;
```

---

## 2. Secure Secrets Generation

### JWT Secret (64 chars minimum):
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

### Database Password:
```bash
openssl rand -base64 32
```

---

## 3. CORS Configuration

### Development:
```javascript
app.enableCors({ origin: '*' }); // OK for dev
```

### Production:
```javascript
app.enableCors({
  origin: ['https://your-domain.com'],
  credentials: true,
});
```

---

## 4. Rate Limiting

### NestJS:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,    // 60 seconds
      limit: 10,  // 10 requests per minute
    }),
  ],
})
```

### Nginx:
```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

location /api/ {
    limit_req zone=one burst=20 nodelay;
}
```

---

## 5. HTTPS Enforcement

### Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
}
```

---

## 6. Database Security

### Connection String Security:
```env
# Use SSL for production
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Firewall Rules:
```bash
# Only allow database access from app servers
ufw allow from APP_SERVER_IP to any port 5432
```

---

## 7. Input Validation

### NestJS:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error on unknown props
    transform: true,
  }),
);
```

---

## 8. Security Headers

### Helmet.js (Express/NestJS):
```typescript
import helmet from 'helmet';
app.use(helmet());
```

### Headers added:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)

---

## 9. Logging & Monitoring

### Log sensitive events:
- Failed login attempts
- Password changes
- 2FA enable/disable
- Admin actions

### Do NOT log:
- Passwords
- JWT tokens
- Credit card numbers
- Personal data (GDPR)

---

## 10. Security Checklist

### Before Production:
- [ ] All secrets are environment variables
- [ ] HTTPS is enforced
- [ ] CORS is restricted
- [ ] Rate limiting is enabled
- [ ] Input validation is active
- [ ] Security headers are set
- [ ] Database has SSL
- [ ] Firewall rules are configured
- [ ] Logs don't contain sensitive data
- [ ] Dependencies are updated

---

## 11. Dependency Security

### Check vulnerabilities:
```bash
# NPM
npm audit

# Python
pip-audit

# Go
govulncheck ./...
```

### Auto-update:
Enable Dependabot in GitHub repository.

---

## Emergency Contacts

Email: security@markethub.com
