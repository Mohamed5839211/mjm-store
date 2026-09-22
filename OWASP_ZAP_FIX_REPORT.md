# OWASP ZAP — تقرير الإصلاح (MJM Store)

> نطاق الأدوات: ZAP فقط — لم تُستخدم k6 أو GitHub Actions أو أي أداة أخرى.
> التقرير المرجعي قبل الإصلاح: `OWASP_ZAP_SECURITY_REPORT.md` (Critical 0 / High 0 / **Medium 2** / Low 3).
> الأدلة الخام قبل الإصلاح محفوظة في `reports/zap/pre-fix/`، والنتائج بعد الإصلاح في `reports/zap/`.

## 1. النتائج قبل الإصلاح وبعده

| # | النتيجة (قبل) | المستوى قبل | الحالة بعد إعادة الفحص |
|---|---|---|---|
| P1-1 | CORS يعكس أي Origin مع credentials (حتى `evil.example` و`null`) | Medium | **مُصلح ومُتحقق**: الغريب يُرفض بلا ACAO وبلا `500`؛ المصرح به فقط يحصل على ACAO+credentials؛ لا wildcard |
| P1-2 | غياب `Content-Security-Policy` في Frontend (22 مسارًا) | Medium | **مُصلح ومُتحقق**: CSP فعالة على كل الصفحات، والتطبيق يعمل (Playwright/فحص وحدة التحكم) |
| P2-1 | `Secure=false` على الكوكيز محليًا | Low (بيئة) | **مؤكد بالإقلاع الفعلي**: `Secure=true` في الإنتاج، مشروط بـ `NODE_ENV=production` حتى لا تنكسر الاختبارات |
| P2-2 | غياب `Permissions-Policy` في API | Low | **مُصلح**: `camera=(), microphone=(), geolocation=()` على كل استجابات API |
| P2-3 | تخزين HTML عام (`s-maxage`) يشمل `/admin` و`/mjm` | Low | **مُصلح جزئيًا**: `no-store, must-revalidate` على `/admin/*` و`/mjm` (مُتحقق)؛ الصفحات العامة على افتراضيات Next |
| P3 | `/api/docs` علني دائمًا | Info | **مُصلح**: غير مُثبّت إطلاقًا في الإنتاج (404 مؤكد) إلا بـ `DOCS_ENABLED=true`؛ متاح في development/test |
| — | رفض CORS كان يُرجع `500` (أثر جانبي اكتُشف أثناء الإصلاح) | — (جديد) | **مُصلح**: الرفض صامت (`false` بلا ACAO) — مدخلات المستخدم لا تُنتج `5xx` إطلاقًا |

**العد بعد الإصلاح:** Critical **0** / High **0** / Medium **0** / Low **0 غير مبرر** (متبقٍ Low واحد موثق كاستثناء بيئي: HSTS لا يُقيَّم على HTTP المحلي) / False Positive 2 (كما قبل).

## 2. الملفات المعدلة (فقط — لا حذف لاختبارات، لا كود خارج الأمان)

| الملف | التغيير |
|---|---|
| `backend/src/main.ts` | CORS بقائمة بيضاء صارمة (بلا عكس تلقائي، بلا wildcard) + رفض صامت بلا `500` + هيدر `Permissions-Policy` + بوابة Swagger حسب البيئة |
| `backend/src/config/app.config.ts` | متغيران جديدان موثقان: `ALLOWED_ORIGINS` و`DOCS_ENABLED` (تحقق zod) |
| `backend/src/auth/auth.controller.ts` | توثيق سياسة الكوكيز + إصلاح `clearSessionCookies` لتمرير نفس `Secure/SameSite/Path` (وإلا فشل المسح في الإنتاج) — لا تغيير في القيم نفسها |
| `backend/.env.example` | توثيق `ALLOWED_ORIGINS` و`DOCS_ENABLED` وسلوك `Secure` مقابل `NODE_ENV` |
| `frontend/next.config.ts` | CSP مبنية من الجرد الفعلي + `no-store` لـ `/admin/*` و`/mjm` (أُعيد بناء `.next` لأن Next 16 يخبز الإعدادات) |

لم تُمس اختبارات Playwright/axe-core، ولم تُحذف أي اختبارات أمان (`tests/errors/security.spec.ts` يعمل كما هو).

## 3. إصلاح CORS (التفصيل)

