# K6 — تقرير اختبار الضغط والأداء (MJM Store API)

> نطاق الأدوات: **k6 فقط** — لم تُستخدم GitHub Actions أو أي أداة أخرى.
> البيئة: `http://localhost:3001/api/v1` على قاعدة **`mjm_store_test`** حصرًا (تحقق: صفوف E2E).
> لا عمليات مدمرة: كل السيناريوهات GET للقراءة + `POST /auth/login` (مصادقة فقط). لا شراء/دفع/حذف/تعديل.

## 1. البيئة والأدوات

| البند | القيمة |
|---|---|
| k6 | **v2.3.0** (windows/amd64) — ثُبّت محليًا من GitHub Releases (لا Docker/winget-admin) في `Temp\opencode\k6\k6.exe` |
| Node.js | v22.23.2 (تشغيل الـ Backend فقط، لا يُستخدم في k6) |
| Backend | NestJS 11 على `localhost:3001` بقاعدة `mjm_store_test` |
| وقت الفحص | 2026-09-22 (UTC+3) — مراحل متسلسلة (لا توازي) |
| الجهاز | Intel i7-12700KF (12 نواة)، RAM ~32GB، Windows — الحمل والخادم على نفس الجهاز (يُقرأ معه عنق الزجاجة) |

## 2. المسارات

**مفحوصة (GET فقط + login):** `/products` `/products?limit=5` `/products/4` `/categories` `/bundles` `/offers` `/cms/home` `/cms/settings` `/cms/pages/home` (عامة) — `/auth/me` `/addresses` `/orders` `/cart` `/water-subscriptions` `/support-tickets` (عميل) — `POST /auth/login` (صالح + خاطئ) — `/admin/customers` `/admin/orders` `/admin/invoices` `/admin/shipping-zones` `/admin/contact` `/analytics/overview` (مدير، قراءة فقط).

**مستثناة (مع السبب):** كل POST/PATCH/PUT/DELETE المُغيّرة (طلبات/دفع/سلة/عناوين/إدارة/CMS/طباعة/webhooks) — خطر تغيير البيانات؛ `/admin/invoices/{id}/download-pdf` — ثقيل ثنائي خارج نطاق القراءة الخفيفة؛ brute-force كلمات المرور — ممنوع.

## 3. المراحل المنفذة (12 تشغيلًا + تشخيص واحد)

| المرحلة | الإعداد | نفذت على |
|---|---|---|
| smoke | 1 VU / 30s | public, auth, login, admin |
| baseline | صعود 1→5 VUs/1m + ثبات 5/2m + نزول 30s | public, auth, login, admin |
| medium | صعود 1→10/2m + ثبات 10/5m + نزول 1m | public, auth |
| high | صعود 1→25/3m + ثبات 25/5m + نزول 30s | public (بعد ثبات medium: صفر 5xx) |
| login-peak | 10 VUs / 2m (سقف §6 لتسجيل الدخول) | login |

## 4. جدول النتائج

