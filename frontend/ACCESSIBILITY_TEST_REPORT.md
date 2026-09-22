# تقرير اختبار إمكانية الوصول Accessibility — MJM Store (axe-core + Playwright)

**التاريخ:** 2026-09-20
**البيئة:** Windows (win32)، Playwright 1.63.0، ‏@axe-core/playwright 4.13.0، Chromium (Desktop Chrome)
**الخوادم (أُعيد استخدامها):** Backend `http://localhost:3001` + Frontend `http://localhost:3002`
**النطاق:** الخطوة الثانية فقط (axe-core). لم يُنفَّذ Lighthouse أو OWASP ZAP أو k6.

---

## 1) الملخص التنفيذي

| المؤشر | القيمة |
|---|---|
| إجمالي اختبارات إمكانية الوصول | **41** |
| ناجحة | **4** (اختبارات لوحة المفاتيح الأربعة) |
| فاشلة | **37** (كلها فشل `expectNoAxeViolations` — أي أن axe وجد مخالفات حقيقية، وليست أعطال تحميل) |
| مخالفات axe (قاعدة × صفحة، بدون تكرار) | **146** |
| عالية التأثير (critical + serious) | **61** (critical: 28، serious: 33) |
| متوسطة التأثير (moderate) | **63** |
| منخفضة التأثير (minor) | **22** |
| نتائج `incomplete` (مسجلة للمراجعة اليدوية، لا تُفشِل) | **29** |
| مخالفات خارجية (إعلانات/خدمات) | **0** |

> جميع الصفحات الـ 37 حُمّلت بنجاح (`HTTP < 400` + ظهور المحتوى الأساسي) قبل تشغيل axe — الفشل سببه مخالفات إمكانية وصول حقيقية في التطبيق، وليس مشكلة في الاختبار أو البيئة.

---

## 2) الأوامر المشغلة

```bash
# داخل MJM-main/frontend
npx tsc --noEmit   # فحص الأنواع للملفات الجديدة — ناجح بدون أخطاء
npx playwright test tests/accessibility --project=chromium --reporter=list
# النتيجة: 37 failed / 4 passed (~1.4m)
```

---

## 3) الملفات المنشأة / المعدلة

**منشأة جديدة (5):**

```
tests/helpers/accessibility.ts                      # helper مشترك: runAxeAudit + expectNoAxeViolations
tests/accessibility/public-accessibility.spec.ts    # 16 صفحة عامة
tests/accessibility/admin-accessibility.spec.ts     # 13 صفحة إدارية (جلسة محفوظة)
tests/accessibility/auth-accessibility.spec.ts      # 8 اختبارات مركزة
tests/accessibility/keyboard-navigation.spec.ts     # 4 اختبارات لوحة مفاتيح
```

**معدلة:** لا شيء. `playwright.config.ts` لم يُمس، ولا اختبار سابق حُذف أو عُدّل، ومنطق التطبيق لم يُمس إطلاقًا (لا إصلاحات في هذه المرحلة).

**ملاحظة بيانات:** اختبار `focused:checkout` أنشأ مستخدم اختبار فريدًا واحدًا عبر API (نمط `ensureCustomerSession` نفسه المستخدم في الحزمة الحالية) لعرض صفحة checkout فقط — **دون إرسال أي طلب أو دفع**. كل اختبارات contact/custom-printing/cart عُرضت فقط دون إرسال فعلي، والسلة أُعيد تعيينها إلى `[]` بعد الاختبار.

---

## 4) جدول المخالفات (146: الصفحة | المخالفة | التأثير | العنصر المتأثر | حالة المعالجة)

`n=X` = عدد العقد المتأثرة بنفس القاعدة في الصفحة. العنصر المعروض هو الأول + النمط العام.

### 4.1 صفحات الإدارة (30 مخالفة — جلسة `playwright/.auth/admin.json`، بدون تسجيل دخول متكرر)

