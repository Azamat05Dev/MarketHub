# OAuth2 Sozlash Qo'llanmasi

## 📋 Umumiy Ko'rinish

Bu qo'llanma Google va GitHub OAuth2 authentication'ni sozlash uchun mo'ljallangan.

---

## 🔵 Google OAuth2 Sozlash

### 1-Qadam: Google Cloud Console'ga kirish

1. https://console.cloud.google.com ga boring
2. Google akkauntingiz bilan kiring
3. Yangi project yarating yoki mavjudini tanlang

### 2-Qadam: OAuth Consent Screen

1. **APIs & Services** → **OAuth consent screen** ga o'ting
2. **User Type**: "External" tanlang
3. Quyidagi ma'lumotlarni kiriting:
   - **App name**: `MarketHub`
   - **User support email**: sizning email
   - **Developer contact**: sizning email
4. **Save and Continue**

### 3-Qadam: Credentials Yaratish

1. **APIs & Services** → **Credentials** ga o'ting
2. **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. **Application type**: `Web application`
4. **Name**: `MarketHub Web Client`
5. **Authorized redirect URIs**:
   - Development: `http://localhost:3001/auth/google/callback`
   - Production: `https://api.your-domain.com/auth/google/callback`
6. **Create** tugmasini bosing

### 4-Qadam: Credentials'ni saqlash

Olingan **Client ID** va **Client Secret** ni yozing:

```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

---

## ⚫ GitHub OAuth2 Sozlash

### 1-Qadam: GitHub Developer Settings

1. https://github.com/settings/developers ga boring
2. **OAuth Apps** → **New OAuth App**

### 2-Qadam: App Ma'lumotlarini Kiriting

| Maydon | Qiymat |
|--------|--------|
| Application name | `MarketHub` |
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3001/auth/github/callback` |

### 3-Qadam: App Yaratish

1. **Register application** tugmasini bosing
2. Keyingi sahifada **Generate a new client secret** bosing
3. **Client ID** va **Client Secret** ni nusxalang

### 4-Qadam: Credentials'ni saqlash

```env
GITHUB_CLIENT_ID=Ov23lixxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
```

---

## 🔧 .env Faylni Yangilash

Auth Service'ning `.env` fayliga qo'shing:

```env
# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# GitHub OAuth2
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback

# Frontend URL (OAuth redirect uchun)
FRONTEND_URL=http://localhost:3000
```

---

## ✅ Test Qilish

### Google OAuth:
```
Brauzerda oching: http://localhost:3001/auth/google
```

### GitHub OAuth:
```
Brauzerda oching: http://localhost:3001/auth/github
```

Muvaffaqiyatli login'dan keyin, siz `http://localhost:3000/auth/callback?accessToken=...` ga redirect bo'lasiz.

---

## 🔗 Frontend Integratsiya

Frontend'da OAuth tugmalarini ishlatish:

```typescript
// Google login
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:3001/auth/google';
};

// GitHub login
const handleGithubLogin = () => {
  window.location.href = 'http://localhost:3001/auth/github';
};
```

---

## 🚨 Xatolarni Hal Qilish

### "redirect_uri_mismatch" xatosi
- Google Cloud Console'da callback URL to'g'ri yozilganligini tekshiring
- Development va production URL'larni alohida qo'shing

### "Invalid client_id" xatosi
- `.env` fayldagi `GOOGLE_CLIENT_ID` yoki `GITHUB_CLIENT_ID` to'g'ri ekanligini tekshiring
- Auth Service'ni qayta ishga tushiring

### Callback'da xato
- Frontend'da `/auth/callback` route mavjudligini tekshiring

---

## 📦 Production Uchun

Production deploy qilganda:

1. Google Cloud Console'ga production URL qo'shing
2. GitHub OAuth App'da homepage va callback URL'larni yangilang
3. `.env` fayldagi callback URL'larni yangilang:

```env
GOOGLE_CALLBACK_URL=https://api.markethub.com/auth/google/callback
GITHUB_CALLBACK_URL=https://api.markethub.com/auth/github/callback
FRONTEND_URL=https://markethub.com
```