| السيناريو | VUs | المدة | الطلبات | p50 | p95 | p99 | الفشل* | 5xx | الحالة |
|---|---|---|---|---|---|---|---|---|---|
| public smoke | 1 | 30s | 67 | 2.5ms | 5.7ms | ~9ms† | 0% | 0 | ناجح |
| public baseline | 5 | 3.5m | 1858 | 1.6ms | 3.9ms | ~9ms† | 31.6% (429) | 0 | ثابت — throttle متوقع |
| public medium | 10 | 8m | 8698 | 0.7ms | 2.8ms | ~21ms† | 59% (429) | 0 | ثابت — throttle متوقع |
| public high | 25 | 8.5m | 22447 | 0.7ms | 2.2ms | ~17ms† | 78% (429) | 0 | ثابت — throttle متوقع |
| auth smoke | 1 | 30s | 69 | 2.8ms | 5.7ms | ~211ms† | 0% | 0 | ناجح (عزل الجلسة 0) |
| auth baseline | 5 | 3.5m | 1859 | 2.0ms | 4.1ms | ~218ms† | 35.9% (429) | 0 | ثابت — throttle متوقع |
| auth medium | 10 | 8m | 8701 | 0.7ms | 3.3ms | ~210ms† | 66% (429) | 0 | ثابت — throttle متوقع |
| login smoke | 1 | 30s | 42 (21 صالح + 21 خاطئ) | 222ms | 229ms | ~231ms† | 50% (401 متوقعة) | 0 | ناجح |
| login baseline | 5 | 3.5m | 1556 (129/129/1298) | 0.8ms‡ | 235ms | ~377ms† | 91.7% (429) | 0 | throttle يعمل — سلوك متوقع |
| login peak | 10 | 2m | 1750 (101/99/1550) | 0ms‡ | 220ms | ~375ms† | 94% (429) | 0 | throttle يعمل — سلوك متوقع |
| admin smoke | 1 | 30s | 36 | 3.4ms | 11.5ms | ~59ms† | 0% | 0 | ناجح |
| admin baseline | 5 | 3.5m | 1063 | 2.6ms | 6.4ms | ~48ms† | 0% | 0 | ناجح بالكامل |

\* الفشل = `http_req_failed` (يحسب 4xx). كلها `429` (أو `401` متوقعة في login) — **صفر `5xx` وصفر timeouts في كل التشغيلات (~50k طلب)**.
† ملخص k6 v2 الافتراضي لا يُصدر p99؛ القيمة ≈ الحد الأقصى المسجل (max).
‡ p50 المنخفض في login المحمّل لأن ردود `429` فورية (~0ms)؛ زمن الدخول الحقيقي يُقرأ من smoke (222ms) وp95 الطلبات المقبولة.

## 5. النتائج التفصيلية

- **العامة:** الطلبات المقبولة فائقة السرعة (p95 بين 2-6ms) حتى عند 44 طلب/ث (25 VUs). لا انهيار ولا تباطؤ مع الحمل — السقف الوحيد هو الـ throttle.
- **المحمية:** login مرة واحدة في `setup` وإعادة استخدام آمنة؛ `/auth/me` طابق نفس الـ id في كل التكرارات (**عزل الجلسة: 0 اختلاط**)؛ p95 ~4-6ms؛ صفر تسريب (فاحص `secret_leak`).
- **تسجيل الدخول:** صالح p95 ≈ 226ms (bcrypt — طبيعي)؛ خاطئ → `401` عامة بلا صدى لكلمة المرور؛ فوق ~100/دقيقة → `429` سريع؛ صفر `500`؛ صفر تسريب.
- **الإدارة (قراءة فقط):** baseline كاملة خضراء (100% checks، p95 6.4ms) — إيقاعها (نوم 0.4-1.2s) أبقاها تحت ميزانية الـ throttle.
- **Timeouts:** صفر في كل التشغيلات (مهلة 10-15s، أقصى زمن observed ~377ms لدخول ناجح).

## 6. الـ Thresholds (مبدئية per §9)

- ناجحة كما هي: `p95<1000` و`p99<2000` (مقبول) في **كل** التشغيلات؛ `server_errors==0` في كلها؛ `secret_leak==0`؛ `isolation==0`؛ `checks>95%` في (smoke×4 + admin-baseline).
- فاشلة **شكليًا** (تُفسَّر، لا تُعد عطلًا): `http_req_failed<1%` و`checks>95%` في الأحمال ≥5 VUs — السبب `429` متوقعة (و`401` متوقعة في login صُمم لها `rate<0.55`). الـ thresholds تقيس هنا سقف الـ throttle لا صحة التطبيق.

## 7. عنق الزجاجة: الـ Throttle (مؤكد، سلوك متوقع — ليس عطلًا)