| الصفحة | المخالفة | التأثير | العنصر المتأثر | حالة المعالجة |
|---|---|---|---|---|
| /admin | button-name — أزرار بلا نص مميز | critical | `.px-2 > button` (n=1، زر أيقونة الشريط الجانبي) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin | color-contrast — تباين ألوان دون حد WCAG AA | serious | `.text-secondary` في العنوان + نصوص رمادية (n=11) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin | heading-order — تسلسل عناوين غير صحيح | moderate | `.justify-between.items-center.flex > h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/bundles | button-name | critical | `.px-2 > .w-10.h-10.rounded-xl` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/bundles | color-contrast | serious | `.text-secondary` + روابط التنقل الرمادية (n=15) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/categories | button-name | critical | أزرار إجراء الصفوف (تعديل/حذف أيقونية، n=11) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/categories | color-contrast | serious | `.text-secondary` + روابط التنقل (n=19) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/cms | button-name | critical | `.px-2 > .w-10.h-10.rounded-xl` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/cms | color-contrast | serious | `.text-secondary` + روابط التنقل (n=21) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/cms | heading-order | moderate | `h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/invoices | button-name | critical | زر الشريط + `.hover:bg-primary` (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/invoices | color-contrast | serious | `.text-secondary` + روابط التنقل (n=24) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/offers | button-name | critical | `.px-2 > .w-10.h-10.rounded-xl` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/offers | color-contrast | serious | `.text-secondary` + روابط التنقل (n=15) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/orders | button-name | critical | `.px-2 > .w-10.h-10.rounded-xl` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/orders | color-contrast | serious | `.text-secondary` + روابط التنقل (n=17) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/products | button-name | critical | أزرار إجراء الصفوف الأيقونية (n=11) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/products | color-contrast | serious | `.text-secondary` + نصوص رمادية (n=11) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/requests | button-name | critical | `.justify-between > .w-10.h-10.rounded-xl` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/requests | color-contrast | serious | `.text-secondary` + روابط التنقل (n=16) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/requests | heading-order | moderate | `h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/settings | button-name | critical | أزرار التبديل/الإعدادات بلا اسم (n=7) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/settings | color-contrast | serious | `.text-secondary` + روابط التنقل (n=26) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/settings | label — حقول إدخال بلا label | critical | حقول `input[type=text]` للإعدادات (n=4) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/shipping | button-name | critical | `.px-2 > .w-10.h-10.rounded-xl` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/shipping | color-contrast | serious | `.text-secondary` + روابط التنقل (n=20) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/staff | button-name | critical | زر الشريط + أزرار أيقونية (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/staff | color-contrast | serious | `.text-secondary` + روابط التنقل (n=24) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/users | button-name | critical | `.w-10.h-10.hover:text-primary` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /admin/users | color-contrast | serious | `.text-secondary` + نصوص رمادية (n=22) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |

### 4.2 الاختبارات المركزة (33 مخالفة — قراءة فقط، دون إرسال)

| الصفحة | المخالفة | التأثير | العنصر المتأثر | حالة المعالجة |
|---|---|---|---|---|
| /cart (مركز) | color-contrast | serious | `h1 > .text-secondary` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /cart (مركز) | heading-order | moderate | `div:nth-child(2) > h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /cart (مركز) | image-redundant-alt — نص بديل مكرر كنص | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /cart (مركز) | region — محتوى خارج landmarks | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /checkout (دون إرسال طلب) | button-name | critical | `.inset-y-0.left-4.hover:text-primary` زر إظهار كلمة المرور (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /checkout (دون إرسال طلب) | heading-order | moderate | `div:nth-child(2) > h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /checkout (دون إرسال طلب) | region | moderate | `.right-full` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /contact (دون إرسال) | color-contrast | serious | `.mb-4` + `h1 > .text-secondary` + بطاقات (n=9) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /contact (دون إرسال) | heading-order | moderate | `.gap-4.items-center.flex > .text-2xl.tracking-tight` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /contact (دون إرسال) | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /contact (دون إرسال) | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /custom-printing (دون إرسال) | color-contrast | serious | `h1 > .text-secondary` + ملصق الرفع (n=5) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /custom-printing (دون إرسال) | heading-order | moderate | `h4` مسبوقًا بغير `h3` (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /custom-printing (دون إرسال) | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /custom-printing (دون إرسال) | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login (مركز) | button-name | critical | زر إظهار كلمة المرور (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login (مركز) | color-contrast | serious | `h1 > .text-secondary` + `#email` + ملصق كلمة المرور (n=4) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login (مركز) | heading-order | moderate | `div:nth-child(2) > h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login (مركز) | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login (مركز) | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| / (قائمة الجوال مفتوحة) | button-name | critical | أزرار المنتجات الأيقونية خلف القائمة (n=18) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| / (قائمة الجوال مفتوحة) | link-name — روابط بلا نص مميز | serious | `.sm:px-5` + `.bottom-24` (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| / (قائمة الجوال مفتوحة) | region | moderate | عناصر القائمة/التراكب (n=6) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /products/5 (منتج حقيقي) | button-name | critical | أزرار المفضلة/السلة الأيقونية (n=12) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /products/5 (منتج حقيقي) | color-contrast | serious | روابط التصنيف + `.text-secondary` (n=12) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /products/5 (منتج حقيقي) | heading-order | moderate | `h4` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /products/5 (منتج حقيقي) | image-redundant-alt | minor | `.p-1` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /products/5 (منتج حقيقي) | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register (مركز) | button-name | critical | `.inset-y-0` زر إظهار كلمة المرور (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register (مركز) | color-contrast | serious | روابط التبديل/النصوص (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register (مركز) | heading-order | moderate | `div:nth-child(2) > h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register (مركز) | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register (مركز) | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |

### 4.3 الصفحات العامة (83 مخالفة)

| الصفحة | المخالفة | التأثير | العنصر المتأثر | حالة المعالجة |
|---|---|---|---|---|
| / | button-name | critical | أزرار المنتجات/الأسهم الأيقونية (n=18) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| / | color-contrast | serious | `.text-base` + `.text-accent > span` + `#search-query` (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| / | image-redundant-alt | minor | `img[alt="MJM Store"]` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| / | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /about | color-contrast | serious | `.tracking-[0.3em]` + `.italic.text-secondary` + `cite` (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /about | heading-order | moderate | `h3`/`h4` متخطاة (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /about | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /about | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login | button-name | critical | زر إظهار كلمة المرور (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login | color-contrast | serious | `h1 > .text-secondary` + `#email` + `#password` (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login | heading-order | moderate | `div:nth-child(2) > h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/login | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register | button-name | critical | زر إظهار كلمة المرور (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register | color-contrast | serious | روابط التبديل/النصوص (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register | heading-order | moderate | `div:nth-child(2) > h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /auth/register | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /bundles | color-contrast | serious | `.bg-secondary/10` + `.text-2xl` + `.pt-8 > p` (n=7) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /bundles | heading-order | moderate | `div:nth-child(2) > h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /bundles | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /bundles | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /cart | color-contrast | serious | `h1 > .text-secondary` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /cart | heading-order | moderate | `div:nth-child(2) > h3` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /cart | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /cart | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | button-name | critical | أزرار المفضلة/السلة الأيقونية (n=11) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | color-contrast | serious | `.text-accent > span` + `.text-slate-300` (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | heading-order | moderate | عنوان الفرز (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | image-redundant-alt | minor | `img[alt="MJM Store"]` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | label | critical | `.accent-primary` مربع اختيار الفلتر بلا label (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | landmark-main-is-top-level — main متداخل | moderate | `.space-y-12` (راجع `src/app/(site)/shop/page.tsx:269` داخل `site-chrome.tsx:28`) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | landmark-no-duplicate-main — أكثر من main | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | landmark-unique — landmarks غير مميزة | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /categories | select-name — قائمة فرز بلا اسم | critical | `select` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /contact | color-contrast | serious | `.mb-4` + `h1 > .text-secondary` + بطاقات (n=9) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /contact | heading-order | moderate | عنوان الأيقونة (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /contact | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /contact | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /custom-printing | color-contrast | serious | `h1 > .text-secondary` + ملصق الرفع (n=5) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /custom-printing | heading-order | moderate | `h4` مسبوقًا بغير `h3` (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /custom-printing | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /custom-printing | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /faq | color-contrast | serious | `.text-accent > span` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /faq | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /faq | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /privacy | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /privacy | landmark-main-is-top-level | moderate | `.py-28 > main` (راجع `src/components/PolicyLayout.tsx:64` داخل landmark) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /privacy | landmark-no-duplicate-main | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /privacy | landmark-unique | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /privacy | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /returns | color-contrast | serious | عناوين الأقسام/البطاقات (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /returns | heading-order | moderate | `h4` + `.mb-2` (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /returns | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /returns | landmark-main-is-top-level | moderate | `.py-28 > main` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /returns | landmark-no-duplicate-main | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /returns | landmark-unique | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /returns | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shipping | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shipping | landmark-main-is-top-level | moderate | `.py-28 > main` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shipping | landmark-no-duplicate-main | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shipping | landmark-unique | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shipping | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | button-name | critical | أزرار المفضلة/السلة الأيقونية + زر الصعود (n=11) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | color-contrast | serious | `.text-accent > span` + `.text-slate-300` (n=2) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | heading-order | moderate | عنوان الفرز (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | image-redundant-alt | minor | `img[alt="MJM Store"]` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | label | critical | `.accent-primary` مربع اختيار الفلتر بلا label (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | landmark-main-is-top-level | moderate | `.space-y-12` (`shop/page.tsx:269` داخل `site-chrome.tsx:28`) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | landmark-no-duplicate-main | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | landmark-unique | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /shop | select-name | critical | `select` الفرز بلا اسم (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /terms | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /terms | landmark-main-is-top-level | moderate | `.py-28 > main` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /terms | landmark-no-duplicate-main | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /terms | landmark-unique | moderate | `.flex-grow` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /terms | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /water-subscriptions | color-contrast | serious | `h2 > .text-secondary` + أسعار رمادية (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /water-subscriptions | heading-order | moderate | `.text-xl` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /water-subscriptions | image-redundant-alt | minor | `img` (n=1) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |
| /water-subscriptions | region | moderate | شريط علوي/زر عائم (n=3) | مشكلة حقيقية في التطبيق — لم تُصلح بعد |

> روابط الإصلاح لكل قاعدة: `https://dequeuniversity.com/rules/axe/4.13/<rule-id>?application=playwright` (مسجلة لكل مخالفة في سجل الاختبار).

---

## 5) نتائج `incomplete` — تحتاج مراجعة يدوية (29، لا تُفشِل الاختبار)

| الاختبار/الصفحة | القاعدة | التأثير | التصنيف |
|---|---|---|---|
| 26 صفحة (كل الصفحات العامة + المركزة + `/admin/bundles` + `/admin/offers` + 3 إدارية) | color-contrast — عناصر لم يستطع axe حسم تباينها آليًا (خلفيات متدرجة/شفافة) | serious | نتيجة تحتاج مراجعة يدوية |
| /admin/bundles، /admin/offers | th-has-data-cells — خلايا `th` في جداول فارغة/جزئية | serious | نتيجة تحتاج مراجعة يدوية (مرتبطة بحالة البيانات) |
| / (قائمة الجوال مفتوحة) | duplicate-id-aria — قيمة `id` مستخدمة في ARIA مكررة | critical | نتيجة تحتاج مراجعة يدوية |

التسع صفحات الإدارية (`/admin`، `/admin/cms`، `/admin/orders`، `/admin/products`، `/admin/requests`، `/admin/settings`، `/admin/shipping`، `/admin/staff`، `/admin/users`) سجلت **صفر** `incomplete`.

---

## 6) اختبارات لوحة المفاتيح (4/4 ناجحة)

| الاختبار | النتيجة |
|---|---|
| حقول تسجيل الدخول reachable عبر Tab مع انتقال التركيز + زر الإرسال visible | ناجح |
| الأزرار الأساسية reachable في الرئيسية (header + CTA) مع `toBeFocused` | ناجح |
| قائمة الجوال تفتح بـ Enter وتغلق بـ Escape/Enter مع `aria-expanded` | ناجح |
| Escape يغلق الـ popup إن وُجد (لا dialog في الرئيسية — سُجل كملاحظة `keyboard-note` وتجاوز) | ناجح |

---

## 7) التصنيف النهائي — التطبيق أم الاختبار؟

**الخلاصة: جميع المخالفات الـ 146 مشاكل حقيقية في التطبيق، ولا توجد مخالفة ناتجة عن اختبار غير صحيح أو عنصر خارجي أو بيئة.**

| الفئة | العدد | الدليل |
|---|---|---|
| مشكلة حقيقية في التطبيق — لم تُصلح بعد | 146 | أدناه |
| مخالفة ناتجة عن اختبار غير صحيح | 0 | كل صفحة حُمّلت (`HTTP<400`) وانتُظر محتواها الأساسي (`main h1/h2/form/button`) قبل الفحص؛ القواعد الافتراضية فقط؛ لا `disableRules`؛ لا `waitForTimeout` |
| عنصر خارجي | 0 | `externalNoteCount = 0` في كل الـ 37 فحصًا (الـ helper يخفض الخارجية لملاحظات تلقائيًا ولم يجد أيًا) |
| مشكلة بيانات أو بيئة | 0 | استُخدم منتج/تصنيف حقيقي من الـ API للصفحات الديناميكية؛ لا صفحات خطأ مفحوصة |
| نتيجة تحتاج مراجعة يدوية | 29 | جدول §5 |
| مشكلة تم إصلاحها / لم تُصلح بعد | 0 / 146 | **لم يُصلَح أي كود في هذه المرحلة** حسب المطلوب |

**تحليل الأنماط المتكررة (أولوية الإصلاح المقترحة):**

1. **color-contrast (32 صفحة، serious):** رمز اللون `.text-secondary` والنصوص الرمادية (`text-gray-400/500`، `text-slate-300`) على خلفيات فاتحة — مشكلة Design Token عامة. أعلى أولوية مع `button-name`.
2. **button-name (23 فحصًا، critical):** أزرار أيقونية بلا اسم مميز (مفضلة/سلة/إظهار كلمة المرور/إجراءات الجداول/زر الشريط الجانبي `.px-2 > button`) — تحتاج `aria-label`.
3. **region (24 فحصًا، moderate) + landmark الثلاثية (6 صفحات):** محتوى خارج الـ landmarks (شريط علوي `.sm:inline-flex`، زر عائم `.right-full`/`.bottom-10`)، و`<main>` متداخلة/مكررة مؤكدة في الكود: `site-chrome.tsx:20,28` يغلّف الصفحات بـ `<main>` بينما `shop/page.tsx:269` و`profile/page.tsx:374` و`PolicyLayout.tsx:64` تُنشئ `<main>` داخلية.
4. **heading-order (21 فحصًا، moderate):** مستويات متخطاة (`h3` مباشرة بعد `h1` عبر `div:nth-child(2) > h3`، و`h4` بلا `h3`).
5. **image-redundant-alt (22 فحصًا، minor):** صورة الشعار `img[alt="MJM Store"]` يتكرر نصها بجانبها.
6. **label/select-name (critical، في `/shop` و`/categories` و`/admin/settings`):** مربع `.accent-primary` وقائمة `select` الفرز وحقول الإعدادات بلا `label` — حرجة رغم قلة عددها.
7. **link-name (serious، القائمة المفتوحة):** رابطان بلا نص (`.sm:px-5`، `.bottom-24`).

---

## 8) معايير القبول — الحالة

- [x] تشغيل axe-core بنجاح مع Playwright (37 فحصًا أنتج JSON كاملًا + 4 اختبارات لوحة مفاتيح)
- [x] فحص الصفحات العامة الأساسية (16/16)
- [x] فحص صفحات الإدارة (13/13) باستخدام الجلسة المحفوظة `playwright/.auth/admin.json` (تسجيل الدخول تم مرة واحدة في `global-setup` فقط)
- [x] عدم وجود تسجيل دخول متكرر قبل كل اختبار
- [x] عدم تنفيذ عمليات مدمرة أو إنشاء بيانات حقيقية (لا طلب/شراء/حذف؛ النماذج عُرضت فقط)
- [x] توثيق جميع المخالفات بدل إخفائها (146 موثقة + 29 للمراجعة + 0 مستثناة)
- [x] إنشاء تقرير `ACCESSIBILITY_TEST_REPORT.md`
- [ ] إصلاح الكود — **خارج نطاق هذه الخطوة** (مؤجل للخطوة التالية)

---

## 9) الإجابات المطلوبة

1. **عدد الاختبارات:** 41 (16 عامة + 13 إدارية + 8 مركزة + 4 لوحة مفاتيح).
2. **الناجحة:** 4 (لوحة المفاتيح فقط).
3. **الفاشلة:** 37 — كلها كشفت مخالفات axe حقيقية (لا أعطال تحميل: كل صفحة أعادت `HTTP < 400` وعرضت محتواها الأساسي).
4. **عدد مخالفات axe:** 146 (قاعدة × صفحة).
5. **عالية ومتوسطة التأثير:** عالية 61 (critical 28 + serious 33)، متوسطة 63 (moderate)، منخفضة 22 (minor).
6. **الملفات المنشأة/المعدلة:** 5 ملفات جديدة (§3) — لا ملفات معدلة، لا حذف، لا تغيير في `playwright.config.ts` أو كود التطبيق.
7. **التطبيق أم الاختبار:** التطبيق — 146/146 مشاكل حقيقية (الأدلة في §7)، 0 أخطاء اختبار، 0 عناصر خارجية، 29 نتيجة للمراجعة اليدوية.
8. **الأوامر:** `npx tsc --noEmit` ثم `npx playwright test tests/accessibility --project=chromium --reporter=list` (من `MJM-main/frontend`).
9. **التقرير:** هذا الملف `frontend/ACCESSIBILITY_TEST_REPORT.md` (+ سجلات JSON الكاملة في مخرجات الاختبار و`trace/screenshot/video` عند الفشل).
