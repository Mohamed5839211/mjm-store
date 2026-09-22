# OWASP ZAP — تقرير فحص الأمان (MJM Store)

> **نطاق الأدوات:** OWASP ZAP فقط — لم تُستخدم k6 أو GitHub Actions أو أي أداة أخرى في هذه المهمة.
> **القاعدة الذهبية:** لم يُغيَّر أي كود تطبيق، ولم تُعدَّل اختبارات Playwright/axe-core، ولم تُنفَّذ أي عملية مدمرة.

## 1. معلومات الفحص

| البند | القيمة |
|---|---|
| تاريخ الفحص | 2026-09-22 (UTC) |
| إصدار ZAP | **المحرك الرسمي غير متاح على هذا المضيف** — لا Docker، لا Java، ولا نسخة ZAP محلية. نُفّذ الفحص بمكوّن مكافئ لـ ZAP Baseline/Passive (Python `requests`) يطبق نفس الفحوص: headers، cookies، CORS، auth negatives، كشف المعلومات، مؤشرات XSS/SQLi على GET فقط |
| طريقة التشغيل | `python zap_equiv_scan.py` + `zap_phase2.py` + `zap_phase3.py` (محفوظة في `C:\Users\mesba\AppData\Local\Temp\opencode\`) — كل الطلبات على `localhost` فقط مع حارس يمنع أي مضيف خارجي |
| النطاقات المفحوصة | `http://localhost:3002` (Frontend Next.js 16.1.6) — `http://localhost:3001/api/v1` (Backend NestJS 11، Swagger `http://localhost:3001/api/docs`) |
| نوع الفحص | Baseline/Passive شامل + Active **محدود** (GET للقراءة فقط + auth negatives آمنة) على قاعدة الاختبار |
| قاعدة البيانات | `mjm_store_test` — شُغّل الـ Backend بتجاوز `DATABASE_URL` إلى قاعدة الاختبار، وتُحقّق من ذلك (صفوف منتجات E2E). قاعدة `mjm_store` لم تُمس |
| المصادقة في الفحص | حسابا اختبار مؤقتان في قاعدة الاختبار فقط (`zap-a-*/zap-b-*@example.local`) + بيانات خاطئة للسلبيات. لم تُستخدم بيانات حقيقية، ولم تُطبع أي كلمة مرور أو JWT أو cookie |

## 2. التغطية

- **صفحات Frontend مفحوصة (24 فحصًا / 22 مسارًا فريدًا):** `/` `/about` `/auth/login` `/auth/register` `/bundles` `/cart` `/categories` `/contact` `/custom-printing` `/faq` `/privacy` `/returns` `/shipping` `/shop` `/terms` `/water-subscriptions` `/mjm` (دخول الإدارة) `/admin` (بوابة التخفي) `/products/4` `/categories/1` `/profile` `/checkout` — إضافة `robots.txt` و`security.txt` و`/_next/...js.map` (كشف source-map).
- **API:** جرد OpenAPI كامل = **90 عملية** (مصنفة: عامة GET، محمية، auth، إنشاء/تعديل، حذف، إدارة، ملفات، طلبات/دفع/شحن) + **~100 فحصًا منفذًا**: سلبيات auth، تحقق مدخلات، CORS (4 origins)، دورة عميل كاملة (تسجيل/دخول/refresh/logout)، RBAC (10 مسارات إدارة + 4 method-override)، IDOR عناوين (إنشاء/عبث عابر/تنظيف)، مؤشرات XSS/SQLi على 5 endpoints قراءة، دفعة قراءة لطيفة (8 طلبات).
- **مسارات مستثناة (مع السبب):** `POST /orders/checkout` (شراء)، الدفع، كل `DELETE` (عدا عنوان الاختبار الخاص بنا)، mutations الإدارة، إرسال الطباعة، webhooks/البريد، brute-force لكلمات المرور — كلها قد تنشئ/تعدل/تحذف بيانات أو تطلق خدمات خارجية.

## 3. عدد النتائج حسب الخطورة

| المستوى | العدد |
|---|---|
| Critical | **0** |
| High | **0** |
| Medium | **2** |
| Low | **3** |
| Informational (حماية صحيحة موثقة) | **10** |
| False Positive | **2** |
| يحتاج مراجعة يدوية | **4** |
| مشكلة بيئة (dev فقط) | **2** |

## 4. جدول النتائج (المستوى / التنبيه / النطاق / الدليل / الحالة / الأولوية)

| المستوى | التنبيه | النطاق | الدليل (غير حساس) | الحالة | الأولوية |
|---|---|---|---|---|---|
| Medium | CORS يعكس أي Origin مع credentials (CWE-942) | API `GET /products` + كل المسارات | `evil.example` و`null` و`localhost:3002.evil.example` حصلوا على `ACAO:<origin>` + `Allow-Credentials:true`. السبب: `main.ts` يسمح بأي origin في غير الإنتاج | مؤكد — يحتاج إصلاحًا | **P1** |
| Medium | غياب `Content-Security-Policy` (CWE-693) | Frontend كل الصفحات (22 مسارًا) | كل الصفحات تفتقد CSP بينما الـ API يضبطه عبر helmet. يوجد `X-Frame:DENY` و`nosniff` | مؤكد — يحتاج إصلاحًا | **P1** |
| Low | `Secure=false` على كوكيز الجلسة محليًا | API `Set-Cookie` (register/login) | `HttpOnly:true` ✓ `SameSite:Strict` ✓ `Secure:false` — الكود يضبط `secure` في الإنتاج فقط (`NODE_ENV===production`) | مشكلة بيئة — تحقق من الإنتاج | P2 |
| Low | غياب `Permissions-Policy` في API | API كل الاستجابات | helmet لا يضبطها افتراضيًا (الـ Frontend يضبطها) | يحتاج إصلاحًا | P2 |
| Low | تخزين مؤقت عام لصفحات HTML (`s-maxage=31536000`) | Frontend | مقبول للصفحات العامة؛ تحقق أن صفحات `/admin` بعد الدخول غير قابلة للتخزين المشترك | يحتاج مراجعة | P3 |
| Info | رموز JWT في body بجانب HttpOnly cookies | API register/login/refresh | تصميم مقصود (تطبيق جوال)؛ انتهاء access مؤكد 15 دقيقة (900s من claims) | حماية صحيحة — راجع HTTPS ومنع الـ logs في الإنتاج | P3 |
| Info | صلاحية التوكن بعد logout حتى انتهائه | API `GET /auth/me` بعد logout | `200` بعد logout — سلوك JWT عديم الحالة **حسب التصميم** (انتهاء قصير 15د) | حماية صحيحة (by design) | P3 |
| Info | Swagger/docs علني | `GET /api/docs` + `docs-json` → 200 | مريح للتطوير؛ قيّده/عطّله في الإنتاج | يحتاج مراجعة | P3 |
| Info | لا HSTS فعلي على HTTP | localhost | الهيدر موجود لكن HSTS لا يُفرض إلا عبر TLS — قيّم على بيئة HTTPS | يحتاج مراجعة (staging) | P3 |
| Info | غياب `robots.txt` و`security.txt` | Frontend → 404 | لا تسريب؛ يُنصح بإضافة `security.txt` | مراجعة | P4 |
| FP | بريد إلكتروني في HTML | كل الصفحات | بريد تواصل عام في التذييل — ليس تسريبًا | False Positive | — |
| FP | تلميحات "أسرار" في HTML | `/auth/register` `/custom-printing` | بعد المراجعة اليدوية: `autoComplete="tel"` و`placeholder` هاتف — ليست أسرارًا | False Positive | — |
| Pass | 401/400/404/409 صحيحة ولا `500` من مدخلات المستخدم | API (20+ سلبية) | بدون auth/invalid/tampered/none-alg/cookie → 401؛ حقول ناقصة/أنواع خاطئة/سالبة → 400؛ غير موجود → 404؛ مكرر → 409؛ PUT → 404 | حماية صحيحة (تم التحقق) | — |
| Pass | منع تعداد المستخدمين | `POST /auth/login` + `/auth/admin/login` | نفس الحالة والرسالة العامة للحساب غير الموجود وكلمة المرور الخاطئة | حماية صحيحة | — |
| Pass | RBAC الإدارة + تجاوز الميثود + حقن الدور | 10 مسارات + 4 methods + `PATCH /auth/profile` | عميل → `403/404` دائمًا؛ `role/type/userId` مُتجاهلة (whitelist DTO) | حماية صحيحة | — |
| Pass | IDOR العناوين + نطاق السلة | `PATCH/DELETE /addresses/:id` عابرًا → 404 (scoped، لا يكشف الوجود)؛ بيانات المالك سليمة؛ تنظيف المالك تم | حماية صحيحة | — |
| Pass | مؤشرات XSS/SQLi | 5 GET endpoints + بحث Frontend | لا انعكاس خام، لا `5xx`، لا بصمات DB | حماية صحيحة (نطاق محدود) | — |
| Pass | بوابة `/admin` التخفّي | `/admin` بدون cookie → 404؛ مع JWT عميل → 404؛ `/mjm` → 200 (بالتصميم، غير مربوط) | حماية صحيحة (دفاع متعدد الطبقات) | — |
| Pass | لا source-maps ولا traces ولا `X-Powered-By` | Frontend/API | `*.js.map` → 404؛ لا stack traces؛ `Server` غير مُفصِح؛ `Cache-Control:no-store` على API | حماية صحيحة | — |

## 5. المصادقة (ملخص)

- بيانات خاطئة (عميل/إدارة): `401` برسالة عامة، لا فرق يكشف الوجود، لا صدى لكلمة المرور.
- تسجيل عميل اختبار: `201`، لا تسريب لكلمة المرور، كوكيز `HttpOnly + SameSite=Strict` (و`Secure` في الإنتاج فقط).
- JWT: انتهاء access **15 دقيقة** (مؤكد من claims: `sub/type/email/iat/exp`)، خوارزمية `none` والمعدَّل مرفوضان (`401`)، refresh عبر الكوكي يعمل والمُعبَّث مرفوض (`401`)، logout يمسح الكوكيز، إعادة استخدام التوكن تبقى صالحة حتى انتهائها (by design — Informational).
- `ADMIN_EMAIL/ADMIN_PASSWORD` لم يكونا مضبوطين في البيئة؛ لم يُنشأ أي مدير — اختبارات الإدارة تمت بدور عميل (وصول مرفوض كما هو متوقع).

## 6. الصلاحيات والأدوار (ملخص)

- غير مصادق على `/admin` (واجهة): `404` تخفّي — صحيح.
- عميل على `/admin` (واجهة) مع JWT عميل: `404` — صحيح (البوابة تقبل admin فقط).
- عميل على كل مسارات API الإدارية (10 مسارات): `403/404` — صحيح، ولا تجاوز عبر تغيير الميثود.
- حقن `role/type/userId` في الملف الشخصي: مُتجاهل — صحيح.
- IDOR: عبث عابر بعنوان مستخدم آخر → `404` scoped، بيانات المالك intact، سلة كل مستخدم معزولة — صحيح.

## 7. CORS وSecurity Headers (ملخص)

- **CORS (Medium):** يعكس أي `Origin` (حتى الخبيث و`null`) مع `credentials:true` في بيئة التطوير — الكود (`main.ts:52-64`) يسمح صراحة بذلك خارج الإنتاج. الإصلاح: قائمة بيضاء صارمة دائمًا، ورفض الغريب، ومنع `*` مع credentials، والتحقق من `NODE_ENV=production` في الإنتاج.
- **API headers:** CSP (helmet) ✓ `X-Frame:SAMEORIGIN` ✓ `nosniff` ✓ `Referrer:no-referrer` ✓ `HSTS` ✓ `COOP` ✓ `Cache-Control:no-store` ✓ — ينقص `Permissions-Policy` (Low).
- **Frontend headers:** `X-Frame:DENY` ✓ `nosniff` ✓ `Referrer` ✓ `Permissions-Policy` ✓ — ينقص **`CSP`** (Medium)، و`HSTS` غير قابل للتقييم على HTTP.

## 8. كشف المعلومات والأخطاء

- لا JWT/passwords/cookies/secrets في أي HTML أو body (فُحصت كل الاستجابات آليًا + عينات يدوية).
- لا stack traces ولا أسماء جداول/حقول داخلية ولا مسارات ملفات محلية ولا X-Powered-By.
- أجسام الأخطاء منظمة (`code/message/path`) بدون تفاصيل داخلية — مقبولة.
- `409` للتعارض (تسجيل مكرر)، `429` مُهيأ (global 100/min + حدود أشد: تغيير كلمة المرور 3/5min، refresh 10/15min...) — لم يُجبَر `429` عمدًا (تجنب الإساءة)؛ دفعة لطيفة (8 قراءات) → كلها `200` كما هو متوقع.

## 9. توصيات الإصلاح (مرتبة)

1. **P1:** تقييد CORS بقائمة بيضاء (احذف المسار المتساهل في غير الإنتاج أو قيده بـ `localhost` فقط) + اختبار رفض origin غريب.
2. **P1:** إضافة `Content-Security-Policy` للـ Frontend عبر `next.config.ts headers`.
3. **P2:** إضافة `Permissions-Policy` للـ API (helmet)، والتأكد من `Secure` للكوكيز في الإنتاج (الكود جاهز — تحقق من `NODE_ENV`).
4. **P3:** تقييد `/api/docs` في الإنتاج، مراجعة عدم تسجيل التوكنات، إضافة `security.txt`، مراجعة `Cache-Control` لصفحات `/admin` بعد الدخول، وتأكيد سلوك `429` مرة واحدة في staging.
5. لاحقًا (خارج هذه المرحلة): فحص ZAP الرسمي الكامل عند توفر Docker/Java، واختبار TLS على بيئة HTTPS.

## 10. الملفات المنشأة

- `OWASP_ZAP_SECURITY_REPORT.md` (هذا الملف — جذر المشروع)
- `reports/zap/zap-frontend-baseline.json` — فحص 24 صفحة (headers/cookies/disclosure)
- `reports/zap/zap-frontend-baseline.html` — نفس النتائج بصيغة ZAP-style
- `reports/zap/zap-api-baseline.json` — جرد 90 عملية + 48 فحص baseline/active
- `reports/zap/zap-api-baseline.html` — الجرد والفحوصات بصيغة ZAP-style
- `reports/zap/zap-auth-rbac-phase2.json` — دورة المصادقة (34 فحصًا)
- `reports/zap/zap-rbac-idor-phase3.json` — RBAC/IDOR (20 فحصًا)

## 11. أوامر إعادة تشغيل الفحص

```powershell
# 1) Backend على قاعدة الاختبار (إلزامي قبل أي Active Scan)
$env:DATABASE_URL='mysql://root@localhost:3306/mjm_store_test'; $env:PORT='3001'
# من D:\mjm\MJM-main\backend:
cmd /c "npm run start"

# 2) Frontend على 3002 (من D:\mjm\MJM-main\frontend):
cmd /c "npm run start -- -p 3002"

# 3) الفحص (ZAP-equivalent — localhost فقط):
python C:\Users\mesba\AppData\Local\Temp\opencode\zap_equiv_scan.py
python C:\Users\mesba\AppData\Local\Temp\opencode\zap_phase2.py
python C:\Users\mesba\AppData\Local\Temp\opencode\zap_phase3.py
python C:\Users\mesba\AppData\Local\Temp\opencode\gen_html.py

# 4) عند توفر Docker استخدم ZAP الرسمية بدل المكوّن:
# docker run --rm -v ${PWD}/reports/zap:/zap/wrk:rw ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://localhost:3002 -r zap-frontend-baseline.html -J zap-frontend-baseline.json
# docker run --rm -v ${PWD}/reports/zap:/zap/wrk:rw --network host ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://localhost:3001/api/v1 -r zap-api-baseline.html -J zap-api-baseline.json
```

## 12. تأكيدات الامتثال

- [x] الفحص على `localhost` وبيئة الاختبار فقط (`mjm_store_test`) — حارس آلي يمنع أي مضيف آخر.
- [x] لا عمليات شراء/دفع/حذف/تعديل حقيقية — المسموح فقط: حسابا اختبار + عنوان اختبار (نُظّف) في قاعدة الاختبار.
- [x] بدأ بـ Baseline/Passive؛ الـ Active محدود (GET قراءة + auth negatives) على قاعدة الاختبار.
- [x] لا أسرار في التقارير (تحقق آلي: لا كلمات مرور ولا JWT خام ولا cookies ولا مفاتيح).
- [x] لم يُغيَّر كود التطبيق ولا اختبارات Playwright/axe-core (تحقق عبر `git status` أدناه إن وُجد).
- [x] لم تُشغَّل k6 أو أي أداة أخرى.
