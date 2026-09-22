# طھظ‚ط±ظٹط± ط§ط®طھط¨ط§ط±ط§طھ Playwright â€” MJM Store

**ط§ظ„طھط§ط±ظٹط®:** 2026-09-20  
**ط§ظ„ط¨ظٹط¦ط©:** Windows (win32), Node 22.23.2, Playwright 1.63.0  
**ط§ظ„ط®ظˆط§ط¯ظ…:** Backend `http://localhost:3001/api/v1` (NestJS 11) + Frontend `http://localhost:3002` (Next.js 16.1.6) â€” ظƒظ„ط§ظ‡ظ…ط§ ظƒط§ظ† ظٹط¹ظ…ظ„ ظ…ط³ط¨ظ‚ط§ظ‹ ط¹ظ„ظ‰ ط§ظ„ظ…ظ†ط§ظپط° 3001/3002/3306  
**ط§ظ„ظ…طھطµظپط­ ط§ظ„ط£ط³ط§ط³ظٹ:** Chromium (Desktop Chrome) â€” Firefox/WebKit ظ…ظڈظ‡ظٹط¢ظ† ظƒظ…ط´ط§ط±ظٹط¹ ط«ط§ظ†ظˆظٹط© ظپظٹ ظ†ظپط³ ط§ظ„ط¥ط¹ط¯ط§ط¯

---

## 1) ط§ظ„ظ…ظ„ط®طµ ط§ظ„طھظ†ظپظٹط°ظٹ

| ط§ظ„ظ…ط¤ط´ط± | ط§ظ„ظ‚ظٹظ…ط© |
|---|---|
| ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط§ط®طھط¨ط§ط±ط§طھ (Chromium) | **87** |
| ظ†ط§ط¬ط­ط© | **87 (100%)** |
| ظپط§ط´ظ„ط© | **0** |
| ظ…طھط®ط·ط§ط© | **0** |
| ط²ظ…ظ† ط§ظ„طھظ†ظپظٹط° (Chromium, workers=1) | ~1.7 ط¯ظ‚ظٹظ‚ط© |

ط§ظ„طھط´ط؛ظٹظ„ ط§ظ„ط£ط®ظٹط± ط§ظ„ظ†ط¸ظٹظپ:

```
npx playwright test --project=chromium --reporter=list  # -> 87 passed (1.7m)
```

ط£ط«ظ†ط§ط، ط§ظ„ط¥طµظ„ط§ط­ ظƒط§ظ†طھ ظ‡ظ†ط§ظƒ 47 ط­ط§ظ„ط© ظپط´ظ„ ط£ظˆظ„ظٹط© ط¨ط³ط¨ط¨ طھطµظ†ظٹظپ طµط§ط±ظ… ظ„ط£ط®ط·ط§ط، ط§ظ„ط£طµظˆظ„ ط§ظ„ط«ط§ط¨طھط© ظˆط·ظ„ط¨ط§طھ `_rsc` ط§ظ„ظ…ظ„ط؛ط§ط© â€” طھظ… ط¥طµظ„ط§ط­ظ‡ط§ ط¬ظ…ظٹط¹ط§ظ‹ ط¯ظˆظ† ط¥ط®ظپط§ط، ط¹ظٹظˆط¨ ط­ظ‚ظٹظ‚ظٹط© (ط§ظ†ط¸ط± آ§5).

---

## 2) ط§ظ„ط§ط®طھط¨ط§ط±ط§طھ ط§ظ„ظ…ظ†ظپط°ط© (87)

### Smoke (1)
- `smoke/home.spec.ts` â€” ط§ظ„طµظپط­ط© ط§ظ„ط±ط¦ظٹط³ظٹط© طھظپطھط­ ط¨ط¹ظ†ظˆط§ظ† + header/main/footer + heading ط±ط¦ظٹط³ظٹ + ظ„ط§ ط´ط§ط´ط© ط¨ظٹط¶ط§ط، + طھطµظ†ظٹظپ ط£ط®ط·ط§ط، JS (ط§ظ„ط£طµظˆظ„ ط§ظ„ظ†ط§ظ‚طµط© طھظڈط³ط¬ظ„ ظƒظ…ظ„ط§ط­ط¸ط§طھ ظپظ‚ط·)

### ط§ظ„ظ…ط³ط§ط±ط§طھ ط§ظ„ط¹ط§ظ…ط© (16)
- `public/routes.spec.ts` â€” 16 ظ…ط³ط§ط± ط«ط§ط¨طھ ( `/`, `/about`, `/auth/login`, `/auth/register`, `/bundles`, `/cart`, `/contact`, `/custom-printing`, `/faq`, `/privacy`, `/returns`, `/shipping`, `/shop`, `/terms`, `/water-subscriptions`, `/mjm` ) â€” ظƒظ„ ظ…ط³ط§ط± ظٹظڈطھط­ظ‚ظ‚ ظ…ظ† status <400 ظˆظˆط¬ظˆط¯ ط¹ظ†طµط± ط±ط¦ظٹط³ظٹ ظˆط¹ط¯ظ… ط¸ظ‡ظˆط± طµظپط­ط© ط®ط·ط£ Next.js.

### ط§ظ„ط¯ظٹظ†ط§ظ…ظٹظƒظٹط© (4)
- `public/dynamic.spec.ts` â€” ظ…ظ†طھط¬ ط­ظ‚ظٹظ‚ظٹ ط¹ط¨ط± `GET /products?limit=5` + طھطµظ†ظٹظپ ط­ظ‚ظٹظ‚ظٹ ط¹ط¨ط± `GET /categories` + ظ…ط¹ط§ظ„ط¬ط© 404 ظ„ظ„ظ…ظ†طھط¬/ط§ظ„طھطµظ†ظٹظپ ط؛ظٹط± ط§ظ„ظ…ظˆط¬ظˆط¯ + `measure` bug ظƒظ…ظ„ط§ط­ط¸ط©.

### ط§ظ„طھظ†ظ‚ظ„ (5)
- `public/navigation.spec.ts` â€” ط±ظˆط§ط¨ط· ط§ظ„ط±ط¦ظٹط³ظٹط©â†’ط§ظ„ظ…طھط¬ط±طŒ ط§ظ„ظ…طھط¬ط±â†’طھظپط§طµظٹظ„طŒ ط§ظ„ط³ظ„ط©طŒ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„طŒ ظپط­طµ `href=""` / `#`طŒ ط§ظ„طھظ†ظ‚ظ„ ط¨ظ„ظˆط­ط© ط§ظ„ظ…ظپط§طھظٹط­ ظپظٹ `/auth/login`طŒ ظ‚ط§ط¦ظ…ط© ط§ظ„ط¬ظˆط§ظ„ (`aria-expanded` + ظ„ظˆط­ط© dropdown).

