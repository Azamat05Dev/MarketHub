# Domain va SSL O'rnatish Qo'llanmasi

## 📋 Kerakli Narsalar

1. Domain nomi (masalan: markethub.uz)
2. VPS yoki Cloud server
3. 10-15 daqiqa vaqt

---

## 1. Domain Sotib Olish

### Variantlar:

| Provider | Narx | Tavsiya |
|----------|------|---------|
| **Namecheap** | $10/yil | ⭐⭐⭐ |
| **Cloudflare** | $8/yil | ⭐⭐⭐ |
| **reg.uz** | 50,000 so'm | O'zbekiston |

### Qadamlar:
1. https://namecheap.com yoki https://cloudflare.com ga boring
2. Domain qidiring (masalan: `markethub.com`)
3. Sotib oling (to'lov kartasi kerak)

---

## 2. Cloudflare DNS Sozlash (Bepul SSL!)

### Nima uchun Cloudflare?
- ✅ Bepul SSL sertifikat
- ✅ DDoS himoya
- ✅ CDN tezlashtirish
- ✅ Analytics

### Qadamlar:

1. https://cloudflare.com da ro'yxatdan o'ting
2. **Add site** → domain nomini kiriting
3. **Free** plan tanlang
4. DNS recordlarni qo'shing:

```
Type    Name    Content              Proxy
A       @       YOUR_SERVER_IP       ✓
A       api     YOUR_SERVER_IP       ✓
CNAME   www     your-domain.com      ✓
```

5. Domain registrar'da nameservers'ni Cloudflare'ga o'zgartiring:
   - `xxx.ns.cloudflare.com`
   - `yyy.ns.cloudflare.com`

6. SSL/TLS → **Full (strict)** tanlang

---

## 3. Let's Encrypt SSL (VPS uchun)

Agar Cloudflare ishlatmasangiz:

```bash
# Server'ga SSH qiling
ssh root@your-server-ip

# Certbot o'rnatish
sudo apt update
sudo apt install certbot

# SSL olish
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d api.your-domain.com \
  -d www.your-domain.com

# Avtomatik yangilash
sudo certbot renew --dry-run
```

### Sertifikat joylashuvi:
```
/etc/letsencrypt/live/your-domain.com/fullchain.pem
/etc/letsencrypt/live/your-domain.com/privkey.pem
```

---

## 4. Nginx SSL Konfiguratsiyasi

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Auth Service
    location /auth/ {
        proxy_pass http://localhost:3001/auth/;
    }

    # Market Stream
    location /market/ {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Booking Service
    location /booking/ {
        proxy_pass http://localhost:3003/;
    }

    # Task Service
    location /tasks/ {
        proxy_pass http://localhost:3004/;
    }
}
```

---

## 5. Tekshirish

```bash
# SSL tekshirish
curl -I https://your-domain.com

# Certificate ma'lumotlari
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

---

## Xarajatlar

| Xizmat | Narx |
|--------|------|
| Domain (.com) | ~$10/yil |
| Cloudflare SSL | Bepul |
| Let's Encrypt | Bepul |
| VPS (DigitalOcean) | $5/oy |

**Jami: $10/yil + $60/yil = $70/yil**
