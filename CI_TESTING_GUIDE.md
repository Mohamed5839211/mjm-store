# CI Testing Guide — MJM Store (GitHub Actions)

> English summary at the end. لا تُعدّل منطق التطبيق من هذه الملفات — workflows فقط.

## 1. Workflows ومتى تعمل

| Workflow | الملف | يعمل عند | ماذا يشغّل |
|---|---|---|---|
| quality | `.github/workflows/quality.yml` | PR + push لـ main/master | tsc + ESLint (بلا `--fix`) + build (frontend/backend) + jest unit (mocked) |
| backend-tests | `.github/workflows/backend-tests.yml` | PR + push | MySQL 8.0 خدمة → `prisma migrate deploy` على `mjm_store_test` → jest unit → jest e2e |
| playwright | `.github/workflows/playwright.yml` | PR + push | MySQL + migrate + `seed_all.ts` → Chromium: كاملة مع ADMIN_* أو عامة فقط بدونهما |
| accessibility | `.github/workflows/accessibility.yml` | PR + push | نفس تجهيز Playwright → `tests/accessibility --project=chromium` (بلا تعطيل axe) |
| lighthouse | `.github/workflows/lighthouse.yml` | يدوي + push main/master (ليس PR) | build إنتاجي + `npx lighthouse` (desktop+mobile لصفحات `/` `/shop` `/auth/login`) — بلا عتبات إفشال |
| security | `.github/workflows/security.yml` | يدوي + push main/master + أسبوعيًا | ZAP الرسمي (Docker, `--network host`) baseline على localhost فقط — بلا active scan |
| k6 | `.github/workflows/k6.yml` | **يدوي فقط** (`workflow_dispatch`) | أحمال `tests/k6` على `mjm_store_test` — أبدًا تلقائيًا |

## 2. الأوامر الفعلية المستخدمة (من package.json — لا سكربتات مخترعة)

- Frontend: `npx tsc --noEmit`، `npx eslint .`، `npm run build`، `npx playwright test --project=chromium`، `npx lighthouse` (devDep).
- Backend: `./node_modules/.bin/tsc --noEmit`، `npx eslint "{src,apps,libs,test}/**/*.ts"`، `npm run build`، `npm test -- --runInBand`، `npm run test:e2e -- --runInBand`، `npx prisma migrate deploy`، `npx ts-node -r dotenv/config prisma/seed_all.ts`، `npm run start:prod`.
- Node **22** في كل الوظائف (`actions/setup-node@v4` + `npm ci` — ملفات lock موجودة في الثلاثة مجلدات).

## 3. الأسرار المطلوبة (الأسماء فقط — تُضبط في Settings → Secrets → Actions)