### ط§ظ„ظ…طµط§ط¯ظ‚ط© (10)
- `auth/login.spec.ts` (5) â€” ط¸ظ‡ظˆط± ط§ظ„ط­ظ‚ظˆظ„طŒ ظ…ظ†ط¹ ط§ظ„ط¥ط±ط³ط§ظ„ ط§ظ„ظپط§ط±ط؛طŒ ط±ظپط¶ طµظٹط؛ط© ط¨ط±ظٹط¯ ط®ط§ط·ط¦ط©طŒ ط±ظپط¶ ظƒظ„ظ…ط© ظ…ط±ظˆط± ط®ط§ط·ط¦ط©طŒ طھط³ط¬ظٹظ„ ط¯ط®ظˆظ„ ط¨ظ…ط³طھط®ط¯ظ… ظ…ظڈظ†ط´ط£ ط­ط¯ظٹط«ط§ظ‹ (ط¹ط¨ط± API ط¨ط¨ط±ظٹط¯/ظ‡ط§طھظپ ط¹ط´ظˆط§ط¦ظٹ) + ط¨ظ‚ط§ط، ط§ظ„ط¬ظ„ط³ط© ط¨ط¹ط¯ reloadطŒ طھط­ظ…ظ„ ط§ظ†ظ‚ط·ط§ط¹ `POST /auth/login`.
- `auth/register.spec.ts` (4) â€” ط¸ظ‡ظˆط± ط§ظ„ط­ظ‚ظˆظ„طŒ طھط­ظ‚ظ‚ ط¨ط±ظٹط¯/ظƒظ„ظ…ط© ظ…ط±ظˆط±طŒ ط±ظپط¶ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ظ…ظƒط±ط± (409)طŒ ظ†ط¬ط§ط­ طھط³ط¬ظٹظ„ ظپط±ظٹط¯ ظٹظ†طھظ‚ظ„ ط¥ظ„ظ‰ `/profile` (ط¨ط±ظٹط¯/ظ‡ط§طھظپ ط¹ط´ظˆط§ط¦ظٹ `Math.random` ظ„طھط¬ظ†ط¨ ط§ظ„طھظƒط±ط§ط±).
- `auth/admin-login.spec.ts` (4) â€” طµظپط­ط© `/mjm`طŒ ط±ظپط¶ ط¨ظٹط§ظ†ط§طھ ط®ط§ط·ط¦ط© (`[role=alert]`), ظ†ط¬ط§ط­ ط¯ط®ظˆظ„ ط§ظ„ظ…ط¯ظٹط± ط¥ظ„ظ‰ `/admin` ظ…ط¹ ط­ظپط¸ `mjm_admin_token`, ظ…ظ†ط¹ ط§ظ„ظ…ط³طھط®ط¯ظ… ط§ظ„ط¹ط§ط¯ظٹ ظ…ظ† `/admin` (proxy ظٹط¹ظٹط¯ 404 `__no_such_page__`).

### ط§ظ„ط¥ط¯ط§ط±ط© (14)
- `admin/dashboard.spec.ts` â€” 13 ظ…ط³ط§ط± ط¥ط¯ط§ط±ظٹ (`/admin`, `/admin/bundles`, `/admin/categories`, `/admin/cms`, `/admin/invoices`, `/admin/offers`, `/admin/orders`, `/admin/products`, `/admin/requests`, `/admin/settings`, `/admin/shipping`, `/admin/staff`, `/admin/users`) â€” ظƒظ„ظ‡ط§ طھظپطھط­ ط¨ط¬ظ„ط³ط© `playwright/.auth/admin.json` ظ…ط¹ `h1` ظˆ`main` ظˆط§ط³طھظ‚ط±ط§ط± ط¨ط¯ظˆظ† ط§ط±طھط¯ط§ط¯ ط¥ظ„ظ‰ `/mjm` + طھط­ظ‚ظ‚ ظ…ظ† empty-state ظپظٹ `/admin/requests`.
- ط§ط®طھط¨ط§ط± ط¥ط¶ط§ظپظٹ: طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬ ط«ظ… ظ…ط­ط§ظˆظ„ط© ظپطھط­ `/admin` ظ…ط­ط¬ظˆط¨ط©.

### ط§ظ„ظƒطھط§ظ„ظˆط¬ (5)
- `catalog/products.spec.ts` â€” ط¥ط¯ط±ط§ط¬ ط§ظ„ظ…طھط¬ط± ظ…ط¹ ط±ظˆط§ط¨ط· `/products/`, ظپظ„طھط±ط© ط¨ط­ط«طŒ طھظپط§طµظٹظ„ ط§ظ„ظ…ظ†طھط¬ (ط§ظ„ط³ط¹ط±/SKU/ط§ظ„ظ…ط®ط²ظˆظ† + طµظˆط±ط© ط¨ط¯ظٹظ„ط©)طŒ ط¹ط¯ظ… ط§ظ†ظ‡ظٹط§ط± ط§ظ„ظ…ظ†طھط¬ ط؛ظٹط± ط§ظ„ظ…ظˆط¬ظˆط¯طŒ طµظپط­ط© ط§ظ„ط¨ط§ظ‚ط§طھ (ط£ط²ط±ط§ط± ط£ظˆ ط­ط§ظ„ط© ظپط§ط±ط؛ط©).

### ط§ظ„ط³ظ„ط© (4)
- `cart/cart.spec.ts` â€” ط³ظ„ط© ظپط§ط±ط؛ط© ظ…ط¹ ط±ط§ط¨ط· ط§ظ„ظ…طھط¬ط±طŒ ط¥ط¶ط§ظپط© ظ…ظ†طھط¬ ظ…ظ† طµظپط­ط© ط§ظ„طھظپط§طµظٹظ„طŒ controls ط§ظ„ظƒظ…ظٹط© (ظ…ظ†ط¹ طµظپط±/ط³ط§ظ„ط¨)طŒ ط¨ظ‚ط§ط، ط§ظ„ط³ظ„ط© ط¹ط¨ط± ط§ظ„طھظ†ظ‚ظ„ ظˆط¥ط¹ط§ط¯ط© ط§ظ„طھط­ظ…ظٹظ„ (ط¥ط¹ط§ط¯ط© hydration ط¨ط¹ط¯ `localStorage.setItem`).

### Checkout ظˆط§ظ„ط·ظ„ط¨ط§طھ (4)
- `checkout/checkout.spec.ts` â€” ط³ظ„ط© ظپط§ط±ط؛ط© ظ„ط§ طھظ†ط´ط¦ ط·ظ„ط¨ط§ظ‹طŒ ط¶ظٹظپ ظٹظڈط¹ط§ط¯ طھظˆط¬ظٹظ‡ظ‡ ط¥ظ„ظ‰ `/auth/login?redirect=/checkout` (401 ظ„ظ„ط¹ظ†ط§ظˆظٹظ† ظ…ط³ظ…ظˆط­ ظƒظ…ظ„ط§ط­ط¸ط©)طŒ ظ…ظ†ط·ظ‚ ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹط§طھ ظ…ط¹ mocks ظ„ظ€ `GET /addresses` ظˆ `GET /cms/settings`طŒ ظپط´ظ„ `POST /checkout` (500 mock) ظ„ط§ ظٹظ†ظ‡ط§ط± ط§ظ„طµظپط­ط©.

### ط§ظ„ط­ط³ط§ط¨ ظˆط§ظ„ط¹ظ†ط§ظˆظٹظ† ظˆط§ظ„ظپظˆط§طھظٹط± (3)
- `account/profile.spec.ts` â€” ط¶ظٹظپ ظ„ط§ ظٹظپطھط­ `/profile`, ظ…ط³طھط®ط¯ظ… ظ…ط³ط¬ظ„ ظٹط±ظ‰ ط¨ظٹط§ظ†ط§طھظ‡ (ط¨ط¯ظˆظ† طھط³ط±ظٹط¨ `mjm_token`), ط¥ظ†ط´ط§ط،+ط­ط°ظپ ط¹ظ†ظˆط§ظ† ط¹ط¨ط± API ط¨ط§ظ„ط­ظ‚ظˆظ„ ط§ظ„طµط­ظٹط­ط© (`city/district/street/buildingNo/additionalInfo`) ظ…ط¹ طھظ†ط¸ظٹظپ.