- الإعداد: `ThrottlerModule (ttl 60s, limit 100)` + حدود أشد (`login 100/min`، `cart 30/min`، `checkout 10/min`، `contact 5/min`، `refresh 10/15min`، `change-pw 3/5min`).
- الآلية (من مصدر `@nestjs/throttler`): المفتاح = `sha256(Controller-handler + IP)` — أي **100 طلب/دقيقة لكل مسار لكل IP**، تُرجع `429` (لا `500`).
- أُثبت تجريبيًا (`diag-429`): `/products` + `/products?limit=5` (نفس المعالج) تجاوزا 100/دقيقة وحدهما (~51% `429`) بينما 7 مسارات أخرى 0% — ثم `/cart` (30/min) في سيناريو العميل.
- **تطبيق مقابل بيئة:** التطبيق نفسه سريع ومستقر (صفر `5xx` عند ~50k طلب) — السقف سقف **سياسة** لا قدرة. لكن بما أن k6 من IP واحد، أي نشر خلف NAT/CDN مشترك سيتقاسم المستخدمون الميزانية نفسها (مكتب/مدرسة قد يرى `429` على تصفح الكتالوج).
- **التوصيات:** (1) رفع حد قراءات الكتالوج العامة (300-600/min)؛ (2) مفتاح throttle بمعرف المستخدم الموثق عند توفره بدل IP وحده؛ (3) إبقاء الحدود الصارمة على المصادقة والتعديلات؛ (4) مراقبة معدل `429` في الإنتاج قبل التوسع.

## 8. الملفات المنشأة

- `tests/k6/config.js` (حارس localhost + المراحل + قوائم المسارات) — `public-read.js` — `authenticated-read.js` — `login.js` — `admin-read.js` — `diag-429.js` (تشخيص لكل-endpoint).
- `reports/k6/`: 13 ملخص JSON + 13 سجل (12 تشغيلًا + التشخيص) — بلا أسرار (فحص آلي CLEAN بعد تطهير `setup_data`: كتيّب k6 يُصدّر قيمة `setup()` في JSON، فحُذف كتلة `setup_data` (كانت تحوي توكن الجلسة) من 5 ملفات — درس موثق لأي إعادة تشغيل).
- هذا التقرير: `K6_LOAD_TEST_REPORT.md` (جذر المشروع).
- بيانات اختبار مؤقتة في `mjm_store_test` فقط: 3 عملاء `k6-*` (موثقة)؛ حساب المدير المؤقت **حُذف** بعد الاختبار (admin_users عاد 0)؛ الطلبات/المنتجات untouched (4/4).

## 9. أوامر إعادة التشغيل

```powershell
# من D:\mjm\MJM-main\tests\k6 — الخلفية على mwm_store_test، الأسرار عبر -e فقط:
$K6="C:\Users\mesba\AppData\Local\Temp\opencode\k6\k6.exe"
$K6 run -e STAGE=smoke --summary-export ..\..\reports\k6\public-read-smoke.json public-read.js
$K6 run -e STAGE=baseline -e TEST_USER_EMAIL=$E -e TEST_USER_PASSWORD=$P --summary-export ..\..\reports\k6\authenticated-read-baseline.json authenticated-read.js
$K6 run -e STAGE=smoke -e TEST_USER_EMAIL=$E -e TEST_USER_PASSWORD=$P --summary-export ..\..\reports\k6\login-smoke.json login.js
$K6 run -e STAGE=baseline -e ADMIN_EMAIL=$A -e ADMIN_PASSWORD=$W --summary-export ..\..\reports\k6\admin-read-baseline.json admin-read.js
# STAGE ∈ {smoke, baseline, medium, high, login-peak} — تسلسليًا فقط، بلا توازٍ.
```

## 10. التحقق النهائي

- [x] `K6_LOAD_TEST_REPORT.md` و`reports/k6/` موجودة؛ بلا كلمات مرور/JWT/cookies (فحص آلي).
- [x] localhost فقط (حارس في `config.js` يُجهض أي host آخر)؛ `mjm_store_test` فقط (E2E rows).
- [x] لا عمليات مدمرة (GET + login فقط)؛ لم يُعدَّل كود التطبيق (ملفات جديدة فقط).
- [x] كل مرحلة موثقة أعلاه؛ k6 فقط بلا أدوات أخرى.