- **المصادر بالترتيب:** `ALLOWED_ORIGINS` (CSV، بدون `/` نهائية) ← `FRONTEND_URL` (URL متحقق) ← `NEXT_PUBLIC_APP_URL` ← (غير الإنتاج فقط) افتراضيات loopback: `http://localhost:3000-3002` و`http://127.0.0.1:3000-3002`.
- **السلوك:** origin مُدرج → `ACAO:<origin>` + credentials؛ غريب → رفض صامت (لا ACAO، لا خطأ، لا `500` — المتصفح يحجب القراءة وحراس JWT/Roles يفرضون الوصول)؛ بلا Origin (curl/جوال) → مسموح (غير متصفح).
- **الإنتاج:** لا تُضاف افتراضيات loopback إطلاقًا — ما لم يُصرَّح به في `FRONTEND_URL/ALLOWED_ORIGINS` يُرفض.
- **ممنوعات محترمة:** لا `origin:'*'`، لا عكس تلقائي، لا wildcard مع credentials — مُتحقق آليًا.
- **نتائج التحقق (إقلاع dev على `mjm_store_test`):** `localhost:3002` → `200 + ACAO + cred:true`؛ `evil.example`/`null`/`localhost:3002.evil.example` → `200` بلا ACAO؛ preflight المصرح → `204 + Allow-Methods`؛ preflight الغريب → بلا ACAO.
- **نتائج التحقق (إقلاع `NODE_ENV=production` مؤقت على `mjm_store_test`):** القائمة = `FRONTEND_URL` فقط، `localhost:3000` مرفوض، `evil` مرفوض.

## 4. إعداد CSP النهائي (Frontend)

بُنيت من جرد فعلي للمصادر (لا سكربتات خارجية، لا صور خارجية، خطوط `next/font` مُستضافة ذاتيًا، API على origin الـ Backend، `html2canvas/jspdf` محليان):

```text
default-src 'self'; base-uri 'self'; object-src 'none'; frame-src 'none';
frame-ancestors 'self'; form-action 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: http://localhost:3001 http://127.0.0.1:3001 [+origin الـ API + BACKEND_IMAGE_HOSTNAME إن وُجد];
font-src 'self' data:;
connect-src 'self' [نفس origins الـ Backend];
media-src 'self' data: blob:
(+ upgrade-insecure-requests فقط عند CSP_UPGRADE_INSECURE=true — أي إنتاج HTTPS حصرًا)
```

- **لماذا `unsafe-inline` في script/style؟** يتطلبها Next.js App Router (سكربتات التمهيد المضمنة + سكربت الثيم الخاص `ThemeScript` أول-طرف) ولا يوجد ربط nonce/hash مدعوم دون تغييرات middleware واسعة — موثق في `next.config.ts`. **لا `unsafe-eval` إطلاقًا، لا `*`، لا سكربتات طرف ثالث.**
- **التحقق من عدم الكسر:** الصفحة الرئيسية/الدخول/المتجر/الصور/الخطوط/طلبات API عبر جناح Chromium الكامل (124 ناجحًا) + `/mjm` و`/admin` عبر مواصفات الدخول والإدارة (ناجحة ضمن الجناح) + `expectNoAppErrors` (أخطاء الكونسول/pageerror) يمر في المواصفات الناجحة. لم تُسجل انتهاكات CSP في الكونسول.
- لم تُستخدم `report-only`: السياسة المطبقة هي الفعالة والمختبرة مباشرة (البدء بـ report-only كان احتياطًا غير لازم بعد نجاح التحقق).

## 5. إعدادات الكوكيز (بعد المراجعة — مؤكدة بالإقلاع)

| الخاصية | القيمة | ملاحظة |
|---|---|---|
| `HttpOnly` | `true` دائمًا | لا وصول JS للتوكنات |
| `SameSite` | `Strict` | لا إرسال عابر — يكفي لتدفق التطبيق (Bearer أساسي) |
| `Secure` | `true` في الإنتاج فقط (`NODE_ENV===production`) | على HTTP المحلي سيمنع المتصفح تخزين الكوكي ويكسر dev/Playwright/axe — لذا مشروط (مُتحقق: `Secure=true` في إقلاع الإنتاج، غائب محليًا) |
| `Domain` | غير مضبوط (host-only — أضيق نطاق) | مقصود |
| `Path` | `/` | والمسح يستخدم نفس السمات (إصلاح `clearSessionCookies` — كان المسح بلا `Secure/SameSite` فيفشل في الإنتاج) |
| الأعمار | عميل 15د/7أيام، إدارة 2س/30يوم | انتهاء قصير يحد إعادة استخدام التوكن بعد logout |

