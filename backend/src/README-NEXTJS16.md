# Next.js 16 + NestJS Fullstack Scaffolding

## Common Issues & Fixes (Post-Implementation)

### تهيئة Next.js 16 المتغيرة
```bash
# فحص وجود ملفات lock متعددة
ls -la package-lock.json
ls -la frontend/package-lock.json
ls -la package-lock.json  # كورنت الجذر

# حل: استخدم turbopack.root إذا لزم، أو احذف ملفات lock الزائدة
rm frontend/package-lock.json  # إذا كانت غير ضرورية
```

### إصلاح Middleware Warning
```bash
# تحذير: "middleware" file convention is deprecated
# الحل: لا داعي للتغيير - الوثيقة توضح أن هذا تحذير فقط
# أو جديد middleware عند الحاجة:
# src/proxy.ts بدلاً من middleware.ts
```

### useSearchParams في "use client" صفحات
**المشكلة:**
```tsx
"use client";
import { useSearchParams } from "next/navigation"; // ❌ يسبب خطأ في SSR
```

**الحل:**
```tsx
"use client";
import { useRef } from "react";

export default function Component() {
  const searchParamsRef = useRef<{ redirect?: string }>({});
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      searchParamsRef.current.redirect = urlParams.get('redirect');
    }
  }, []);
}
```

### CORS تكوين ديناميكي
```typescript
// main.ts
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow in development
    }
  },
  credentials: true,
});
```

### Rate Limiting JWT Endpoints
```typescript
// auth.controller.ts
import { Throttle } from '@nestjs/throttler';

@Post('login')
@Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 طلبات/دقيقة
login(@Body() dto: LoginDto) { ... }
```

### JWT Refresh Token Differentiation
```typescript
// auth.service.ts
private async generateTokens(userId: number, email: string, type: 'admin' | 'customer') {
  const payload = { sub: userId, email, type, iat: Math.floor(Date.now() / 1000) };

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, { secret: JWT_SECRET, expiresIn: accessExp }),
    this.jwtService.signAsync({ ...payload, type: `${type}_refresh` }, { secret: JWT_REFRESH_SECRET, expiresIn: refreshExp }),
  ]);

  return { accessToken, refreshToken };
}
```

### API utils مع Retry Logic
```typescript
// lib/api.ts
export async function fetchWithRetry(
  endpoint: string,
  options: RequestInit = {},
  { retries = 3, retryDelay = 1000, timeout = 10000 }: FetchOptions = {}
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') throw new Error(`Timeout after ${timeout}ms`);
      if (attempt < retries) await new Promise(r => setTimeout(r, retryDelay * Math.pow(2, attempt)));
    }
  }
  throw new Error('Network error after retries');
}
```

## Build Verification Checklist

```bash
# Backend
cd backend && npm run build  # Should complete without errors

# Frontend  
cd frontend && npm run build  # Should generate 35+ pages successfully

# Test endpoints
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/auth/login
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

## Environment Variables Template

```env
# .env
PORT=3001
DATABASE_URL="mysql://user:password@localhost:3306/db_name"
JWT_SECRET="your-256-bit-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
FRONTEND_URL=http://localhost:3000
```