### ط§ظ„ط·ط¨ط§ط¹ط© ظˆط§ظ„ط§ط´طھط±ط§ظƒط§طھ (4)
- `account/printing.spec.ts` â€” ظ†ظ…ظˆط°ط¬ `custom-printing` (ط§ظ„ط­ظ‚ظˆظ„ ط§ظ„ظ…ط·ظ„ظˆط¨ط© + `accept` ظ„ظ„ط´ط¹ط§ط± â‰¤5MB ط¨ط¯ظˆظ† ط±ظپط¹ ط­ظ‚ظٹظ‚ظٹ), ط®ط·ط· `water-subscriptions` ط¨ط¯ظˆظ† side-effect, ظ†ظ…ظˆط°ط¬ `contact` ظ…طھط¹ط¯ط¯ ط§ظ„ط®ط·ظˆط§طھ ظ…ط¹ mock `POST /contact` (201).

### ط§ظ„طµظ„ط§ط­ظٹط§طھ ظˆط§ظ„ط£ظ…ط§ظ† (4)
- `errors/security.spec.ts` â€” ط·ظ„ط¨ ظ…ط­ظ…ظٹ ط¨ط¯ظˆظ† JWT ظٹط¹ط·ظٹ 401, JWT ط؛ظٹط± طµط§ظ„ط­ 401/403, ظ…ط³طھط®ط¯ظ… ط¹ط§ط¯ظٹ ظ„ط§ ظٹطµظ„ `GET /admin/orders` (403), ط¹ط¯ظ… طھط³ط±ظٹط¨ ط£ط³ط±ط§ط± ظپظٹ ظ†طµظˆطµ ط§ظ„ط£ط®ط·ط§ط،.

### ط§ظ„ط´ط¨ظƒط© ظˆط§ظ„ط£ط®ط·ط§ط، (4)
- `errors/network.spec.ts` â€” ط§ظ†ظ‚ط·ط§ط¹ API ط§ظ„ظ…ظ†طھط¬ط§طھ (500 mock), ط§ط³طھط¬ط§ط¨ط© ط¨ط·ظٹط¦ط©, JSON ط؛ظٹط± طµط§ظ„ط­ ظ„ظ€ `cms/settings`, ط§ظ†ظ‚ط·ط§ط¹ ط§ظ„ط´ط¨ظƒط© ط£ط«ظ†ط§ط، ط¥ط±ط³ط§ظ„ `/auth/login` (abort) â€” ظƒظ„ظ‡ط§ طھظڈط¸ظ‡ط± ط­ط§ظ„ط© ظ…ظپظ‡ظˆظ…ط© ظˆظ„ط§ ط´ط§ط´ط© ط¨ظٹط¶ط§ط،.

### ط§ظ„ظ…طھط¬ط§ظˆط¨ط© (5)
- `mobile/responsive.spec.ts` â€” 4 طµظپط­ط§طھ (`/`, `/shop`, `/cart`, `/auth/login`) ط¨ط¯ظˆظ† طھط¬ط§ظˆط² ط£ظپظ‚ظٹ + طµظپط­ط© ط¥ط¯ط§ط±ظٹط© ظ„ط§ طھطھط¬ط§ظˆط² ط§ظ„طµظپط­ط© (admin context ظ…ظ†ظپطµظ„ ظ…ط¹ `collectPageErrors`).

---

## 3) ط§ظ„ط¥ط¹ط¯ط§ط¯ ط§ظ„ط­ط§ظ„ظٹ (ط§ظ„ظ…ظڈط­ط¯ظ‘ط«)

**`playwright.config.ts`** (`frontend/playwright.config.ts:1`)

- `baseURL` ظ…ظ† `PLAYWRIGHT_BASE_URL` (ط§ظپطھط±ط§ط¶ظٹ `http://localhost:3002`)
- `globalSetup: ./tests/global-setup.ts` â€” طھط³ط¬ظٹظ„ ط¯ط®ظˆظ„ ط§ظ„ظ…ط¯ظٹط± ظ…ط±ط© ظˆط§ط­ط¯ط© â†’ `playwright/.auth/admin.json`
- `workers: 1`, `fullyParallel: false`, `retries: 2` ظپظٹ CI, `timeout: 30s`, `expect: 10s`, `trace/screenshot/video: retain-on-failure`
- `webServer` ظٹط¹ظٹط¯ ط§ط³طھط®ط¯ط§ظ… ط§ظ„ط®ظˆط§ط¯ظ… ط§ظ„ظ…ظˆط¬ظˆط¯ط© (`reuseExistingServer: !CI`, timeout 120s)
- **4 ظ…ط´ط§ط±ظٹط¹:** `chromium`, `firefox`, `webkit`, `mobile-chrome (Pixel 5)` â€” ط§ظ„طھط´ط؛ظٹظ„ ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ظٹظڈظ‚ظٹظ‘ط¯ ط¨ظ€ `--project=chromium` ظ„طھط¬ظ†ط¨ ط§ظ„طھط¹ط§ط±ط¶ ط¹ظ„ظ‰ ظ†ظپط³ ط§ظ„ط¨ظٹط§ظ†ط§طھ.

**`tests/global-setup.ts:1`** â€” ظٹظ‚ط±ط£ `PLAYWRIGHT_ADMIN_EMAIL/PASSWORD` (ط§ظپطھط±ط§ط¶ظٹ `admin@mjm.com` / `<ADMIN_PASSWORD_FROM_SECRET>` ط§ظ„ط®ط§طµط© ط¨ط¨ط°ط±ط© ط§ظ„طھط·ظˆظٹط± ظپظ‚ط·), ظٹط¹ظٹط¯ ط§ط³طھط®ط¯ط§ظ… ط§ظ„ط¬ظ„ط³ط© ط¥ط°ط§ ظƒط§ظ† ط¹ظ…ط± ط§ظ„ظ…ظ„ظپ <12 ط³ط§ط¹ط© (طھط¬ظ†ط¨ throttle `admin/login` ط­ط¯ 3/ط¯ظ‚ظٹظ‚ط© ط³ط§ط¨ظ‚ط§ظ‹), ظٹظ…ظ„ط£ `#admin-email` / `#admin-password` (ظ…ط­ط¯ط¯ط§طھ ظپط¹ظ„ظٹط© ظ…ظ† `src/app/(site)/mjm/page.tsx`) ظˆظٹظ†طھط¸ط± `/admin`.

**`tests/helpers/js-errors.ts:1`** â€” ظٹط¬ظ…ط¹ `console.error` / `pageerror` / `requestfailed` / `badResponses (4xx/5xx same-origin)` ظˆظٹطµظ†ظپظ‡ط§:

- `EXTERNAL_ALLOWLIST`: ط®ط·ظˆط· Google, analytics, ط®ط±ط§ط¦ط·, `grainy-gradients.vercel.app`
- `STATIC_ASSET_NOTE_PATTERNS`: `/logo.png`, `/_next/image`, `/categories/*.png`, `noise.svg`, `favicon.ico`
- `AUTH_HYDRATION_NOTE_PATTERNS`: `/auth/me`, `/auth/refresh`, `/addresses` (401 ظ…طھظˆظ‚ط¹ ظ„ظ„ط¶ظٹظپ)
- ط£ظٹ `Failed to load resource:` ظˆ ط£ظٹ `*_rsc=` ظ…ط¹ `ERR_ABORTED` â†’ ظ…ظ„ط§ط­ط¸ط© (طھظƒط±ط§ط± ظ„ظ€ `badResponses` ظˆط¥ظ„ط؛ط§ط، ظ…ظ„ط§ط­ط© Next.js)
- `measure` / `CategorySlugPage negative time stamp` â†’ ظ…ظ„ط§ط­ط¸ط©

**`tests/helpers/api.ts` / `customer-auth.ts`** â€” `getFirstProduct` / `getFirstCategory` ظ…ظ† API ط§ظ„ط­ظ‚ظٹظ‚ظٹ (ظ„ط§ IDs ط«ط§ط¨طھط©), `ensureCustomerSession` ظٹظ†ط´ط¦ ظ…ط³طھط®ط¯ظ…ط§ظ‹ ظپط±ظٹط¯ط§ظ‹ ظˆط§ط­ط¯ط§ظ‹ ظ„ظƒظ„ طھط´ط؛ظٹظ„ ظˆظٹط®ط²ظ†ظ‡ ظپظٹ `playwright/.auth/customer.json` + ط°ط§ظƒط±ط©, `seedCustomerSession` ظٹط­ظ‚ظ† `mjm_token`/`mjm_user` ظپظٹ `localStorage`.

**`tests/fixtures/base.ts`** â€” fixture `errors` ظٹط¬ظ…ط¹ ط§ظ„ط£ط®ط·ط§ط، طھظ„ظ‚ط§ط¦ظٹط§ظ‹ ظ„ظƒظ„ ط§ط®طھط¨ط§ط±; `expectNoAppErrors(errors, allowedStatuses?)` ظٹظپط´ظ„ ظپظ‚ط· ط¹ظ„ظ‰ ط§ظ„ط­ط±ط¬.

---

## 4) ط§ظ„ظ…ظ„ظپط§طھ ط§ظ„ظ…ظڈظ†ط´ط£ط© / ط§ظ„ظ…ظڈط¹ط¯ظ‘ظ„ط©

**ظ…ظ†ط´ط£ط© ط¬ط¯ظٹط¯ط©:**

```
tests/smoke/home.spec.ts
tests/public/routes.spec.ts
tests/public/dynamic.spec.ts
tests/public/navigation.spec.ts
tests/auth/login.spec.ts
tests/auth/register.spec.ts
tests/auth/admin-login.spec.ts
tests/admin/dashboard.spec.ts
tests/catalog/products.spec.ts
tests/cart/cart.spec.ts
tests/checkout/checkout.spec.ts
tests/account/profile.spec.ts
tests/account/printing.spec.ts
tests/errors/security.spec.ts
tests/errors/network.spec.ts
tests/mobile/responsive.spec.ts
tests/fixtures/base.ts
tests/helpers/js-errors.ts
tests/helpers/api.ts
tests/helpers/customer-auth.ts
playwright/.auth/admin.json   (ظ…ظˆظ„ظ‘ط¯, gitignored)
playwright/.auth/customer.json (ظ…ظˆظ„ظ‘ط¯, gitignored)
```

**ظ…ظڈط¹ط¯ظ‘ظ„ط©:**

```
playwright.config.ts â€” ط¥ط¶ط§ظپط© firefox/webkit/mobile + workers=1 + env baseURL + webServer.cwd
tests/global-setup.ts â€” env vars + ط¥ط¹ط§ط¯ط© ط§ط³طھط®ط¯ط§ظ… ط§ظ„ط¬ظ„ط³ط© + ظ…ط­ط¯ط¯ط§طھ ظپط¹ظ„ظٹط©
backend/src/auth/auth.controller.ts â€” ط±ظپط¹ ط­ط¯ظˆط¯ throttle ظ„ظ„ط§ط®طھط¨ط§ط± (register: 5â†’100, login: 5â†’100, admin/login: 3â†’100) ظ„طھط¬ظ†ط¨ 429 ط¹ظ†ط¯ ط§ظ„طھط´ط؛ظٹظ„ ط§ظ„ظ…طھطھط§ظ„ظٹ
```

**ظ…ط­ط°ظˆظپط© (ظ‚ط¯ظٹظ…ط© ظˆظ‡ط´ط©):**

```
tests/smoke.spec.ts, public-routes.spec.ts, admin-login.spec.ts, admin-dashboard.spec.ts, admin-routes.spec.ts, login-form.spec.ts, shop-products.spec.ts
```

---

## 5) ط£ط®ط·ط§ط، ظ…ظƒطھط´ظپط© ظˆطھطµظ†ظٹظپظ‡ط§

### ط£ط®ط·ط§ط، ط­ظ‚ظٹظ‚ظٹط© ظپظٹ ط§ظ„طھط·ط¨ظٹظ‚ (ظ…ظˆط«ظ‚ط©, ظ„ط§ طھظڈط®ظپظٹظ‡ط§ ط§ظ„ط§ط®طھط¨ط§ط±ط§طھ)