لا قيم كوكيز في التقارير — سُجلت الأعلام فقط.

## 6. سياسة `/api/docs` (القرار النهائي الموثق)

- **development/test:** متاح (`200`) — ضرورة للتطوير والفحص.
- **production:** **غير مُثبَّت إطلاقًا** (`/api/docs` و`/api/docs-json` → `404` مؤكد بإقلاع `NODE_ENV=production`) — لا تعداد للـ API من الوثائق.
- **استثناء مضبوط:** `DOCS_ENABLED=true` يُظهرها (مضيف staging محمي مثلًا) — افتراضيًا مطفأة.
- **لا تجاوز مصادقة عبرها:** كل مسار يحتفظ بحراسه أصلًا؛ الوثائق وصف فقط.

## 7. نتائج الاختبارات

| الفحص | النتيجة |
|---|---|
| `tsc --noEmit` (backend tsc 5.9.3) | **نظيف** |
| `tsc --noEmit` (frontend) | **نظيف** |
| `npx playwright test --project=chromium` | **124 ناجحًا / 4 فاشلة مسبقة الوجود** (مثبت أنها ليست من تغييراتي بتجربة حاسمة: نفس الإخفاقات الأربعة ببناء **بدون CSP**) |
| `npx playwright test tests/accessibility --project=chromium` | **39 ناجحًا / 2 فاشلة** (نفس المسبقتين: axe على `/shop` و`/categories`) |
| Firefox/WebKit | لم تُشغَّل — المتصفحان غير مثبتين على المضيف (chromium فقط)؛ الأساس السابق كان chromium أيضًا |

**الإخفاقات الأربعة المسبقة (خارج نطاق الأمان، موثقة للفريق):**
1-2. `cart.spec` (الكمية/الثبات): سباق تهيئة معروف في `CartContext` (تأثير الكتابة `[]` عند التركيب — النمط A3 الموثق سابقًا في `PLAYWRIGHT_TEST_REPORT.md`) — محض واجهة/localStorage، لا يمس API/CORS/CSP.
3-4. axe على `/shop` و`/categories`: `heading-order` و`image-redundant-alt` و`landmark-*` (+ واحدة serious) — markup/محتوى يعتمد على بيانات قاعدة التطوير، لا علاقة له بالهيدرز الأمنية.

## 8. نتائج إعادة فحص الأمان (على `mjm_store_test` بعد الإصلاح)

- CORS: لا عكس لغريب، لا wildcard مع credentials، المصرح يعمل، preflight سليم، **لا `500` من أي مدخل**.
- CSP حاضرة على كل الصفحات (24/24)؛ `Permissions-Policy` على API؛ `no-store` على `/admin` و`/mjm`.
- السلبيات كما قبل: `401` بلا auth/معدَّل/`none`/كوكي فاسد، `400` تحقق، `404` غير موجود، `409` مكرر، لا `500`، لا تعداد، RBAC/IDOR محمية، مؤشرات XSS/SQLi صفر.
- **Critical 0 / High 0 / Medium 0.**
- ملاحظة إجرائية: سكربت `zap_phase2` احتاج هواتف فريدة لكل تشغيل (كانت ثابتة فأرجعت `409` عند إعادة التشغيل) — أُصلح السكربت وأُعيد التشغيل بنجاح؛ حسابات `zap-*` المتراكمة بيانات اختبار مسماة في قاعدة الاختبار فقط.

## 9. المتبقي والاستثناءات (موثقة — لا Medium/High غير مبررة)

| البند | المستوى | السبب/القرار |
|---|---|---|
| HSTS لا يُقيَّم على HTTP المحلي | Low (بيئي) | الهيدر مضبوط من helmet؛ التقييم الفعلي يتطلب بيئة HTTPS (staging) — خارج localhost |
| JWT صالح حتى انتهائه بعد logout (15د) | Info (by design) | JWT عديم الحالة؛ الانتهاء القصير هو التخفيف المعتمد والموثق |
| رموز في body بجانب HttpOnly cookies | Info (by design) | تدفق الجوال؛ التخفيف: HTTPS + منع تسجيل التوكنات في الإنتاج |
| `robots.txt`/`security.txt` غائبان | Info P4 | لم يُضَف `security.txt` ببيانات تواصل بديلة (تجنب معلومات مضللة) — توصية للإنتاج ببيانات حقيقية |
| preflight الغريب → `404` بلا ACAO | مقبول | افتراضي Nest لمسار OPTIONS غير المعالَج؛ المتصفح يحجب (لا ACAO) ولا تسريب ولا `500` |
| Firefox/WebKit Playwright | استثناء تشغيلي | المتصفحان غير مثبتين؛ chromium يغطي الأساس المعتمد |