| السر | الاستخدام | مطلوب في |
|---|---|---|
| `DB_ROOT_PASSWORD` | كلمة مرور root لخدمة MySQL (أو `DATABASE_URL_TEST` كاملًا بدلًا منها) | backend-tests, playwright, accessibility, lighthouse, security, k6 |
| `DATABASE_URL_TEST` | (اختياري) رابط كامل `mysql://root:***@127.0.0.1:3306/mjm_store_test` | نفس ما سبق (يُبنى تلقائيًا من `DB_ROOT_PASSWORD` إن غاب) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | توقيع JWT في CI (≥16 حرفًا، `openssl rand -base64 32`) | نفس ما سبق |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | دخول الإدارة لمواصفات `/admin` | playwright (كاملة)، k6 (سيناريو admin) — **إن غابتا: المواصفات العامة فقط + تخطٍّ مُعلن، لا فشل صامت** |
| `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | عميل لسيناريوهات k6 المصادقة | k6 فقط — إن غابت: عميل مؤقت عشوائي يُسجَّل داخل التشغيل نفسه |

لا تُطبع القيم أبدًا (خطوة تحقق تسرد الأسماء الناقصة فقط). لا كلمات مرور/JWT/cookies في workflows أو التقارير أو Artifacts (فُحصت آليًا).

## 4. تشغيل k6 يدويًا

Actions → k6 → Run workflow → اختر `stage` (الافتراضي `smoke` — لا `high` افتراضيًا) و`scenario` (`public` افتراضيًا). التقييم: `429/401` المتوقعة لا تُفشل؛ أي `server_errors>0` أو `timeouts>0` أو `status_5xx>0` أو JWT خام في الملخصات تُفشل الوظيفة. النتائج في artifact `k6-results`.

## 5. التقارير (Artifacts)

`backend-test-results` (عند الفشل) — `playwright-report` — `accessibility-report` — `lighthouse-reports` — `zap-reports` — `k6-results`. لا `node_modules` أبدًا.

## 6. معنى الفشل

- quality: خطأ TypeScript/ESLint/build/unit — أصلح الكود (ملاحظة: `tests/fixtures/base.ts` فيه خطأ `react-hooks/rules-of-hooks` مسبق الوجود يُفشل lint على checkout نظيف — إصلاحه بإعادة تسمية المساعد، خارج نطاق CI).
- backend-tests: فشل DB/seed/jest — تحقق من الأسرار والمهاجرات.
- playwright: فشل حقيقي يُفشل (لا `continue-on-error`)؛ غياب ADMIN_* يشغّل العامة فقط مع `notice` (ليس فشلًا).
- accessibility: أي مخالفة axe حقيقية تُفشل (الفشلتان المعروفتان `/shop` و`/categories` — heading/landmark/image — مسبقتا الوجود ومثبتتا البراءة من CSP عبر تجربة بناء-بدون-CSP).
- lighthouse: لا يُفشل على فروق الأداء (بلا baseline معتمد بعد).
- security: أي Medium+ من ZAP يُفشل (سلوك ZAP الافتراضي)؛ غياب Docker يُفشل بصوت عالٍ مع `ZAP-SKIPPED.md` (لا تخطٍّ صامت).
- k6: يُفشل فقط على `5xx`/timeouts/تسريب أسرار؛ `429/401` المتوقعة تمر.

## 7. التشغيل المحلي (كما تم التحقق)

```powershell
# Backend quality + unit + e2e (e2e على mjm_store_test حصرًا، تُنظف نفسها)
npx tsc --noEmit; npm test -- --runInBand; npm run test:e2e -- --runInBand
# Frontend quality
npx tsc --noEmit; npx eslint .
# Playwright + accessibility (chromium فقط محليًا؛ firefox/webkit غير مثبتة)
npx playwright test --project=chromium --reporter=list
npx playwright test tests/accessibility --project=chromium
# k6 (k6 v2.3.0، أسرار عبر -e فقط، تسلسليًا)
k6 run -e STAGE=smoke tests/k6/public-read.js
```
نتائج التحقق المحلي لهذه المرحلة: YAML السبعة سليمة؛ tsc نظيف (backend+frontend)؛ jest unit ‏29/29؛ jest e2e ‏9/9؛ accessibility ‏39 ناجحًا + 2 مسبقة؛ backend lint نظيف بعد إصلاح 3 أسطر prettier من مرحلة سابقة؛ frontend lint فيه دَين مسبق (258 في مجلدات مُولّدة + خطأ واحد حقيقي في `tests/fixtures/base.ts`).

## 8. القيود

- لا git محليًا — الفروع `main/master` في المحفزات قد تحتاج ضبطًا لاسم الفرع الافتراضي.
- Firefox/WebKit وLighthouse الكامل لم تُتحقق محليًا (chromium فقط) — تعمل في CI عبر التثبيت التلقائي.
- ZAP وk6 بأحمالهما العليا لم تُشغَّل في CI هنا (تحتاج runner) — المنطق رُوجِع سطرًا بسطر والأوامر مطابقة للتشغيل المحلي الموثق في تقارير المراحل السابقة.
- PRs من forks خارجية بلا secrets: quality يعمل كاملًا؛ وظائف DB تفشل سريعًا برسالة الأسماء الناقصة (قيد GitHub المعروف).

---
**English summary:** 7 workflows (quality, backend-tests, playwright, accessibility, lighthouse-manual, zap-baseline, k6-manual-only). Node 22, npm ci, MySQL 8.0 service with isolated `mjm_store_test`, secrets by name only, Chromium-first, ZAP official Docker baseline on localhost, k6 dispatch-only with 429-tolerant/5xx-strict evaluation, artifacts per area, no app-logic changes.