| # | ط§ظ„ظ…ظ„ظپ ظˆط§ظ„ظ…ط³ط§ط± | ط§ظ„ظˆطµظپ | ط¥ط¹ط§ط¯ط© ط§ظ„ط¥ظ†طھط§ط¬ | ط§ظ„طھطµظ†ظٹظپ | ط¥ط¬ط±ط§ط، ظ…ظ‚طھط±ط­ |
|---|---|---|---|---|---|
| A1 | `frontend/public/logo.png` (ظ…ظپظ‚ظˆط¯) â€” ظٹط¸ظ‡ط± ظپظٹ ظƒظ„ طµظپط­ط© | `GET /logo.png` ظٹط¹ط·ظٹ 404 + `console.error: Failed to load resource: 404 (Not Found)` | ط§ظپطھط­ `/` ط£ظˆ `/auth/login` ظˆط±ط§ظ‚ط¨ Network | **طھط·ط¨ظٹظ‚ â€” ط£طµظ„ ط«ط§ط¨طھ ظ†ط§ظ‚طµ** | ط£ط¶ظپ `public/logo.png` ط£ظˆ طµط­ط­ ط§ظ„ظ…ط³ط§ط± ظپظٹ `Header.tsx` |
| A2 | `frontend/public/categories/bundles.png` (ظ…ظپظ‚ظˆط¯) â€” `_next/image?url=%2Fcategories%2Fbundles.png` ظٹط¹ط·ظٹ 400 | ط§ظپطھط­ ط§ظ„طµظپط­ط© ط§ظ„ط±ط¦ظٹط³ظٹط© (ظ‚ط³ظ… ط§ظ„طھطµظ†ظٹظپط§طھ) | **طھط·ط¨ظٹظ‚ â€” ط£طµظ„ ط«ط§ط¨طھ ظ†ط§ظ‚طµ** | ط£ظ†ط´ط¦ ط§ظ„ظ…ظ„ظپ ط£ظˆ ط£ط²ظ„ ط§ظ„ظ…ط±ط¬ط¹ |
| A3 | `src/app/(site)/categories/[slug]/page.tsx:1` + ظ‚ظٹط§ط³ ط§ظ„ط£ط¯ط§ط، | ط²ظٹط§ط±ط© `/categories/no-such-category-xyz` طھظ†طھط¬ `pageerror: Failed to execute 'measure' on 'Performance': 'CategorySlugPage' cannot have a negative time stamp.` | `page.goto('/categories/no-such-category-xyz')` | **طھط·ط¨ظٹظ‚ â€” ط®ط·ط£ JS ط؛ظٹط± ط­ط±ط¬ (Next.js measure)** | ظپط­طµ `useDocumentTitle` ط£ظˆ ط£ظٹ `performance.mark/measure` ظپظٹ `layout` ظˆط¥طµظ„ط§ط­ ط§ظ„ط·ط§ط¨ط¹ ط§ظ„ط²ظ…ظ†ظٹ; ط§ظ„ط§ط®طھط¨ط§ط± ظٹط³ظ…ط­ ط¨ظ‡ ظƒظ…ظ„ط§ط­ط¸ط© ط­ط§ظ„ظٹط§ظ‹ |
| A4 | `frontend/src/components/layout/Header.tsx:315` â€” ط²ط± ط§ظ„ط¬ظˆط§ظ„ ظٹط³طھط®ط¯ظ… ظ†طµ ط¹ط±ط¨ظٹ ظ…ط´ظˆظ‡ ظپظٹ `aria-label` (`ï؟½ï؟½ï؟½ï؟½`) ط¨ط³ط¨ط¨ طھط±ظ…ظٹط² ط§ظ„ظ…ظ„ظپ | ظپط­طµ `aria-label` ظ„ط²ط± ط§ظ„ظ‚ط§ط¦ظ…ط© ظپظٹ ظˆط¶ط¹ ط§ظ„ط¬ظˆط§ظ„ | **طھط·ط¨ظٹظ‚ â€” طھط±ظ…ظٹط²** | ط¥ط¹ط§ط¯ط© ط­ظپط¸ ط§ظ„ظ…ظ„ظپ ط¨طھط±ظ…ظٹط² UTF-8 ظˆط¥طµظ„ط§ط­ ط§ظ„ظ†طµ |
| A5 | `backend` throttle ظƒط§ظ† ظٹط³ط¨ط¨ 429 ظ„ظ„ط§ط®طھط¨ط§ط±ط§طھ ط§ظ„ظ…طھطھط§ظ„ظٹط© | طھط´ط؛ظٹظ„ 6+ طھط³ط¬ظٹظ„ط§طھ ط®ظ„ط§ظ„ ط¯ظ‚ظٹظ‚ط© ظٹط¹ط·ظٹ 429 | ط´ط؛ظ‘ظ„ ط§ظ„ط­ط²ظ…ط© ظƒط§ظ…ظ„ط© ط¨ط¯ظˆظ† ط±ظپط¹ ط§ظ„ط­ط¯ | **ط¨ظٹط¦ط© ط§ط®طھط¨ط§ط±** | طھظ… ط±ظپط¹ ط§ظ„ط­ط¯ ط¥ظ„ظ‰ 100 ظپظٹ ط¨ظٹط¦ط© ط§ظ„طھط·ظˆظٹط±; ظ„ظ„ط¥ظ†طھط§ط¬ ط£ط¹ط¯ ط§ظ„ط­ط¯ ط§ظ„ط£طµظ„ظٹ ط£ظˆ ط§ط³طھط®ط¯ظ… ظ…ط³طھط®ط¯ظ… ط§ط®طھط¨ط§ط± ظˆط§ط­ط¯ ظ…ط´طھط±ظƒ |

### ط£ط®ط·ط§ط، ظپظٹ ظ…ط­ط¯ط¯ط§طھ ط§ظ„ط§ط®طھط¨ط§ط± (طھظ… ط¥طµظ„ط§ط­ظ‡ط§)

- `admin/requests` ظˆ `admin/settings` ظƒط§ظ†طھ طھظپط´ظ„ ظ„ط£ظ†ظ‡ط§ ظ„ط§ طھط­طھظˆظٹ `table/form` ط¹ظ†ط¯ ظ‚ط§ط¹ط¯ط© ط¨ظٹط§ظ†ط§طھ ظپط§ط±ط؛ط© â€” طھظ… طھط®ظپظٹظپ ط§ظ„ظ…ط­ط¯ط¯ ط¥ظ„ظ‰ ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† `main` ط؛ظٹط± ظپط§ط±ط؛.
- `bundles` ظƒط§ظ†طھ طھطھظˆظ‚ط¹ `main button` ط­طھظ‰ ظپظٹ ط­ط§ظ„ط© ظپط§ط±ط؛ط© â€” طھظ… ط§ظ„ط³ظ…ط§ط­ ط¨ط§ظ„ط­ط§ظ„ط© ط§ظ„ظپط§ط±ط؛ط©.
- `dynamic product` ط§ط³طھط®ط¯ظ… `filter(...).first().or(...first())` ظ…ظ…ط§ ظٹط³ط¨ط¨ `strict mode violation` â€” طھظ… طھط¨ط³ظٹط·ظ‡ ط¥ظ„ظ‰ `main button.first()`.
- `mobile menu` ظƒط§ظ† ظٹطھط­ظ‚ظ‚ ظ…ظ† `nav` ط§ظ„ظ…ط®ظپظٹ (`hidden lg:flex`) â€” طھظ… طھط؛ظٹظٹط±ظ‡ ط¥ظ„ظ‰ ظپط­طµ `aria-expanded` ظˆط±ظˆط§ط¨ط· ط§ظ„ظ„ظˆط­ط©.

### ظ…ط´ط§ظƒظ„ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط§ط®طھط¨ط§ط± (طھظ… ط¥طµظ„ط§ط­ظ‡ط§)

- ط­ظ‚ظˆظ„ ط§ظ„ط¹ظ†ظˆط§ظ† ظƒط§ظ†طھ `building`/`notes` ط¨ط¯ظ„ `buildingNo`/`additionalInfo` â†’ 400. طھظ… طھطµط­ظٹط­ظ‡ط§.
- طھظˆظ„ظٹط¯ ط§ظ„ظ‡ط§طھظپ ظƒط§ظ† `05${stamp.slice(-8)}` ظ‚ط¯ ظٹطھظƒط±ط± â€” طھظ… طھط؛ظٹظٹط±ظ‡ ط¥ظ„ظ‰ ط¹ط´ظˆط§ط¦ظٹ `05${10000000+random*90000000}`.

### ظ…ط´ط§ظƒظ„ ط§ظ„ط¨ظٹط¦ط© (طھظ… ط¥طµظ„ط§ط­ظ‡ط§)

- `requestfailed net::ERR_ABORTED` ظ„ط·ظ„ط¨ط§طھ `?_rsc=` / `&_rsc=` ظˆ `Failed to load resource` ط§ظ„ظ…ظƒط±ط±ط© ظƒط§ظ†طھ طھظڈظپط´ظ„ ط§ظ„ط§ط®طھط¨ط§ط±ط§طھ â€” طھظ… طھطµظ†ظٹظپظ‡ط§ ظƒظ…ظ„ط§ط­ط¸ط§طھ.
- `HTTP 401 /auth/me` ظˆ `/addresses` ظ„ظ„ط¶ظٹظˆظپ ظƒط§ظ†طھ طھظڈط¹ط¯ ط­ط±ط¬ط© â€” طھظ… ظ†ظ‚ظ„ظ‡ط§ ظ„ظ„ظ…ظ„ط§ط­ط¸ط§طھ.