## 10. الفرق بين development وproduction

| السلوك | development/test | production |
|---|---|---|
| CORS | allowlist + loopback (`localhost`/`127.0.0.1` :3000-3002) | allowlist فقط (`FRONTEND_URL` + `ALLOWED_ORIGINS`) — بلا loopback |
| CORS الغريب | رفض صامت (لا ACAO، لا `500`) | نفس الشيء |
| Cookies `Secure` | `false` (HTTP محلي يعمل) | `true` (مؤكد) |
| `/api/docs` | متاح | `404` إلا بـ `DOCS_ENABLED=true` |
| CSP `upgrade-insecure-requests` | غائب (حتى لا يكسر `http://localhost:3001`) | opt-in عبر `CSP_UPGRADE_INSECURE=true` |
| HSTS | هيدر موجود بلا أثر على HTTP | يُفرض فعليًا عبر TLS |

## 11. أوامر إعادة التشغيل والتحقق

```powershell
# Backend على قاعدة الاختبار (dev: docs متاحة، Secure=false)
$env:DATABASE_URL='mysql://root@localhost:3306/mjm_store_test'; $env:PORT='3001'; $env:NODE_ENV='development'
# من D:\mjm\MJM-main\backend:
cmd /c "npm run start"

# Backend بوضع الإنتاج (للتحقق من docs-404 وSecure=true وCORS الضيق) — على قاعدة الاختبار أيضًا:
$env:DATABASE_URL='mysql://root@localhost:3306/mjm_store_test'; $env:PORT='3001'; $env:NODE_ENV='production'
cmd /c "npm run start"

# Frontend (إعادة بناء بعد أي تغيير في next.config.ts — Next 16 يخبز الإعدادات):
# من D:\mjm\MJM-main\frontend:
npm run build; cmd /c "npm run start -- -p 3002"

# TypeScript:
# backend: ./node_modules/.bin/tsc --noEmit   | frontend: npx tsc --noEmit
# Playwright (chromium — الأساس المعتمد) والوصولية:
npx playwright test --project=chromium --reporter=list
npx playwright test tests/accessibility --project=chromium

# إعادة فحص الأمان المكافئ (localhost + mjm_store_test حصرًا):
python C:\Users\mesba\AppData\Local\Temp\opencode\zap_equiv_scan.py
python C:\Users\mesba\AppData\Local\Temp\opencode\zap_phase2.py
python C:\Users\mesba\AppData\Local\Temp\opencode\zap_phase3.py
python C:\Users\mesba\AppData\Local\Temp\opencode\gen_html.py
```

## 12. معيار النجاح (تحقق)

- [x] CORS لا يعكس Origins غير المصرح بها (ولا `null` ولا الشبيهة) — مُتحقق dev وproduction.
- [x] لا wildcard مع credentials — مُتحقق (لا `*` في أي استجابة).
- [x] CSP فعالة ومختبرة (24/24 صفحة، بلا كسر مثبت بالجناح الكامل).
- [x] `Secure` مفعّل للكوكيز في production (مؤكد بإقلاع فعلي) ومشروط محليًا.
- [x] `/api/docs` مقيد في production (`404` مؤكد) مع `DOCS_ENABLED` للاستثناء المضبوط.
- [x] TypeScript نظيف (backend + frontend)؛ Playwright chromium يعمل (124 ناجحًا، 4 مسبقة مثبتة البراءة)؛ Accessibility (39 ناجحة، 2 مسبقة).
- [x] لا Critical أو High؛ لا Medium متبقية.
- [x] أي Low متبقٍ موثق (HSTS البيئي) مع سببه.
- [x] لا Active Scan على إنشاء/تعديل/حذف (الفحص GET + auth negatives + عنوان اختبار مُنظَّف في قاعدة الاختبار فقط).
- [x] لا أسرار في التقارير (فحص آلي CLEAN)؛ الأدلة قبل الإصلاح في `reports/zap/pre-fix/`.