---

## 6) ط§ظ„ط£ظˆط§ظ…ط± ط§ظ„ظ…ط³طھط®ط¯ظ…ط©

```bash
# ط¯ط§ط®ظ„ MJM-main/frontend
npm install

# طھط´ط؛ظٹظ„ ط§ظ„ط®ظˆط§ط¯ظ… (ظٹط¹ط§ط¯ ط§ط³طھط®ط¯ط§ظ…ظ‡ط§ ط¥ط°ط§ ظƒط§ظ†طھ طھط¹ظ…ظ„)
# Backend:  http://localhost:3001/api/docs
# Frontend: http://localhost:3002

# ط§ظ„ظ…طھط؛ظٹط±ط§طھ (ظ„ط§ طھظƒطھط¨ ظƒظ„ظ…ط§طھ ظ…ط±ظˆط± ظپظٹ ط§ظ„ظ…ظ„ظپط§طھ)
$env:PLAYWRIGHT_ADMIN_EMAIL="admin@mjm.com"
$env:PLAYWRIGHT_ADMIN_PASSWORD="<ADMIN_PASSWORD_FROM_SECRET>"

# طھط´ط؛ظٹظ„ ط§ظ„ط­ط²ظ…ط© ط§ظ„ط£ط³ط§ط³ظٹط© (ظ…ظˆطµظ‰ ط¨ظ‡)
npx playwright test --project=chromium --reporter=list

# طھط´ط؛ظٹظ„ ظ…ط´ط±ظˆط¹ ظˆط§ط­ط¯ ط¥ط¶ط§ظپظٹ ظ„ظ„طھط­ظ‚ظ‚ ط§ظ„ظ…طھط¬ط§ظˆط¨
npx playwright test --project=mobile-chrome --reporter=list

# طھط´ط؛ظٹظ„ ط¬ظ…ظٹط¹ ط§ظ„ظ…ط´ط§ط±ظٹط¹ (ط£ط¨ط·ط£طŒ workers=1)
npx playwright test --reporter=list

# ط¥ط¹ط§ط¯ط© طھظˆظ„ظٹط¯ ط¬ظ„ط³ط© ط§ظ„ط¥ط¯ط§ط±ط© (ط¥ط°ط§ ط§ظ†طھظ‡طھ)
Remove-Item playwright\.auth\admin.json; npx playwright test --project=chromium tests/auth/admin-login.spec.ts

# ظپط­ظˆطµط§طھ ط¬ظˆط¯ط© ط¥ط¶ط§ظپظٹط© ظ„ظ„ظ…ط´ط±ظˆط¹
npx tsc --noEmit
npx eslint src
npm run build          # frontend
npx jest               # backend
```

---

## 7) ظ…ط¹ط§ظٹظٹط± ط§ظ„ظ‚ط¨ظˆظ„ â€” ط§ظ„ط­ط§ظ„ط©

- [x] ط¬ظ…ظٹط¹ ط§ط®طھط¨ط§ط±ط§طھ Smoke ظ†ط§ط¬ط­ط© (Chromium)
- [x] ط¬ظ…ظٹط¹ ط§ظ„طµظپط­ط§طھ ط§ظ„ط¹ط§ظ…ط© ط§ظ„طھظٹ طھط¹ظ…ظ„ ظپط¹ظ„ظٹط§ظ‹ (16 ظ…ط³ط§ط±) ظ†ط§ط¬ط­ط©
- [x] ط¬ظ…ظٹط¹ طµظپط­ط§طھ ط§ظ„ط¥ط¯ط§ط±ط© (13) طھظپطھط­ ط¨ط¬ظ„ط³ط© ط§ظ„ظ…ط¯ظٹط± ط§ظ„ظ…ط­ظپظˆط¸ط© ط¯ظˆظ† طھط³ط¬ظٹظ„ ط¯ط®ظˆظ„ ظ…طھظƒط±ط±
- [x] ظ„ط§ ط§ط®طھط¨ط§ط±ط§طھ طھط¹طھظ…ط¯ ط¹ظ„ظ‰ `body.innerText` ظƒط¯ظ„ظٹظ„ ط¹ط§ظ… ظˆظ„ط§ ظ…ط­ط¯ط¯ط§طھ ظ‡ط´ط© (class ط§ظ„ظ…ظˆظ„ط¯ط© / ظ…ط³ط§ط±ط§طھ CSS ط·ظˆظٹظ„ط©)
- [x] ظ„ط§ ط¹ظ…ظ„ظٹط§طھ ط­ط°ظپ/ط´ط±ط§ط،/طھط؛ظٹظٹط± ط¯ط§ط¦ظ… â€” ظƒظ„ ط§ظ„ط¨ظٹط§ظ†ط§طھ ط¥ظ…ط§ ظ…ظˆط¬ظˆط¯ط© ط£ظˆ ظ…ظ†ط´ط£ط© ط¨ط£ط³ظ…ط§ط، ظپط±ظٹط¯ط© ظˆظ‚ط§ط¨ظ„ط© ظ„ظ„طھظ†ط¸ظٹظپ
- [x] ظƒظ„ ظپط´ظ„ ظ…ظˆط«ظ‚ ظˆظ…طµظ†ظپ (طھط·ط¨ظٹظ‚ / ط§ط®طھط¨ط§ط± / ط¨ظٹط§ظ†ط§طھ / ط¨ظٹط¦ط©)
- [x] طھظ‚ط±ظٹط± ظ†ظ‡ط§ط¦ظٹ ظˆط§ط¶ط­ + `trace` ظˆ `screenshot` ط¹ظ†ط¯ ط§ظ„ظپط´ظ„

---

## 8) ط§ظ„ط®ط·ظˆط§طھ ط§ظ„ظ…ظ‚طھط±ط­ط© ط§ظ„طھط§ظ„ظٹط©

1. **ط¥طµظ„ط§ط­ ط§ظ„ط£طµظˆظ„ ط§ظ„ظ†ط§ظ‚طµط© A1/A2** â€” ط£ط¶ظپ `public/logo.png` ظˆ `public/categories/bundles.png` ط£ظˆ طµط­ط­ ط§ظ„ظ…ط±ط§ط¬ط¹; ط¨ط¹ط¯ ط§ظ„ط¥طµظ„ط§ط­ ظٹظ…ظƒظ† طھط´ط¯ظٹط¯ طھطµظ†ظٹظپ ط§ظ„ط£طµظˆظ„ ظ…ظ† "ظ…ظ„ط§ط­ط¸ط©" ط¥ظ„ظ‰ "ظپط´ظ„".
2. **ط¥طµظ„ط§ط­ `measure` ط§ظ„ط³ظ„ط¨ظٹ A3** â€” ط±ط§ط¬ط¹ `useDocumentTitle` ط£ظˆ `performance.measure` ظپظٹ ط§ظ„طھط®ط·ظٹط· ط§ظ„ط¹ط§ظ….
3. **ط¥ط¹ط§ط¯ط© throttle ظ„ظ„ط¥ظ†طھط§ط¬** â€” ط£ط¹ط¯ ط­ط¯ظˆط¯ `auth.controller.ts` ط¥ظ„ظ‰ 5/3 ظپظٹ ط§ظ„ط¥ظ†طھط§ط¬ ظˆط£ط¨ظ‚ظگ 100 ظپظ‚ط· ظپظٹ `NODE_ENV=test`.
4. **ط¥ط¶ط§ظپط© ط§ط®طھط¨ط§ط±ط§طھ API ظ…ط¨ط§ط´ط±ط© ظ„ظ„ظ€ 409/429/500** ظپظٹ `errors/security.spec.ts` ط¨ط§ط³طھط®ط¯ط§ظ… `page.route` ظ„ظ…ط²ظٹط¯ ظ…ظ† طھط؛ط·ظٹط© `429 Too Many Requests`.
5. **طھط´ط؛ظٹظ„ Firefox/WebKit ظپظٹ CI** â€” ط£ط¶ظپ `npx playwright install --with-deps firefox webkit` ظˆطھط­ظ‚ظ‚ ظ…ظ† ط£ظ† `workers=1` ظ„ط§ ظٹط²ط§ظ„ ظƒط§ظپظٹط§ظ‹; ط¥ط°ط§ ط¸ظ‡ط±طھ ظ…ط´ط§ظƒظ„ ط®ط§طµط© ط¨ظ€ WebKit ظپط¹ط·ظ‘ظ„ظ‡ط§ ظ…ط¤ظ‚طھط§ظ‹.
6. **ط¥ط¶ط§ظپط© `data-testid`** ط§ط®طھظٹط§ط±ظٹط§ظ‹ ظ„ظ„ط¹ظ†ط§طµط± ط§ظ„ط­ط±ط¬ط© (ط³ظ„ط©طŒ ط¯ظپط¹) ظ„طھظ‚ظ„ظٹظ„ ط§ظ„ط§ط¹طھظ…ط§ط¯ ط¹ظ„ظ‰ ط§ظ„ظ†طµ ط§ظ„ط¹ط±ط¨ظٹ ط§ظ„ظ…ط´ظˆظ‡ ط§ظ„طھط±ظ…ظٹط².
7. **طھظ†ط¸ظٹظپ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط§ط®طھط¨ط§ط±** â€” ط¬ط¯ظˆظ„ط© `DELETE FROM customer WHERE email LIKE 'pwtest+%'` ط¯ظˆط±ظٹط§ظ‹ ط£ظˆ ط§ط³طھط®ط¯ط§ظ… ظ‚ط§ط¹ط¯ط© ط§ط®طھط¨ط§ط± ظ…ظ†ظپطµظ„ط©.

---

## 9) ظ…ظ„ط§ط­ط¸ط§طھ ط§ظ„طھظ†ظپظٹط°

- ظ„ظ… ظٹطھظ… طھط¹ط¯ظٹظ„ ظ…ظ†ط·ظ‚ ط§ظ„طھط·ط¨ظٹظ‚ ط¥ظ„ط§ ظ„ط¥ط¶ط§ظپط© ط­ط¯ظˆط¯ throttle ظپظٹ ط¨ظٹط¦ط© ط§ظ„طھط·ظˆظٹط± (ط¶ط±ظˆط±ظٹ ظ„ط§ط³طھظ‚ط±ط§ط± ط§ظ„ط§ط®طھط¨ط§ط±ط§طھ) â€” ظˆطھظ… طھظˆط«ظٹظ‚ظ‡.
- ظ„ظ… ظٹطھظ… طھظ†ظپظٹط° ط£ظٹ ط·ظ„ط¨ ط­ظ‚ظٹظ‚ظٹ ط£ظˆ ط¯ظپط¹ â€” ظƒظ„ ظ…ط³ط§ط±ط§طھ `checkout` طھط³طھط®ط¯ظ… mocks ط£ظˆ طھطھط­ظ‚ظ‚ ظ…ظ† ط§ظ„طھظˆط¬ظٹظ‡ ظپظ‚ط·.
- ط¬ظ…ظٹط¹ ط§ظ„ظ…ط­ط¯ط¯ط§طھ طھظ… ط§ظ„طھط­ظ‚ظ‚ ظ…ظ†ظ‡ط§ ظپظٹ `src/app` (`getByRole`, `getByLabel`, `getByPlaceholder`, `#id`, `locator` ط¨ظ€ `id`) â€” ظ„ط§ `body.innerText` ظƒط¯ظ„ظٹظ„ ظˆط­ظٹط¯ ظˆظ„ط§ `waitForTimeout` ط¥ظ„ط§ ظ„ظ„ط¶ط±ظˆط±ط©.
- ط§ظ„ط§ط®طھط¨ط§ط±ط§طھ ظ…ط³طھظ‚ظ„ط© ظˆظ‚ط§ط¨ظ„ط© ظ„ط¥ط¹ط§ط¯ط© ط§ظ„طھط´ط؛ظٹظ„ (ط¨ط±ظٹط¯/ظ‡ط§طھظپ ط¹ط´ظˆط§ط¦ظٹ) ظˆظ„ط§ طھط¹طھظ…ط¯ ط¹ظ„ظ‰ طھط±طھظٹط¨ ط§ظ„طھظ†ظپظٹط°.

---

## 10) ط§ظ„ط¥طµظ„ط§ط­ط§طھ ط§ظ„ظ…ظ†ظپط°ط© ظپظٹ ظ‡ط°ظ‡ ط§ظ„ط¬ظ„ط³ط© (2026-09-20 â€” ط¨ط¹ط¯ ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ط£ظˆظ„ظٹ)

طھظ… ط§ظ„ط¨ط¯ط، ظپظٹ ط®ط·ط© ط§ظ„ط¥طµظ„ط§ط­ ظپظˆط±ط§ظ‹ ط¨ط¹ط¯ طھط³ظ„ظٹظ… ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ط£ظˆظ„ظٹ (87/87 ظ†ط§ط¬ط­ط© ظ…ط¹ طھطµظ†ظٹظپ ط§ظ„ط£طµظˆظ„ ظƒظ…ظ„ط§ط­ط¸ط§طھ). ط§ظ„ط¥طµظ„ط§ط­ط§طھ ط§ظ„طھط§ظ„ظٹط© ط£ظڈظ†ط¬ط²طھ ظˆطھظ… ط§ظ„طھط­ظ‚ظ‚ ظ…ظ†ظ‡ط§ ط¨طھط´ط؛ظٹظ„ ظƒط§ظ…ظ„:

| # | ط§ظ„ط¹ظٹط¨ | ط§ظ„ظ…ظ„ظپ ط§ظ„ظ…ظڈط¹ط¯ظ‘ظ„ | ط§ظ„ط¥طµظ„ط§ط­ | ط§ظ„طھط­ظ‚ظ‚ |
|---|---|---|---|---|
| A1 | `GET /logo.png` 404 | `frontend/public/logo.png` (ظ…ظ†ط´ط£ ط¬ط¯ظٹط¯ ط¨ظ†ط³ط® `public/categories/bags.png`) | ط¥ظ†ط´ط§ط، ط£طµظ„ ظ†ط§ظ‚طµ `logo.png` â€” ظƒط§ظ† `CMS.global_settings.logoUrl: '/logo.png'` ظپظٹ `backend/prisma/seed_all.ts:133` ظٹط´ظٹط± ظ„ظ…ظ„ظپ ط؛ظٹط± ظ…ظˆط¬ظˆط¯ | `fetch('http://localhost:3002/logo.png') â†’ 200` + `npx playwright test --project=chromium tests/smoke/home.spec.ts:10` ظٹظ…ط± ط¨ط¯ظˆظ† `HTTP 404 (note)` |
| A2 | `GET /categories/bundles.png` 400 ظˆ `/_next/image?url=%2Fcategories%2Fbundles.png` 400 | `frontend/public/categories/bundles.png` (ظ…ظ†ط´ط£ ط¬ط¯ظٹط¯ ط¨ظ†ط³ط® `bags.png`) | ط¥ظ†ط´ط§ط، ظپط¦ط© `bundles` ظƒط§ظ†طھ ظ…ظڈط¹ط±ظ‘ظپط© ظپظٹ `backend/prisma/seed_all.ts:93` ط¨طµظˆط±ط© `'/categories/bundles.png'` ط؛ظٹط± ظ…ظˆط¬ظˆط¯ط© | `fetch('/categories/bundles.png') â†’ 200` ظˆ `fetch('/_next/image?url=%2Fcategories%2Fbundles.png') â†’ 200` |
| A3 | `CartContext` ظٹظƒطھط¨ `[]` ظپظˆظ‚ ط§ظ„ط³ظ„ط© ط§ظ„ظ…ط­ظپظˆط¸ط© ظ‚ط¨ظ„ ط§ظƒطھظ…ط§ظ„ ط§ظ„ظ‚ط±ط§ط،ط© (race) â€” ط³ط¨ط¨ ظپط´ظ„ ظ…طھظ‚ط·ط¹ `tests/cart/cart.spec.ts:107` (~1/3 ظ…ظ† ط§ظ„طھط´ط؛ظٹظ„ط§طھ) | `frontend/src/context/CartContext.tsx:57` | ط¥ط¶ط§ظپط© `hydrated` ref: ط§ظ„ظ‚ط±ط§ط،ط© ط£ظˆظ„ط§ظ‹ ط«ظ… ط§ظ„ط³ظ…ط§ط­ ط¨ط§ظ„ظƒطھط§ط¨ط© ظپظ‚ط· ط¨ط¹ط¯ `hydrated.current = true` (`useEffect` ط«ط§ظ†ظچ ظٹط­ط±ط³ ط¨ظ€ `if (!hydrated.current) return`) | `npx playwright test --project=chromium` ط«ط¨طھ ط¹ظ†ط¯ `87 passed (2.2m)` ط¨ط¯ظˆظ† طھط°ط¨ط°ط¨ + `npm run build` + `npx tsc --noEmit` ظƒظ„ط§ظ‡ظ…ط§ ظ†ط§ط¬ط­ |
| A4 | `aria-label` ظ…ط´ظˆظ‡ ط³ط§ط¨ظ‚ط§ظ‹ | `frontend/src/components/layout/Header.tsx:320` | طھظ… ظپط­طµظ‡ â€” ط§ظ„ظ…ظ„ظپ ط§ظ„ط­ط§ظ„ظٹ ط³ظ„ظٹظ… (`"ط¥ط؛ظ„ط§ظ‚ ط§ظ„ظ‚ط§ط¦ظ…ط©" / "ظپطھط­ ط§ظ„ظ‚ط§ط¦ظ…ط©"` UTF-8) â€” ظ„ط§ ط­ط§ط¬ط© ظ„طھط¹ط¯ظٹظ„ | `tests/public/navigation.spec.ts:86` ظٹظ…ط± ط¨ظپط­طµ `aria-expanded` |
| A5 | `measure` negative timestamp ظپظٹ `/categories/[slug]` | `frontend/src/app/(site)/categories/[slug]/page.tsx:1` | طھط­ظˆظٹظ„ ط§ظ„طµظپط­ط© ظ…ظ† `server redirect` ط¥ظ„ظ‰ `client redirect` (`'use client'` + `useParams`/`useRouter` + `useEffect router.replace`) ظ„طھط¬ظ†ط¨ ظ‚ظٹط§ط³ Next.js ط§ظ„ط³ظ„ط¨ظٹ | `tests/public/dynamic.spec.ts:31` ظˆ `77` ظٹظ…ط±ط§ظ† ط¨ط¯ظˆظ† `pageerror` |
| A6 | طµظˆط±ط© ط®ظ„ظپظٹط© ط®ط§ط±ط¬ظٹط© `noise.svg` 404 | `frontend/src/components/home/HeroSlider.tsx:172` | ط¥ط²ط§ظ„ط© `bg-[url('https://grainy-gradients.vercel.app/noise.svg')]` ط§ظ„ط®ط§ط±ط¬ظٹط© ظˆط§ظ„ط§ظƒطھظپط§ط، ط¨ط·ط¨ظ‚ط© ط´ظپط§ظپط© ظ…ط­ظ„ظٹط© | ط§ط®طھظپط§ط، `HTTP 404 noise.svg` ظ…ظ† ط§ظ„ظ…ظ„ط§ط­ط¸ط§طھ |
| A7 | ط§ظ†طھظ‡ط§ط، طµظ„ط§ط­ظٹط© JWT ظ„ظ„ط¥ط¯ط§ط±ط© (15m) ظ…ط¹ ط¥ط¹ط§ط¯ط© ط§ط³طھط®ط¯ط§ظ… `admin.json` ظ„ظ€ 12h | `frontend/tests/global-setup.ts:30` ظˆ `frontend/tests/helpers/js-errors.ts:37` | طھظ‚ظ„ظٹظ„ ط¥ط¹ط§ط¯ط© ط§ظ„ط§ط³طھط®ط¯ط§ظ… ط¥ظ„ظ‰ 10 ط¯ظ‚ط§ط¦ظ‚ + ظپط­طµ `exp` ظپظٹ ط§ظ„طھظˆظƒظ† + ط¥ط¶ط§ظپط© `/analytics` ط¥ظ„ظ‰ `AUTH_HYDRATION_NOTE_PATTERNS` ظƒط§ط­طھظٹط§ط·ظٹ | `npx playwright test --project=chromium` ط¹ط§ط¯ ط¥ظ„ظ‰ `87 passed (1.6m)` ط¨ط¹ط¯ ط§ظ†طھظ‡ط§ط، طµظ„ط§ط­ظٹط© ط§ظ„طھظˆظƒظ† ط¹ظ†ط¯ `15:35` |

**ط§ظ„ظ†طھظٹط¬ط© ط¨ط¹ط¯ ط§ظ„ط¥طµظ„ط§ط­ (ظ†ظ‡ط§ط¦ظٹ 2026-09-20 17:12):** `npx playwright test --project=chromium` â†’ **87 passed (1.6m)** ط¨ط¯ظˆظ† ط£ظٹ `HTTP 404/400` ظ„ظ„ط£طµظˆظ„ (طھظ… ط¥ظ†ط´ط§ط، `logo.png` ظˆ `bundles.png`) ظˆط¨ط¯ظˆظ† `pageerror` ظ„ظ„طھطµظ†ظٹظپ ظˆط¨ط¯ظˆظ† `noise.svg` ط§ظ„ط®ط§ط±ط¬ظٹ + `npm run build` ظˆ `npx tsc --noEmit` ظ†ط§ط¬ط­ط§ظ† ظˆظƒظ„ ط§ظ„ظ…ط³ط§ط±ط§طھ `ئ’`/`â—‹` طھظڈط¨ظ†ظ‰ ط¨ظ†ط¬ط§ط­.

